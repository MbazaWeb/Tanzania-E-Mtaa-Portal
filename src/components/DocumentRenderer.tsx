import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFViewer } from '@react-pdf/renderer';
import { TANZANIA_LOGO_BASE64 } from '@/src/constants/logo';

// Use embedded base64 logo (no CORS issues)
const TANZANIA_LOGO_URL = TANZANIA_LOGO_BASE64;

// Styles matching the official Tanzania government document format - use Helvetica as fallback
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#FAF8F0',
  },
  outerBorder: {
    margin: 12,
    border: '6pt solid #C9A227',
    padding: 2,
    height: '96%',
  },
  innerBorder: {
    border: '2pt solid #8B7500',
    padding: 20,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  // Photo section - top left corner
  photoSection: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 75,
    alignItems: 'center',
    zIndex: 10,
  },
  photoBox: {
    width: 65,
    height: 80,
    borderWidth: 1,
    borderColor: '#78716c',
    backgroundColor: '#f5f5f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  photo: {
    width: 63,
    height: 78,
    objectFit: 'cover',
  },
  photoPlaceholder: {
    fontSize: 7,
    color: '#a8a29e',
    textAlign: 'center',
  },
  nidaLabel: {
    fontSize: 5,
    color: '#78716c',
    marginBottom: 1,
  },
  nidaNumber: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#1c1917',
  },
  header: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emblem: {
    width: 60,
    height: 70,
    marginBottom: 6,
  },
  republicText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
    color: '#000',
  },
  officeText: {
    fontSize: 9,
    marginBottom: 1,
    color: '#000',
  },
  subOfficeText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2E5A1C',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
    textAlign: 'center',
    textDecoration: 'underline',
    textDecorationColor: '#000',
  },
  refDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  refText: {
    fontSize: 9,
    fontStyle: 'italic',
  },
  underline: {
    borderBottom: '1pt solid #000',
    minWidth: 100,
    marginLeft: 3,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 5,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: 9,
  },
  fieldValue: {
    fontSize: 9,
    borderBottom: '1pt solid #000',
    minWidth: 80,
    paddingHorizontal: 3,
    marginRight: 8,
  },
  fieldValueLong: {
    fontSize: 9,
    borderBottom: '1pt solid #000',
    flex: 1,
    paddingHorizontal: 3,
  },
  bodyText: {
    fontSize: 9,
    lineHeight: 1.5,
    textAlign: 'justify',
    marginVertical: 6,
    flex: 1,
  },
  italicText: {
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 10,
  },
  qrSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'flex-start',
  },
  qrCode: {
    width: 55,
    height: 55,
    marginBottom: 3,
  },
  qrLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  verifiedBadge: {
    backgroundColor: '#1B5E20',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 140,
  },
  signatureLine: {
    borderTop: '1pt solid #000',
    width: 120,
    marginBottom: 3,
    marginTop: 25,
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
  
  // Calculate expiry date based on service validity (default 12 months for Mkazi)
  const validityMonths = (service as any)?.validity_months || 12;
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
  
  // QR code with explicit format=png for @react-pdf/renderer compatibility
  const qrUrl = qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&data=${encodeURIComponent(`https://e-serikali-mtaa.vercel.app/verify/${application?.application_number || 'unknown'}`)}`;

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
              {/* Photo Box - Top Left */}
              <View style={styles.photoSection}>
                <View style={styles.photoBox}>
                  {user?.photo_url ? (
                    <Image src={user.photo_url} style={styles.photo} />
                  ) : (
                    <Text style={styles.photoPlaceholder}>PICHA{'\n'}PHOTO</Text>
                  )}
                </View>
                <Text style={styles.nidaLabel}>NIDA</Text>
                <Text style={styles.nidaNumber}>{user?.nida_number || 'N/A'}</Text>
              </View>

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

              {/* Expiry Date Box */}
              <View style={{ backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#D97706', borderRadius: 4, padding: 8, marginVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400E' }}>⚠ MUDA WA HATI:</Text>
                  <Text style={{ fontSize: 10, marginLeft: 8, color: '#B45309' }}>Miezi {validityMonths}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400E' }}>ITAISHA:</Text>
                  <Text style={{ fontSize: 10, marginLeft: 5, color: '#B45309', fontWeight: 'bold' }}>{formatDateSwahili(expiryDate)}</Text>
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

              {/* Caution Box */}
              <View style={{ backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#DC2626', borderRadius: 4, padding: 8, marginTop: 10 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#991B1B', marginBottom: 3 }}>⚠ TAHADHARI / CAUTION:</Text>
                <Text style={{ fontSize: 8, color: '#7F1D1D', lineHeight: 1.4 }}>
                  1. Kughushi hati hii ni kosa la jinai linaloadhibiwa na sheria za Tanzania.{'\n'}
                  2. Hati hii itatumika tu kwa muda uliooainishwa hapo juu.{'\n'}
                  3. Baada ya muda kuisha, mwombaji atahitaji kuomba upya.{'\n'}
                  4. Forgery of this document is a criminal offense punishable by law.
                </Text>
              </View>

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

  // BARUA YA UTAMBULISHO - Identification Letter (supports multiple addresses)
  if (documentType.includes('UTAMBULISHO') || documentType.toLowerCase().includes('identification') || documentType.toLowerCase().includes('introduction') || service?.name?.includes('Utambulisho') || service?.name?.includes('Barua')) {
    const purposeMap: Record<string, string> = {
      'BENKI': 'BENKI — Kufungua akaunti ya benki.',
      'AJIRA': 'AJIRA — Kuthibitisha mkazi kwa ajili ya kazi.',
      'CHUO': 'ELIMU — Kusajili chuo/shule.',
      'AFYA': 'AFYA — Kupata huduma za afya.',
      'LESENI_BIASHARA': 'LESENI — Kuomba leseni ya biashara.',
      'LESENI_UDEREVA': 'LESENI — Kuomba leseni ya udereva.',
      'SIMU': 'SIMU — Kusajili SIM card.',
      'PASSPORT': 'SAFARI — Kuomba passport/visa.',
      'TRA': 'KODI — Kupata huduma za TRA.',
      'BIMA': 'BIMA — Kupata huduma za bima.',
      'KUSAJILI_MTOTO': 'ELIMU — Kusajili mtoto shuleni.',
      'MKOPO': 'FEDHA — Kuomba mkopo.',
      'ARDHI': 'MALI — Kununua ardhi/nyumba.',
      'HUDUMA_UMEME_MAJI': 'HUDUMA — Kupata umeme/maji.',
      'WAAJIRI': 'AJIRA — Uthibitisho kwa waajiri.',
      'SERIKALI': 'SERIKALI — Maombi ya serikali.',
      'NYINGINEZO': formData.purpose_details || 'Mahitaji mengine.',
      'bank': 'BENKI — Kufungua akaunti ya benki.',
      'employment': 'AJIRA — Kuthibitisha mkazi kwa ajili ya kazi.',
      'school': 'ELIMU — Kusajili mtoto shuleni.',
      'hospital': 'AFYA — Kupata huduma za afya.',
      'travel': 'SAFARI — Kusafiri ndani ya nchi.',
      'other': formData.purpose_details || 'Mahitaji mengine.'
    };
    const purposeText = purposeMap[formData.purpose] || formData.purpose || 'Matumizi rasmi.';

    // Collect all institutions (primary + extras)
    const institutions: { name: string; address: string }[] = [];
    
    // Primary institution (field names updated to match new schema)
    const primaryName = formData.institution_1_name || formData.institution_name || '';
    const primaryAddress = formData.institution_1_address || formData.institution_address || '';
    if (primaryName) {
      institutions.push({ name: primaryName, address: primaryAddress });
    }
    
    // Extra institutions (2-6) based on num_extra_addresses
    const numExtra = parseInt(formData.num_extra_addresses || '0');
    for (let i = 2; i <= numExtra + 1 && i <= 6; i++) {
      const instName = formData[`institution_${i}_name`];
      const instAddr = formData[`institution_${i}_address`] || '';
      if (instName) {
        institutions.push({ name: instName, address: instAddr });
      }
    }
    
    // If no institutions found, add a placeholder
    if (institutions.length === 0) {
      institutions.push({ name: 'Taasisi Husika', address: '' });
    }

    // Generate a page for each institution
    const renderLetterPage = (inst: { name: string; address: string }, index: number) => (
      <Page key={index} size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Photo Box - Top Left */}
            <View style={styles.photoSection}>
              <View style={styles.photoBox}>
                {user?.photo_url ? (
                  <Image src={user.photo_url} style={styles.photo} />
                ) : (
                  <Text style={styles.photoPlaceholder}>PICHA{'\n'}PHOTO</Text>
                )}
              </View>
              <Text style={styles.nidaLabel}>NIDA</Text>
              <Text style={styles.nidaNumber}>{user?.nida_number || 'N/A'}</Text>
            </View>

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
                <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.application_number}{institutions.length > 1 ? `-${index + 1}` : ''}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={styles.refText}>Tarehe:</Text>
                <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
              </View>
            </View>

            {/* Destination Institution */}
            <View style={{ marginTop: 10, marginBottom: 5 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold' }}>KWENDA:</Text>
              <Text style={{ fontSize: 11, marginLeft: 10 }}>{inst.name}</Text>
              {inst.address && <Text style={{ fontSize: 10, marginLeft: 10, color: '#666' }}>{inst.address}</Text>}
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
              <Text style={styles.fieldLabel}>, Kata ya</Text>
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
              Barua hii imetolewa kwa <Text style={styles.italicText}>madhumuni ya kumtambua</Text> mhusika tajwa hapo juu kwa matumizi rasmi katika taasisi ya {inst.name}.
            </Text>

            {/* Note about specific use */}
            <Text style={{ fontSize: 9, marginTop: 10, fontStyle: 'italic', color: '#666' }}>
              Barua hii ni ya matumizi maalumu kwa taasisi iliyoainishwa hapo juu pekee.
            </Text>

            {/* Caution Box for Introduction Letter */}
            <View style={{ backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#DC2626', borderRadius: 4, padding: 6, marginTop: 8 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#991B1B', marginBottom: 2 }}>⚠ TAHADHARI / CAUTION:</Text>
              <Text style={{ fontSize: 7, color: '#7F1D1D', lineHeight: 1.3 }}>
                1. Barua hii ni ya matumizi ya MARA MOJA pekee kwa taasisi tajwa.{'\n'}
                2. Haiwezi kutumika kwa taasisi au madhumuni mengine.{'\n'}
                3. Kughushi barua hii ni kosa la jinai.{'\n'}
                4. This letter is for SINGLE USE only at the named institution.
              </Text>
            </View>

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
    );

    return (
      <Document>
        {institutions.map((inst, index) => renderLetterPage(inst, index))}
      </Document>
    );
  }

  // RISITI YA MALIPO - Payment Receipt (Enhanced Format)
  if (documentType.includes('RISITI') || documentType.toLowerCase().includes('receipt')) {
    const fee = Number(service?.fee) || 3000;
    const vatAmount = Math.round(fee * 0.18);
    const regionAmount = Math.round(fee * 0.10);
    const districtAmount = Math.round(fee * 0.15);
    const wardAmount = Math.round(fee * 0.20);
    const streetAmount = Math.round(fee * 0.27);
    const serviceChargeAmount = Math.round(fee * 0.10);
    
    const receiptNo = `EMT-RCP-${issueDate.toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const controlNo = application.control_number || `99${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    const transactionId = application.transaction_id || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const paymentTime = issueDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const paymentDate = `${issueDate.getDate().toString().padStart(2, '0')}/${(issueDate.getMonth() + 1).toString().padStart(2, '0')}/${issueDate.getFullYear()}`;
    const maskedPhone = user.phone ? `${user.phone.substring(0, 6)}XXXXXX` : '255XXXXXXXXX';

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              {/* Header - matching HATI/CHETI format */}
              <View style={styles.header}>
                <Image src={TANZANIA_LOGO_URL} style={styles.emblem} />
                <Text style={styles.republicText}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
                <Text style={styles.officeText}>OFISI YA RAIS</Text>
                <Text style={styles.subOfficeText}>TAWALA ZA MIKOA NA SERIKALI ZA MITAA</Text>
              </View>

              <Text style={styles.title}>RISITI YA MALIPO</Text>

              {/* Reference and Date - matching HATI/CHETI format */}
              <View style={styles.refDateRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Namba ya Risiti:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{receiptNo}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.refText}>Tarehe:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 120 }]}>{formatDateSwahili(issueDate)}</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ MALIPO YAMEKAMILIKA</Text>
                </View>
              </View>

              {/* TAARIFA ZA MUAMALA */}
              <Text style={styles.sectionHeader}>TAARIFA ZA MUAMALA</Text>
              <View style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <View style={{ width: '50%', marginBottom: 4 }}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Control Number:</Text>
                      <Text style={styles.fieldValue}>{controlNo}</Text>
                    </View>
                  </View>
                  <View style={{ width: '50%', marginBottom: 4 }}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Transaction ID:</Text>
                      <Text style={styles.fieldValue}>{transactionId}</Text>
                    </View>
                  </View>
                  <View style={{ width: '50%', marginBottom: 4 }}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Saa:</Text>
                      <Text style={styles.fieldValue}>{paymentTime}</Text>
                    </View>
                  </View>
                  <View style={{ width: '50%', marginBottom: 4 }}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Njia ya Malipo:</Text>
                      <Text style={styles.fieldValue}>{application.payment_method || 'M-Pesa'}</Text>
                    </View>
                  </View>
                  <View style={{ width: '50%', marginBottom: 4 }}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Namba Iliyolipa:</Text>
                      <Text style={styles.fieldValue}>{maskedPhone}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* TAARIFA ZA MLIPAJI */}
              <Text style={styles.sectionHeader}>TAARIFA ZA MLIPAJI</Text>
              <View style={{ marginBottom: 10 }}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Jina la Mlipaji:</Text>
                  <Text style={styles.fieldValueLong}>{fullName}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Namba ya NIDA:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 180 }]}>{user.nida_number || 'N/A'}</Text>
                </View>
              </View>

              {/* TAARIFA ZA HUDUMA */}
              <Text style={styles.sectionHeader}>TAARIFA ZA HUDUMA</Text>
              <View style={{ marginBottom: 10 }}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Huduma:</Text>
                  <Text style={styles.fieldValueLong}>{service?.name || 'Huduma'}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Namba ya Maombi:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 150 }]}>{application.application_number}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Mkoa:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 140 }]}>{formData.region || user.region || ''}</Text>
                  <Text style={styles.fieldLabel}>, Wilaya:</Text>
                  <Text style={styles.fieldValueLong}>{formData.district || user.district || ''}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Kata:</Text>
                  <Text style={[styles.fieldValue, { minWidth: 140 }]}>{formData.ward || user.ward || ''}</Text>
                  <Text style={styles.fieldLabel}>, Mtaa:</Text>
                  <Text style={styles.fieldValueLong}>{formData.street || user.street || ''}</Text>
                </View>
              </View>

              {/* MGANYO WA MALIPO */}
              <Text style={styles.sectionHeader}>MGANYO WA MALIPO</Text>
              <View style={{ marginBottom: 10 }}>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={styles.tableCellHeader}>Maelezo</Text></View>
                    <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>%</Text></View>
                    <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>Kiasi (TZS)</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>Kodi ya Ongezeko (VAT)</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>18%</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{vatAmount.toLocaleString()}</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>Mkoa</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>10%</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{regionAmount.toLocaleString()}</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>Wilaya</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>15%</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{districtAmount.toLocaleString()}</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>Kata</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>20%</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{wardAmount.toLocaleString()}</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>Mtaa</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>27%</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{streetAmount.toLocaleString()}</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>Ada ya Huduma</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>10%</Text></View>
                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{serviceChargeAmount.toLocaleString()}</Text></View>
                  </View>
                </View>
              </View>

              {/* JUMLA */}
              <View style={{ alignItems: 'flex-end', marginVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>JUMLA KUU: </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1B5E20' }}>TZS {fee.toLocaleString()}</Text>
                </View>
              </View>

              <Text style={styles.bodyText}>
                Risiti hii ni uthibitisho wa malipo yaliyofanywa kwa huduma iliyotajwa hapo juu.
              </Text>

              {/* Footer with QR - matching HATI/CHETI format */}
              <View style={styles.footer}>
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    <Image src={qrUrl} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>QR CODE YA UTHIBITISHO</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ MALIPO YAMETHIBITISHWA</Text>
                    </View>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Kasiimu wa Fedha</Text>
                  </View>

                  <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>Mtendaji wa Kata</Text>
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
                    <Text style={styles.qrLabel}>QR CODE YA UTHIBITISHO</Text>
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
