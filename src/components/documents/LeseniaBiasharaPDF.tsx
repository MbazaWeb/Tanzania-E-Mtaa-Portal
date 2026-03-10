/**
 * Leseni ya Biashara Ndogondogo PDF
 * Petty Trader License
 * 
 * Service: Leseni ya Biashara Ndogondogo
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/src/constants/logo';

// Additional styles for license
const licenseStyles = StyleSheet.create({
  licenseBadge: {
    backgroundColor: '#7c3aed',
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  licenseNumber: {
    backgroundColor: '#f3e8ff',
    padding: 15,
    marginVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  licenseLabel: {
    fontSize: 10,
    color: '#6b21a8',
    marginBottom: 5,
  },
  licenseCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b21a8',
    fontFamily: 'Courier',
  },
  validityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  validityItem: {
    alignItems: 'center',
  },
  validityLabel: {
    fontSize: 8,
    color: '#78716c',
    marginBottom: 3,
  },
  validityValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1c1917',
  },
});

export const LeseniaBiasharaPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Leseni ya Biashara Ndogondogo');

  // Business type labels
  const businessTypeLabels: Record<string, { sw: string; en: string }> = {
    'CHAKULA': { sw: 'Chakula (Mama Lishe)', en: 'Food Vendor' },
    'BIDHAA': { sw: 'Bidhaa Ndogondogo', en: 'Small Goods' },
    'HUDUMA': { sw: 'Huduma (Kerekere, n.k.)', en: 'Services' },
    'NYINGINEZO': { sw: 'Nyinginezo', en: 'Other' },
  };

  const getBusinessTypeLabel = (type: string): string => {
    const label = businessTypeLabels[type];
    if (label) return lang === 'sw' ? label.sw : label.en;
    return type;
  };

  // Calculate validity dates
  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const labels = {
    sw: {
      title: 'LESENI YA BIASHARA NDOGONDOGO',
      subtitle: 'PETTY TRADER LICENSE',
      licenseGranted: 'LESENI IMEIDHINISHWA',
      licenseNo: 'Namba ya Leseni',
      businessInfo: 'TAARIFA ZA BIASHARA',
      ownerInfo: 'TAARIFA ZA MMILIKI',
      businessName: 'Jina la Biashara',
      businessType: 'Aina ya Biashara',
      location: 'Eneo la Biashara',
      name: 'Jina Kamili',
      nida: 'NIDA',
      citizenId: 'Namba ya Raia',
      tin: 'TIN',
      phone: 'Simu',
      issueDate: 'Tarehe ya Kutolewa',
      expiryDate: 'Tarehe ya Kuisha',
      validity: 'Mwaka 1',
      ownerSig: 'Sahihi ya Mmiliki',
      officerSig: 'Afisa wa Biashara',
      footer: 'Leseni hii ni halali kwa mwaka mmoja tangu tarehe ya kutolewa.',
    },
    en: {
      title: 'PETTY TRADER LICENSE',
      subtitle: 'LESENI YA BIASHARA NDOGONDOGO',
      licenseGranted: 'LICENSE GRANTED',
      licenseNo: 'License Number',
      businessInfo: 'BUSINESS INFORMATION',
      ownerInfo: 'OWNER INFORMATION',
      businessName: 'Business Name',
      businessType: 'Business Type',
      location: 'Business Location',
      name: 'Full Name',
      nida: 'NIDA',
      citizenId: 'Citizen ID',
      tin: 'TIN',
      phone: 'Phone',
      issueDate: 'Issue Date',
      expiryDate: 'Expiry Date',
      validity: '1 Year',
      ownerSig: 'Owner Signature',
      officerSig: 'Business Officer',
      footer: 'This license is valid for one year from the date of issue.',
    }
  };

  const t = labels[lang];

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Text style={commonStyles.watermark}>E-MTAA</Text>

        {/* Photo Box */}
        <View style={commonStyles.photoSection}>
          <View style={commonStyles.photoBox}>
            {user?.photo_url ? (
              <Image src={user.photo_url} style={commonStyles.photo} />
            ) : (
              <Text style={commonStyles.photoPlaceholder}>PICHA{'\n'}PHOTO</Text>
            )}
          </View>
          <Text style={commonStyles.nidaLabel}>{t.citizenId}</Text>
          <Text style={commonStyles.nidaNumber}>{user?.citizen_id || 'N/A'}</Text>
        </View>

        {/* Header */}
        <View style={commonStyles.header}>
          <Image src={TANZANIA_LOGO_BASE64} style={commonStyles.logo} />
          <Text style={commonStyles.country}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
          <Text style={commonStyles.office}>OFISI YA RAIS - TAMISEMI</Text>
          <View style={commonStyles.divider} />
        </View>

        {/* Title */}
        <Text style={commonStyles.title}>{t.title}</Text>

        {/* License Badge */}
        <View style={licenseStyles.licenseBadge}>
          <Text style={licenseStyles.badgeText}>✓ {t.licenseGranted}</Text>
        </View>

        {/* License Number */}
        <View style={licenseStyles.licenseNumber}>
          <Text style={licenseStyles.licenseLabel}>{t.licenseNo}</Text>
          <Text style={licenseStyles.licenseCode}>{application.application_number}</Text>
        </View>

        {/* Business Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.businessInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.businessName}:</Text>
          <Text style={commonStyles.infoValue}>{formData.business_name || formatFullName(user)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.businessType}:</Text>
          <Text style={commonStyles.infoValue}>{getBusinessTypeLabel(formData.business_type)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.location}:</Text>
          <Text style={commonStyles.infoValue}>{formData.location || 'N/A'}</Text>
        </View>

        {/* Owner Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.ownerInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.name}:</Text>
          <Text style={commonStyles.infoValue}>{formatFullName(user)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.nida}:</Text>
          <Text style={commonStyles.infoValue}>{user?.nida_number || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.tin}:</Text>
          <Text style={commonStyles.infoValue}>{formData.tin_number || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.phone}:</Text>
          <Text style={commonStyles.infoValue}>{user?.phone || 'N/A'}</Text>
        </View>

        {/* Validity Info */}
        <View style={licenseStyles.validityInfo}>
          <View style={licenseStyles.validityItem}>
            <Text style={licenseStyles.validityLabel}>{t.issueDate}</Text>
            <Text style={licenseStyles.validityValue}>{formatDate(issueDate.toISOString())}</Text>
          </View>
          <View style={licenseStyles.validityItem}>
            <Text style={licenseStyles.validityLabel}>{lang === 'sw' ? 'Halali' : 'Validity'}</Text>
            <Text style={licenseStyles.validityValue}>{t.validity}</Text>
          </View>
          <View style={licenseStyles.validityItem}>
            <Text style={licenseStyles.validityLabel}>{t.expiryDate}</Text>
            <Text style={licenseStyles.validityValue}>{formatDate(expiryDate.toISOString())}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={commonStyles.signatureSection}>
          <View style={commonStyles.signatureBox}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formatFullName(user)}</Text>
            <Text style={commonStyles.signatureTitle}>{t.ownerSig}</Text>
          </View>
          <View style={[commonStyles.signatureBox, { textAlign: 'right', alignItems: 'flex-end' }]}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{t.officerSig.toUpperCase()}</Text>
            <Text style={commonStyles.signatureTitle}>{lang === 'sw' ? 'Sahihi na Muhuri' : 'Signature & Stamp'}</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={commonStyles.qrSection}>
          <Image src={qrCodeUrl} style={commonStyles.qrCode} />
          <Text style={commonStyles.qrLabel}>{application.application_number}</Text>
        </View>

        {/* Footer */}
        <View style={commonStyles.footer}>
          <Text style={commonStyles.footerText}>{t.footer}</Text>
          <Text style={commonStyles.metadata}>
            VERIFICATION ID: {application.id.toUpperCase()} | GENERATED ON: {new Date().toISOString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default LeseniaBiasharaPDF;
