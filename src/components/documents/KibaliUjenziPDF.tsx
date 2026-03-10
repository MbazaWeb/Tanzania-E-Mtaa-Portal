/**
 * Kibali cha Ujenzi PDF
 * Building Permit (Renovations)
 * 
 * Service: Kibali cha Ujenzi (Maboresho)
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatCurrency } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/src/constants/logo';

// Additional styles for building permit
const permitStyles = StyleSheet.create({
  permitBadge: {
    backgroundColor: '#1d4ed8',
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
  validityBox: {
    borderWidth: 2,
    borderColor: '#1d4ed8',
    padding: 10,
    marginVertical: 15,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  validityLabel: {
    fontSize: 10,
    color: '#1e40af',
    marginBottom: 5,
  },
  validityDays: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    fontSize: 9,
    color: '#92400e',
    fontStyle: 'italic',
  },
});

export const KibaliUjenziPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Kibali cha Ujenzi (Maboresho)');

  // Work type labels
  const workTypeLabels: Record<string, { sw: string; en: string }> = {
    'FENSI': { sw: 'Ukuta / Fensi', en: 'Wall / Fence' },
    'MABORESHO_NDANI': { sw: 'Maboresho ya Ndani', en: 'Interior Renovations' },
    'CHOO_PAZE': { sw: 'Paze / Choo', en: 'Shed / Toilet' },
    'NYINGINEZO': { sw: 'Nyinginezo', en: 'Other' },
  };

  const getWorkTypeLabel = (type: string): string => {
    const label = workTypeLabels[type];
    if (label) return lang === 'sw' ? label.sw : label.en;
    return type;
  };

  const labels = {
    sw: {
      title: 'KIBALI CHA UJENZI',
      subtitle: 'MABORESHO / RENOVATIONS',
      propertyInfo: 'TAARIFA ZA KIWANJA / NYUMBA',
      workDetails: 'MAELEZO YA KAZI',
      plotNo: 'Namba ya Kiwanja',
      block: 'Block',
      location: 'Maelezo ya Eneo',
      workType: 'Aina ya Kazi',
      cost: 'Gharama ya Ujenzi',
      duration: 'Muda wa Kazi (Siku)',
      permitGranted: 'KIBALI KIMEIDHINISHWA',
      validFor: 'Halali kwa',
      days: 'siku',
      applicantInfo: 'MWOMBAJI',
      name: 'Jina',
      nida: 'NIDA',
      phone: 'Simu',
      warning: 'ONYO: Kibali hiki ni halali kwa kipindi cha ujenzi kilichotajwa tu. Mwombaji anapaswa kuzingatia taratibu zote za usalama na mipango miji. Ukikiuka masharti, kibali hiki kinaweza kubatiliwa.',
      applicantSig: 'Sahihi ya Mwombaji',
      officerSig: 'Mhandisi wa Ujenzi',
      footer: 'Kibali hiki ni halali kwa kipindi cha ujenzi kilichotajwa tu.',
    },
    en: {
      title: 'BUILDING PERMIT',
      subtitle: 'RENOVATIONS',
      propertyInfo: 'PROPERTY INFORMATION',
      workDetails: 'WORK DETAILS',
      plotNo: 'Plot Number',
      block: 'Block',
      location: 'Location Description',
      workType: 'Type of Work',
      cost: 'Estimated Cost',
      duration: 'Duration (Days)',
      permitGranted: 'PERMIT GRANTED',
      validFor: 'Valid for',
      days: 'days',
      applicantInfo: 'APPLICANT',
      name: 'Name',
      nida: 'NIDA',
      phone: 'Phone',
      warning: 'WARNING: This permit is valid only for the construction period specified. The applicant must adhere to all safety regulations and urban planning requirements. Violation of conditions may result in permit revocation.',
      applicantSig: 'Applicant Signature',
      officerSig: 'Construction Engineer',
      footer: 'This permit is valid only for the specified construction period.',
    }
  };

  const t = labels[lang];

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Text style={commonStyles.watermark}>E-MTAA</Text>

        {/* Header */}
        <View style={commonStyles.header}>
          <Image src={TANZANIA_LOGO_BASE64} style={commonStyles.logo} />
          <Text style={commonStyles.country}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
          <Text style={commonStyles.office}>OFISI YA RAIS - TAMISEMI</Text>
          <View style={commonStyles.divider} />
        </View>

        {/* Title */}
        <Text style={commonStyles.title}>{t.title}</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 12, color: '#57534e' }}>{t.subtitle}</Text>

        {/* Permit Badge */}
        <View style={permitStyles.permitBadge}>
          <Text style={permitStyles.badgeText}>✓ {t.permitGranted}</Text>
        </View>

        {/* Applicant Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.applicantInfo}</Text>
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
          <Text style={commonStyles.infoLabel}>{t.phone}:</Text>
          <Text style={commonStyles.infoValue}>{user?.phone || 'N/A'}</Text>
        </View>

        {/* Property Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.propertyInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.plotNo}:</Text>
          <Text style={commonStyles.infoValue}>{formData.plot_number || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.block}:</Text>
          <Text style={commonStyles.infoValue}>{formData.block_number || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.location}:</Text>
          <Text style={commonStyles.infoValue}>{formData.location_desc || 'N/A'}</Text>
        </View>

        {/* Work Details */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.workDetails}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.workType}:</Text>
          <Text style={commonStyles.infoValue}>{getWorkTypeLabel(formData.work_type)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.cost}:</Text>
          <Text style={commonStyles.infoValue}>{formatCurrency(formData.estimated_cost)}</Text>
        </View>

        {/* Validity Box */}
        <View style={permitStyles.validityBox}>
          <Text style={permitStyles.validityLabel}>{t.validFor}</Text>
          <Text style={permitStyles.validityDays}>{formData.duration || 'N/A'} {t.days}</Text>
        </View>

        {/* Warning */}
        <View style={permitStyles.warningBox}>
          <Text style={permitStyles.warningText}>⚠️ {t.warning}</Text>
        </View>

        {/* Signatures */}
        <View style={commonStyles.signatureSection}>
          <View style={commonStyles.signatureBox}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formatFullName(user)}</Text>
            <Text style={commonStyles.signatureTitle}>{t.applicantSig}</Text>
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

export default KibaliUjenziPDF;
