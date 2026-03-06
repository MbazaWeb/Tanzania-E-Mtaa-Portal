import { useState, useEffect } from 'react';
import { supabase, Application, UserProfile } from '@/src/lib/supabase';

export function useApplications(user: UserProfile | null) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

    if (!isConfigured || user.id.startsWith('demo-')) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      // Filter for current user and add mock service data
      const userApps = demoApps
        .filter((app: any) => app.user_id === user.id)
        .map((app: any) => ({
          ...app,
          services: { name: app.service_name || 'Service' }
        }));
      setApplications(userApps);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*, services(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    } else {
      setApplications([]);
    }
  }, [user]);

  return { applications, loading, fetchApplications, setApplications };
}
