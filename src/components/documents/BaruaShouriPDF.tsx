/**
 * Barua ya Kufungua Shauri PDF
 * Dispute Opening Letter
 * 
 * Service: Barua ya Kufungua Shauri
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/src/constants/logo';

// Additional styles for dispute letter
const disputeStyles = StyleSheet.create({
  caseNumber: {
    backgroundColor: '#fef2f2',
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 4,
  },
  caseLabel: {
    fontSize: 10,
    color: '#991b1b',
    marginBottom: 5,
  },
  caseCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991b1b',
    fontFamily: 'Courier',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  priorityHigh: {
    backgroundColor: '#dc2626',
  },
  priorityNormal: {
    backgroundColor: '#059669',
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: '#fafaf9',
    padding: 12,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#44403c',
  },
  reliefBox: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
});

export const BaruaShouriPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Barua ya Kufungua Shauri');

  // Dispute type labels
  const disputeTypeLabels: Record<string, { sw: string; en: string }> = {
    'ARDHI': { sw: 'Ardhi / Kiwanja', en: 'Land Dispute' },
    'NDOA': { sw: 'Ndoa / Familia', en: 'Marriage/Family Dispute' },
    'MADENI': { sw: 'Madeni', en: 'Debt Dispute' },
    'MAJIRANI': { sw: 'Majirani', en: 'Neighbor Dispute' },
    'URITHI': { sw: 'Urithi', en: 'Inheritance Dispute' },
    'NYINGINEZO': { sw: 'Nyinginezo', en: 'Other' },
  };

  const getDisputeTypeLabel = (type: string): string => {
    const label = disputeTypeLabels[type];
    if (label) return lang === 'sw' ? label.sw : label.en;
    return type;
  };

  const isHighPriority = formData.priority === 'HARAKA';

  const labels = {
    sw: {
      title: 'BARUA YA KUFUNGUA SHAURI',
      caseNo: 'Namba ya Shauri',
      disputeInfo: 'AINA YA SHAURI',
      complainantInfo: 'MLALAMIKAJI (COMPLAINANT)',
      respondentInfo: 'MLALAMIKIWA (RESPONDENT)',
      caseDetails: 'MAELEZO YA SHAURI',
      disputeType: 'Aina ya Shauri',
      priority: 'Kiprioriti',
      priorityHigh: 'HARAKA',
      priorityNormal: 'KAWAIDA',
      name: 'Jina',
      nida: 'NIDA',
      phone: 'Simu',
      address: 'Anwani',
      incidentDate: 'Tarehe ya Tukio',
      summary: 'Muhtasari wa Shauri',
      relief: 'Ombi / Unachokitaka (Relief)',
      complainantSig: 'Sahihi ya Mlalamikaji',
      officerSig: 'Afisa wa Baraza',
      footer: 'Shauri hili limeandikishwa rasmi na kupewa namba ya kumbukumbu.',
    },
    en: {
      title: 'DISPUTE OPENING LETTER',
      caseNo: 'Case Number',
      disputeInfo: 'DISPUTE TYPE',
      complainantInfo: 'COMPLAINANT',
      respondentInfo: 'RESPONDENT',
      caseDetails: 'CASE DETAILS',
      disputeType: 'Dispute Type',
      priority: 'Priority',
      priorityHigh: 'HIGH',
      priorityNormal: 'NORMAL',
      name: 'Name',
      nida: 'NIDA',
      phone: 'Phone',
      address: 'Address',
      incidentDate: 'Incident Date',
      summary: 'Case Summary',
      relief: 'Relief Sought',
      complainantSig: 'Complainant Signature',
      officerSig: 'Tribunal Officer',
      footer: 'This case has been officially registered and assigned a reference number.',
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

        {/* Case Number */}
        <View style={disputeStyles.caseNumber}>
          <Text style={disputeStyles.caseLabel}>{t.caseNo}</Text>
          <Text style={disputeStyles.caseCode}>{application.application_number}</Text>
        </View>

        {/* Priority Badge */}
        <View style={[disputeStyles.priorityBadge, isHighPriority ? disputeStyles.priorityHigh : disputeStyles.priorityNormal]}>
          <Text style={disputeStyles.priorityText}>
            {t.priority}: {isHighPriority ? t.priorityHigh : t.priorityNormal}
          </Text>
        </View>

        {/* Dispute Type */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.disputeInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.disputeType}:</Text>
          <Text style={commonStyles.infoValue}>{getDisputeTypeLabel(formData.dispute_type)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.incidentDate}:</Text>
          <Text style={commonStyles.infoValue}>{formatDate(formData.incident_date)}</Text>
        </View>

        {/* Complainant Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.complainantInfo}</Text>
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

        {/* Respondent Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.respondentInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.name}:</Text>
          <Text style={commonStyles.infoValue}>{formData.respondent_name || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.phone}:</Text>
          <Text style={commonStyles.infoValue}>{formData.respondent_phone || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.address}:</Text>
          <Text style={commonStyles.infoValue}>{formData.respondent_address || 'N/A'}</Text>
        </View>

        {/* Case Details */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.caseDetails}</Text>
        </View>

        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#57534e' }}>{t.summary}:</Text>
        <View style={disputeStyles.summaryBox}>
          <Text style={disputeStyles.summaryText}>{formData.summary || 'N/A'}</Text>
        </View>

        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#57534e' }}>{t.relief}:</Text>
        <View style={disputeStyles.reliefBox}>
          <Text style={disputeStyles.summaryText}>{formData.relief_sought || 'N/A'}</Text>
        </View>

        {/* Signatures */}
        <View style={commonStyles.signatureSection}>
          <View style={commonStyles.signatureBox}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formatFullName(user)}</Text>
            <Text style={commonStyles.signatureTitle}>{t.complainantSig}</Text>
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

export default BaruaShouriPDF;
