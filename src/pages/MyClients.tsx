import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Home,
  ShoppingBag,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { supabase } from '@/src/lib/supabase';
import { formatCurrency } from '@/src/lib/currency';

interface Client {
  id: string;
  application_number: string;
  client_name: string;
  client_nida: string;
  client_phone?: string;
  client_email?: string;
  client_type: 'tenant' | 'buyer';
  agreement_type: 'rent' | 'sale';
  property_type?: string;
  property_location: string;
  monthly_rent?: number;
  sale_price?: number;
  payment_period?: number;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'expired' | 'pending' | 'rejected';
  agreement_status?: string;
  created_at: string;
  form_data: any;
}

export function MyClients() {
  const { lang, currency } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tenant' | 'buyer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch clients (tenants/buyers) from applications
  const fetchClients = async () => {
    if (!user) return;
    
    try {
      // Fetch applications where user is the owner/landlord (submitted by user)
      // and service is PANGISHA (rent) or Mauziano (sale)
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          form_data,
          status,
          agreement_status,
          created_at,
          services (
            id,
            name,
            name_en
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['submitted', 'approved', 'pending_payment', 'paid', 'issued'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for PANGISHA/Mauziano services client-side
      const filteredApps = (applications || []).filter((app: any) => {
        const serviceName = app.services?.name || '';
        return serviceName.includes('PANGISHA') || serviceName.includes('Mauziano');
      });

      // Transform applications to clients
      const clientsList: Client[] = filteredApps.map((app: any) => {
        const isRent = app.services?.name?.includes('PANGISHA');
        const isSale = app.services?.name?.includes('Mauziano');
        const formData = app.form_data || {};

        // Determine if current user is landlord/seller (they submitted the app)
        // The tenant/buyer info is in form_data
        let clientName = '';
        let clientNida = '';
        let clientPhone = '';
        
        if (isRent) {
          // For rent agreements, tenant info
          clientName = formData.tenant_name || '';
          clientNida = formData.tenant_nida || '';
          clientPhone = formData.tenant_phone || '';
        } else if (isSale) {
          // For sale agreements, buyer info
          clientName = formData.buyer_name || '';
          clientNida = formData.buyer_nida || '';
          clientPhone = formData.buyer_phone || '';
        }

        // Calculate agreement dates
        const createdDate = new Date(app.created_at);
        const paymentPeriod = parseInt(formData.payment_period) || 12;
        const startDate = formData.rental_start_date || formData.agreement_date || app.created_at;
        const endDate = formData.rental_end_date || 
          new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + paymentPeriod)).toISOString();

        // Determine status
        let clientStatus: 'active' | 'expired' | 'pending' | 'rejected' = 'pending';
        if (app.status === 'rejected') {
          clientStatus = 'rejected';
        } else if (app.status === 'issued' || app.status === 'paid') {
          if (new Date(endDate) < new Date()) {
            clientStatus = 'expired';
          } else {
            clientStatus = 'active';
          }
        } else if (app.agreement_status === 'approved') {
          clientStatus = 'active';
        }

        return {
          id: app.id,
          application_number: app.application_number,
          client_name: clientName,
          client_nida: clientNida,
          client_phone: clientPhone,
          client_type: isRent ? 'tenant' : 'buyer',
          agreement_type: isRent ? 'rent' : 'sale',
          property_type: formData.property_type || formData.asset_type,
          property_location: [
            formData.house_number || formData.plot_number,
            formData.street,
            formData.ward,
            formData.district,
            formData.region
          ].filter(Boolean).join(', '),
          monthly_rent: parseFloat(formData.monthly_rent) || 0,
          sale_price: parseFloat(formData.sale_price) || 0,
          payment_period: paymentPeriod,
          start_date: startDate,
          end_date: endDate,
          status: clientStatus,
          agreement_status: app.agreement_status,
          created_at: app.created_at,
          form_data: formData
        } as Client;
      }).filter(client => client.client_name); // Only include if there's a client name

      setClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast(
        lang === 'sw' ? 'Imeshindwa kupakia wateja' : 'Failed to load clients',
        'error'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClients();
  };

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_nida.includes(searchTerm) ||
        client.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.property_location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || client.client_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, searchTerm, typeFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const tenants = clients.filter(c => c.client_type === 'tenant');
    const buyers = clients.filter(c => c.client_type === 'buyer');
    const active = clients.filter(c => c.status === 'active');
    const totalRent = tenants.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
    
    return {
      totalClients: clients.length,
      tenants: tenants.length,
      buyers: buyers.length,
      active: active.length,
      totalRent
    };
  }, [clients]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      active: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700', 
        icon: CheckCircle,
        label: lang === 'sw' ? 'Hai' : 'Active'
      },
      expired: { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        icon: XCircle,
        label: lang === 'sw' ? 'Imekwisha' : 'Expired'
      },
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        icon: Clock,
        label: lang === 'sw' ? 'Inasubiri' : 'Pending'
      },
      rejected: { 
        bg: 'bg-stone-100', 
        text: 'text-stone-600', 
        icon: AlertCircle,
        label: lang === 'sw' ? 'Imekataliwa' : 'Rejected'
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-emerald-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-stone-800">
              {lang === 'sw' ? 'Wapangaji / Wateja Wangu' : 'My Tenants / Customers'}
            </h2>
            <p className="text-stone-500 text-sm">
              {lang === 'sw' 
                ? 'Orodha ya wapangaji na wateja wako kutoka makubaliano'
                : 'List of your tenants and customers from agreements'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stats.totalClients}</p>
              <p className="text-xs text-stone-500">{lang === 'sw' ? 'Jumla' : 'Total'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stats.tenants}</p>
              <p className="text-xs text-stone-500">{lang === 'sw' ? 'Wapangaji' : 'Tenants'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stats.buyers}</p>
              <p className="text-xs text-stone-500">{lang === 'sw' ? 'Wanunuzi' : 'Buyers'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stats.active}</p>
              <p className="text-xs text-stone-500">{lang === 'sw' ? 'Hai' : 'Active'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              id="search-clients"
              placeholder={lang === 'sw' ? 'Tafuta kwa jina, NIDA, au eneo...' : 'Search by name, NIDA, or location...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <select 
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              aria-label={lang === 'sw' ? 'Chuja kwa aina' : 'Filter by type'}
              className="pl-10 pr-8 h-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">{lang === 'sw' ? 'Aina Zote' : 'All Types'}</option>
              <option value="tenant">{lang === 'sw' ? 'Wapangaji' : 'Tenants'}</option>
              <option value="buyer">{lang === 'sw' ? 'Wanunuzi' : 'Buyers'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select 
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label={lang === 'sw' ? 'Chuja kwa hali' : 'Filter by status'}
              className="px-4 h-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">{lang === 'sw' ? 'Hali Zote' : 'All Status'}</option>
              <option value="active">{lang === 'sw' ? 'Hai' : 'Active'}</option>
              <option value="pending">{lang === 'sw' ? 'Inasubiri' : 'Pending'}</option>
              <option value="expired">{lang === 'sw' ? 'Imekwisha' : 'Expired'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-stone-200 text-center">
          <Users className="mx-auto text-stone-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">
            {lang === 'sw' ? 'Hakuna wateja' : 'No clients found'}
          </h3>
          <p className="text-stone-500 text-sm">
            {lang === 'sw' 
              ? 'Wateja wataonekana hapa baada ya kusajili makubaliano ya pango au mauzo'
              : 'Clients will appear here after registering rent or sale agreements'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Client Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      client.client_type === 'tenant' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {client.client_type === 'tenant' ? (
                        <Home className="text-blue-600" size={24} />
                      ) : (
                        <ShoppingBag className="text-purple-600" size={24} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-800">{client.client_name}</h3>
                        {getStatusBadge(client.status)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {client.client_nida}
                        </span>
                        {client.client_phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {client.client_phone}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          client.client_type === 'tenant' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {client.client_type === 'tenant' 
                            ? (lang === 'sw' ? 'Mpangaji' : 'Tenant')
                            : (lang === 'sw' ? 'Mnunuzi' : 'Buyer')
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2 text-sm text-stone-500">
                        <MapPin size={14} />
                        <span>{client.property_location || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Details */}
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-right">
                      {client.agreement_type === 'rent' && client.monthly_rent ? (
                        <div>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatCurrency(client.monthly_rent, currency)}
                          </span>
                          <span className="text-sm text-stone-500">/{lang === 'sw' ? 'mwezi' : 'month'}</span>
                        </div>
                      ) : client.sale_price ? (
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(client.sale_price, currency)}
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Calendar size={12} />
                      <span>{formatDate(client.start_date)}</span>
                      <span>-</span>
                      <span>{formatDate(client.end_date)}</span>
                    </div>
                    
                    <button
                      onClick={() => setSelectedClient(client)}
                      aria-label={lang === 'sw' ? 'Angalia maelezo' : 'View details'}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Eye size={14} />
                      {lang === 'sw' ? 'Angalia' : 'View'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Footer with application number */}
              <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-stone-500">
                  <FileText size={12} />
                  {client.application_number}
                </span>
                <span className="text-xs text-stone-400">
                  {lang === 'sw' ? 'Ilisajiliwa' : 'Registered'}: {formatDate(client.created_at)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-800">
                {lang === 'sw' ? 'Maelezo ya Mteja' : 'Client Details'}
              </h3>
              <button
                onClick={() => setSelectedClient(null)}
                aria-label={lang === 'sw' ? 'Funga' : 'Close'}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Header */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  selectedClient.client_type === 'tenant' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {selectedClient.client_type === 'tenant' ? (
                    <Home className="text-blue-600" size={32} />
                  ) : (
                    <ShoppingBag className="text-purple-600" size={32} />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-800">{selectedClient.client_name}</h4>
                  <p className="text-stone-500">{selectedClient.client_nida}</p>
                  {getStatusBadge(selectedClient.status)}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                <h5 className="font-semibold text-stone-700 text-sm">
                  {lang === 'sw' ? 'Mawasiliano' : 'Contact Info'}
                </h5>
                {selectedClient.client_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-stone-400" size={16} />
                    <span className="text-stone-600">{selectedClient.client_phone}</span>
                  </div>
                )}
                {selectedClient.client_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-stone-400" size={16} />
                    <span className="text-stone-600">{selectedClient.client_email}</span>
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                <h5 className="font-semibold text-stone-700 text-sm">
                  {lang === 'sw' ? 'Taarifa za Mali' : 'Property Info'}
                </h5>
                <div className="flex items-center gap-3">
                  <MapPin className="text-stone-400" size={16} />
                  <span className="text-stone-600">{selectedClient.property_location}</span>
                </div>
                {selectedClient.property_type && (
                  <div className="flex items-center gap-3">
                    <Home className="text-stone-400" size={16} />
                    <span className="text-stone-600">{selectedClient.property_type}</span>
                  </div>
                )}
              </div>

              {/* Agreement Details */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                <h5 className="font-semibold text-stone-700 text-sm">
                  {lang === 'sw' ? 'Makubaliano' : 'Agreement Details'}
                </h5>
                
                {selectedClient.agreement_type === 'rent' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{lang === 'sw' ? 'Kodi ya Mwezi' : 'Monthly Rent'}:</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(selectedClient.monthly_rent || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{lang === 'sw' ? 'Muda (Miezi)' : 'Period (Months)'}:</span>
                      <span className="font-medium text-stone-700">
                        {selectedClient.payment_period || '-'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-stone-500">{lang === 'sw' ? 'Bei ya Mauzo' : 'Sale Price'}:</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(selectedClient.sale_price || 0, currency)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-stone-500">{lang === 'sw' ? 'Tarehe ya Kuanza' : 'Start Date'}:</span>
                  <span className="font-medium text-stone-700">{formatDate(selectedClient.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{lang === 'sw' ? 'Tarehe ya Mwisho' : 'End Date'}:</span>
                  <span className="font-medium text-stone-700">{formatDate(selectedClient.end_date)}</span>
                </div>
              </div>

              {/* Application Info */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">{lang === 'sw' ? 'Namba ya Maombi' : 'Application No'}:</span>
                  <span className="font-mono text-stone-700">{selectedClient.application_number}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
