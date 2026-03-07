import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFViewer } from '@react-pdf/renderer';

// Register fonts with error handling
try {
  Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v12/UcCOjAkZgdPTi9cHCcZfMDpn3dk.ttf',
  });

  Font.register({
    family: 'InterBold',
    src: 'https://fonts.gstatic.com/s/inter/v12/UcCOjAkZgdPTi9cHCcZfMDpn3dk.ttf',
    fontWeight: 'bold',
  });
} catch (e) {
  console.warn('Font registration failed, using fallback fonts');
}

// Use production URL for Tanzania coat of arms (CORS-friendly from same origin)
const TANZANIA_LOGO_URL = "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png";

// Styles matching the official Tanzania government document format
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Inter',
    backgroundColor: '#FAF8F0',
  },
  outerBorder: {
    margin: 15,
    border: '8pt solid #C9A227',
    padding: 3,
  },
  innerBorder: {
    border: '2pt solid #8B7500',
    padding: 25,
    minHeight: '100%',
  },
  header: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emblem: {
    width: 80,
    height: 90,
    marginBottom: 8,
  },
  republicText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
    color: '#000',
  },
  officeText: {
    fontSize: 10,
    marginBottom: 1,
    color: '#000',
  },
  subOfficeText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E5A1C',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 15,
    textAlign: 'center',
    textDecoration: 'underline',
    textDecorationColor: '#000',
  },
  refDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  refText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  underline: {
    borderBottom: '1pt solid #000',
    minWidth: 120,
    marginLeft: 5,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: 11,
  },
  fieldValue: {
    fontSize: 11,
    borderBottom: '1pt solid #000',
    minWidth: 100,
    paddingHorizontal: 5,
    marginRight: 10,
  },
  fieldValueLong: {
    fontSize: 11,
    borderBottom: '1pt solid #000',
    flex: 1,
    paddingHorizontal: 5,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginVertical: 10,
  },
  italicText: {
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  qrSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  qrContainer: {
    alignItems: 'flex-start',
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  qrLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  verifiedBadge: {
    backgroundColor: '#1B5E20',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 180,
  },
  signatureLine: {
    borderTop: '1pt solid #000',
    width: 150,
    marginBottom: 5,
    marginTop: 40,
  },
  signatureTitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
  },
});

interface DocumentRendererProps {
  application: any;
  service: any;
  qrCodeDataUrl?: string;
}

// Helper to format date in Swahili
const formatDateSwahili = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const months = ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'];
  return `${day} ${months[month]}, ${year}`;
};

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  application,
  service,
  qrCodeDataUrl
}) => {
  // Debug logging
  console.log('DocumentRenderer - application:', application);
  console.log('DocumentRenderer - service:', service);
  
  const formData = application?.form_data || {};
  // Support both 'user' and 'users' property names
  const user = (application as any)?.users || application?.user || {};
  const template = service?.document_template || {};
  const documentType = template.document_type || service?.name || '';

  console.log('DocumentRenderer - documentType:', documentType);
  console.log('DocumentRenderer - user:', user);
  console.log('DocumentRenderer - formData:', formData);

  const issueDate = application?.issued_at ? new Date(application.issued_at) : new Date();
  const qrUrl = qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://e-serikali-mtaa.vercel.app/verify/${application?.application_number || 'unknown'}`)}`;

  const fullName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.replace(/\s+/g, ' ').trim() || 'Mwananchi';
  const gender = user.gender || user.sex || formData.gender || '';
  const genderSwahili = gender === 'Male' || gender === 'M' || gender === 'me' ? 'ME' : gender === 'Female' || gender === 'F' || gender === 'ke' ? 'KE' : gender.toUpperCase();

  // CHETI CHA MKAZI - Residency Certificate
  if (documentType.includes('MKAZI') || documentType.toLowerCase().includes('residency') || service?.name?.includes('Mkazi')) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              {/* Header */}
              <View style={styles.header}>
                <Image src={TANZANIA_LOGO_URL} style={styles.emblem} />
                <Text style={styles.republicText}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
                <Text style={styles.officeText}>OFISI YA RAIS</Text>
                <Text style={styles.subOfficeText}>TAWALA ZA MIKOA NA SERIKALI ZA MITAA</Text>
              </View>

              <Text style={styles.title}>CHETI CHA MKAZI</Text>

              {/* Reference and Date */}
              <View style={styles.refDateRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Kumb. Na:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.application_number}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Tarehe:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
                </View>
              </View>

              {/* Body */}
              <Text style={styles.sectionHeader}>HATI HII INATHIBITISHA KUWA:</Text>

              {/* Name and NIDA */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Ndugu</Text>
                <Text style={styles.fieldValueLong}>{fullName}</Text>
                <Text style={styles.fieldLabel}>, mwenye NDA:</Text>
                <Text style={[styles.fieldValue, { minWidth: 180 }]}>{user.nida_number || formData.nida_number || ''}</Text>
                <Text style={styles.fieldLabel}>,</Text>
              </View>

              {/* Gender, DOB, Place */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Jinsia:</Text>
                <Text style={[styles.fieldValue, { minWidth: 50 }]}>{genderSwahili}</Text>
                <Text style={styles.fieldLabel}>, Alizaliwa:</Text>
                <Text style={[styles.fieldValue, { minWidth: 100 }]}>{user.dob || formData.dob || ''}</Text>
                <Text style={styles.fieldLabel}>, Mahala:</Text>
                <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formData.birthplace || user.nationality || 'Tanzania'}</Text>
                <Text style={styles.fieldLabel}>,</Text>
              </View>

              {/* Resident of */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Ni mkazi halali wa:</Text>
                <Text style={styles.fieldValueLong}>{formData.street || user.street || ''}</Text>
              </View>

              {/* Region and District */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mkoa:</Text>
                <Text style={[styles.fieldValue, { minWidth: 140 }]}>{formData.region || user.region || ''}</Text>
                <Text style={styles.fieldLabel}>, Wilaya:</Text>
                <Text style={styles.fieldValueLong}>{formData.district || user.district || ''}</Text>
                <Text style={styles.fieldLabel}>,</Text>
              </View>

              {/* Ward */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Kata / Kijiji:</Text>
                <Text style={styles.fieldValueLong}>{formData.ward || user.ward || ''}</Text>
              </View>

              {/* Postal */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Namba ya Posta:</Text>
                <Text style={[styles.fieldValue, { minWidth: 150 }]}>{formData.postal_code || ''}</Text>
              </View>

              {/* Official statement */}
              <Text style={styles.bodyText}>
                Mhusika tajwa hapo <Text style={styles.italicText}>juu</Text> ametambuliwa na serikali ya mtaa/kijiji kama mkazi wa eneo tajwa.
              </Text>

              <Text style={styles.bodyText}>
                Cheti hiki kimetolewa kwa madhumuni ya matumizi rasmi pale kitakapohitajika.
              </Text>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    <Image src={qrUrl} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>QR CODE YA UTHIBITISHO</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ IMETHIBITISHWA KIDIJITALI</Text>
                    </View>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Mtendaji wa Kata / Kijiji</Text>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Diwani wa Kata</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // BARUA YA UTAMBULISHO - Identification Letter
  if (documentType.includes('UTAMBULISHO') || documentType.toLowerCase().includes('identification') || documentType.toLowerCase().includes('introduction') || service?.name?.includes('Utambulisho') || service?.name?.includes('Barua')) {
    const purposeMap: Record<string, string> = {
      'bank': 'BENKI — Kufungua akaunti ya benki.',
      'employment': 'AJIRA — Kuthibitisha mkazi kwa ajili ya kazi.',
      'school': 'ELIMU — Kusajili mtoto shuleni.',
      'hospital': 'AFYA — Kupata huduma za afya.',
      'travel': 'SAFARI — Kusafiri ndani ya nchi.',
      'other': formData.purpose_details || 'Mahitaji mengine.'
    };
    const purposeText = purposeMap[formData.purpose] || formData.purpose || 'Matumizi rasmi.';

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              {/* Header */}
              <View style={styles.header}>
                <Image src={TANZANIA_LOGO_URL} style={styles.emblem} />
                <Text style={styles.republicText}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
                <Text style={styles.officeText}>OFISI YA RAIS</Text>
                <Text style={styles.subOfficeText}>TAWALA ZA MIKOA NA SERIKALI ZA MITAA</Text>
              </View>

              <Text style={styles.title}>BARUA YA UTAMBULISHO</Text>

              {/* Reference and Date */}
              <View style={styles.refDateRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Kumb. Na:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.application_number}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Tarehe:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
                </View>
              </View>

              {/* Body */}
              <Text style={styles.sectionHeader}>HATI HII INATHIBITISHA KUWA:</Text>

              {/* Name and NIDA */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Ndugu</Text>
                <Text style={styles.fieldValueLong}>{fullName}</Text>
                <Text style={styles.fieldLabel}>, mwenye NIDA:</Text>
                <Text style={[styles.fieldValue, { minWidth: 200 }]}>{user.nida_number || formData.nida_number || ''}</Text>
                <Text style={styles.fieldLabel}>,</Text>
              </View>

              {/* Gender, DOB, Place */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Jinsia:</Text>
                <Text style={[styles.fieldValue, { minWidth: 50 }]}>{genderSwahili}</Text>
                <Text style={styles.fieldLabel}>, Alizaliwa:</Text>
                <Text style={[styles.fieldValue, { minWidth: 80 }]}>{user.dob || formData.dob || ''}</Text>
                <Text style={styles.fieldLabel}>, Mahala:</Text>
                <Text style={[styles.fieldValue, { minWidth: 130 }]}>{formData.birthplace || user.nationality || 'Tanzania'}</Text>
                <Text style={styles.fieldLabel}>,</Text>
              </View>

              {/* Resident Location */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Ni mkazi wa:</Text>
                <Text style={[styles.fieldValue, { minWidth: 130 }]}>{formData.region || user.region || ''}</Text>
                <Text style={styles.fieldLabel}>, Wilaya:</Text>
                <Text style={[styles.fieldValue, { minWidth: 130 }]}>{formData.district || user.district || ''}</Text>
                <Text style={styles.fieldLabel}>, Wilaya ya</Text>
                <Text style={[styles.fieldValue, { minWidth: 80 }]}>{formData.ward || user.ward || ''}</Text>
                <Text style={styles.fieldLabel}>,</Text>
              </View>

              {/* Street */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mtaa:</Text>
                <Text style={styles.fieldValueLong}>{formData.street || user.street || ''}</Text>
              </View>

              {/* Postal */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Namba ya Posta:</Text>
                <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formData.postal_code || ''}</Text>
              </View>

              {/* Purpose */}
              <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Sababu: {purposeText}</Text>
              </View>

              {/* Official statement */}
              <Text style={styles.bodyText}>
                Barua hii imetolewa kwa <Text style={styles.italicText}>madhumuni ya kumtambua</Text> mhusika tajwa hapo juu kwa matumzi rasmi.
              </Text>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    <Image src={qrUrl} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>THIBITISHA QR CODE</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ IMETHIBITISHWA KIDIJITALI</Text>
                    </View>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Mtendaji wa Kata</Text>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Diwani wa Kata</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // RISITI YA MALIPO - Payment Receipt
  if (documentType.includes('RISITI') || documentType.toLowerCase().includes('receipt')) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              <View style={styles.header}>
                <Image src={TANZANIA_LOGO_URL} style={styles.emblem} />
                <Text style={styles.republicText}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
                <Text style={styles.officeText}>OFISI YA RAIS</Text>
                <Text style={styles.subOfficeText}>TAWALA ZA MIKOA NA SERIKALI ZA MITAA</Text>
              </View>

              <Text style={styles.title}>RISITI YA MALIPO</Text>

              <View style={styles.refDateRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Namba ya Risiti:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.transaction_id || application.application_number}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Tarehe:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Jina la Mlipaji:</Text>
                  <Text style={styles.fieldValueLong}>{fullName}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Namba ya NIDA:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 200 }]}>{user.nida_number || ''}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Simu:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{user.phone || ''}</Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={styles.tableCellHeader}>MAELEZO YA HUDUMA</Text></View>
                  <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>IDADI</Text></View>
                  <View style={[styles.tableColHeader, { width: '17.5%' }]}><Text style={styles.tableCellHeader}>BEI</Text></View>
                  <View style={[styles.tableColHeader, { width: '17.5%' }]}><Text style={styles.tableCellHeader}>JUMLA</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>{service?.name || 'Huduma'}</Text></View>
                  <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>1</Text></View>
                  <View style={[styles.tableCol, { width: '17.5%' }]}><Text style={styles.tableCell}>TZS {service?.fee || 0}</Text></View>
                  <View style={[styles.tableCol, { width: '17.5%' }]}><Text style={styles.tableCell}>TZS {service?.fee || 0}</Text></View>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>JUMLA KUU: TZS {service?.fee || 0}</Text>
                <Text style={{ fontSize: 9, fontStyle: 'italic', marginTop: 5 }}>
                  Njia ya Malipo: {application.payment_method || 'M-Pesa / Tigo Pesa'}
                </Text>
              </View>

              <Text style={[styles.bodyText, { marginTop: 20 }]}>
                Risiti hii ni uthibitisho wa malipo yaliyofanywa kwa huduma iliyotajwa hapo juu.
              </Text>

              <View style={styles.footer}>
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    <Image src={qrUrl} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>THIBITISHA MALIPO</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ MALIPO YAMETHIBITISHWA</Text>
                    </View>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Kasiimu wa Fedha</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // HATI YA MAKUBALIANO - Agreement Certificate (for sales etc.)
  if (documentType.includes('MAKUBALIANO') || documentType.toLowerCase().includes('agreement') || service?.name?.toLowerCase().includes('mauziano')) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              <View style={styles.header}>
                <Image src={TANZANIA_LOGO_URL} style={styles.emblem} />
                <Text style={styles.republicText}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
                <Text style={styles.officeText}>OFISI YA RAIS</Text>
                <Text style={styles.subOfficeText}>TAWALA ZA MIKOA NA SERIKALI ZA MITAA</Text>
              </View>

              <Text style={styles.title}>HATI YA MAKUBALIANO</Text>

              <View style={styles.refDateRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Kumb. Na:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.application_number}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Tarehe:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>UTHIBITISHO WA MAKUBALIANO YA MAUZIANO</Text>

              <Text style={styles.bodyText}>
                Ofisi ya Serikali ya Mtaa inathibitisha kuwa kumefanyika makubaliano ya mauziano ya mali yenye maelezo yafuatayo:
              </Text>

              <View style={{ backgroundColor: '#f5f5f0', padding: 15, borderRadius: 3, marginVertical: 10, border: '1pt solid #ddd' }}>
                <View style={styles.fieldRow}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', width: 100 }}>Aina ya Mali:</Text>
                  <Text style={{ fontSize: 10 }}>{formData.asset_type || 'N/A'}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', width: 100 }}>Maelezo:</Text>
                  <Text style={{ fontSize: 10 }}>{formData.asset_description || 'N/A'}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', width: 100 }}>Thamani:</Text>
                  <Text style={{ fontSize: 10 }}>TZS {formData.sale_price || '0'}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 15, marginVertical: 15 }}>
                <View style={{ flex: 1, border: '1pt solid #ccc', padding: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', borderBottom: '1pt solid #eee', paddingBottom: 3, marginBottom: 5 }}>MUUZAJI (SELLER)</Text>
                  <Text style={{ fontSize: 9 }}>Jina: {fullName}</Text>
                  <Text style={{ fontSize: 9 }}>NIDA: {user.nida_number || 'N/A'}</Text>
                  <Text style={{ fontSize: 9 }}>Simu: {user.phone || 'N/A'}</Text>
                </View>
                <View style={{ flex: 1, border: '1pt solid #ccc', padding: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', borderBottom: '1pt solid #eee', paddingBottom: 3, marginBottom: 5 }}>MNUNUZI (BUYER)</Text>
                  <Text style={{ fontSize: 9 }}>Jina: {formData.buyer_name || 'N/A'}</Text>
                  <Text style={{ fontSize: 9 }}>NIDA: {formData.buyer_nida || 'N/A'}</Text>
                  <Text style={{ fontSize: 9 }}>Simu: {formData.buyer_phone || 'N/A'}</Text>
                </View>
              </View>

              <Text style={[styles.bodyText, { fontStyle: 'italic', fontSize: 10 }]}>
                Makubaliano haya yamehakikiwa kidijitali na pande zote mbili na kuidhinishwa na Ofisi ya Serikali ya Mtaa.
              </Text>

              <View style={styles.footer}>
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    <Image src={qrUrl} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>THIBITISHA HATI</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ IMETHIBITISHWA KIDIJITALI</Text>
                    </View>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Mtendaji wa Kata / Kijiji</Text>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Diwani wa Kata</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // DEFAULT - Generic Certificate
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.header}>
              <Image src={TANZANIA_LOGO_URL} style={styles.emblem} />
              <Text style={styles.republicText}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
              <Text style={styles.officeText}>OFISI YA RAIS</Text>
              <Text style={styles.subOfficeText}>TAWALA ZA MIKOA NA SERIKALI ZA MITAA</Text>
            </View>

            <Text style={styles.title}>{template.document_type || service?.name || 'HATI RASMI'}</Text>

            <View style={styles.refDateRow}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={styles.refText}>Kumb. Na:</Text>
                <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.application_number}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={styles.refText}>Tarehe:</Text>
                <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>HATI HII INATHIBITISHA KUWA:</Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Ndugu</Text>
              <Text style={styles.fieldValueLong}>{fullName}</Text>
              <Text style={styles.fieldLabel}>, mwenye NIDA:</Text>
              <Text style={[styles.fieldValue, { minWidth: 180 }]}>{user.nida_number || ''}</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Mkoa:</Text>
              <Text style={[styles.fieldValue, { minWidth: 140 }]}>{formData.region || user.region || ''}</Text>
              <Text style={styles.fieldLabel}>, Wilaya:</Text>
              <Text style={styles.fieldValueLong}>{formData.district || user.district || ''}</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Kata / Kijiji:</Text>
              <Text style={styles.fieldValueLong}>{formData.ward || user.ward || ''}</Text>
            </View>

            <Text style={styles.bodyText}>
              Hati hii imetolewa kwa madhumuni rasmi kwa mhusika tajwa hapo juu.
            </Text>

            <View style={styles.footer}>
              <View style={styles.qrSection}>
                <View style={styles.qrContainer}>
                  <Image src={qrUrl} style={styles.qrCode} />
                  <Text style={styles.qrLabel}>QR CODE YA UTHIBITISHO</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ IMETHIBITISHWA KIDIJITALI</Text>
                  </View>
                </View>

                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureTitle}>Mtendaji wa Kata / Kijiji</Text>
                </View>

                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureTitle}>Diwani wa Kata</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const DocumentPreview: React.FC<DocumentRendererProps & { onClose: () => void }> = ({
  application,
  service,
  qrCodeDataUrl,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-bold text-stone-800">Hakiki Hati</h3>
            <p className="text-sm text-stone-500">{application.application_number}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
            aria-label="Funga"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="flex-1 bg-stone-100">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
            <DocumentRenderer 
              application={application} 
              service={service} 
              qrCodeDataUrl={qrCodeDataUrl} 
            />
          </PDFViewer>
        </div>
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-all"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
