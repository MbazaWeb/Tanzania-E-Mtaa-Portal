import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFViewer } from '@react-pdf/renderer';

// Register fonts if needed
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCOjAkZgdPTi9cHCcZfMDpn3dk.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#FDF5E6', // Cream
  },
  border: {
    border: '4pt solid #8B4513', // Brown
    height: '100%',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  republicText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  officeText: {
    fontSize: 12,
    marginBottom: 10,
  },
  emblem: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginVertical: 20,
    textTransform: 'uppercase',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'justify',
    width: '100%',
    marginTop: 20,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 150,
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  signature: {
    textAlign: 'center',
    borderTop: '1pt solid black',
    paddingTop: 5,
    width: 150,
  },
  signatureImage: {
    width: 100,
    height: 40,
    marginBottom: -10,
    marginLeft: 25,
  },
  profilePic: {
    width: 80,
    height: 100,
    border: '1pt solid #ccc',
    objectFit: 'cover',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
  totalSection: {
    marginTop: 10,
    alignItems: 'flex-end',
    width: '100%',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    width: 80,
    textAlign: 'right',
  },
  meta: {
    fontSize: 10,
    color: '#666',
  }
});

interface DocumentRendererProps {
  application: any;
  service: any;
  qrCodeDataUrl?: string;
}

const TANZANIA_LOGO_URL = "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png";

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  application,
  service,
  qrCodeDataUrl
}) => {
  const formData = application.form_data;
  const user = application.user || {};
  const template = service.document_template || {};

  // Simple template engine
  const renderTemplate = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\[FULL_NAME\]/g, `${user.first_name} ${user.last_name}`)
      .replace(/\[NIDA_NUMBER\]/g, user.nida_number || 'N/A')
      .replace(/\[STREET\]/g, formData.street || user.street || 'N/A')
      .replace(/\[SELECTED_WARD\]/g, formData.ward || user.ward || 'N/A')
      .replace(/\[SELECTED_DISTRICT\]/g, formData.district || user.district || 'N/A')
      .replace(/\[SELECTED_REGION\]/g, formData.region || user.region || 'N/A')
      .replace(/\[DOB\]/g, user.dob || 'N/A')
      .replace(/\[HOUSE_NUMBER\]/g, formData.house_number || 'N/A')
      .replace(/\[BLOCK_NUMBER\]/g, formData.block_number || '')
      .replace(/\[PHONE_NUMBER\]/g, user.phone || 'N/A')
      .replace(/\[PURPOSE\]/g, formData.purpose || 'N/A')
      .replace(/\[RESPONDENT_NAME\]/g, formData.respondent_name || 'N/A')
      .replace(/\[INCIDENT_DATE\]/g, formData.incident_date || 'N/A')
      .replace(/\[SUMMARY\]/g, formData.summary || 'N/A')
      .replace(/\[RELIEF_SOUGHT\]/g, formData.relief_sought || 'N/A')
      .replace(/\[EVENT_NAME\]/g, formData.event_name || 'N/A')
      .replace(/\[EVENT_TYPE\]/g, formData.event_type || 'N/A')
      .replace(/\[VENUE\]/g, formData.venue || 'N/A')
      .replace(/\[EXPECTED_GUESTS\]/g, String(formData.expected_guests || 'N/A'))
      .replace(/\[CONTACT_PERSON\]/g, formData.contact_person || 'N/A')
      .replace(/\[CONTACT_PHONE\]/g, formData.contact_phone || 'N/A')
      .replace(/\[DECEASED_FULL_NAME\]/g, formData.deceased_full_name || 'N/A')
      .replace(/\[FATHER'S_NAME\]/g, formData.fathers_name || 'N/A')
      .replace(/\[MOTHER'S_NAME\]/g, formData.mothers_name || 'N/A')
      .replace(/\[DATE_OF_DEATH\]/g, formData.date_of_death || 'N/A')
      .replace(/\[PLACE_OF_DEATH\]/g, formData.place_of_death || 'N/A')
      .replace(/\[AGE\]/g, formData.age_at_death || 'N/A')
      .replace(/\[SPOUSE_NAME\]/g, formData.surviving_spouse || 'N/A')
      .replace(/\[CHILDREN_NAMES\]/g, formData.children_names || 'N/A')
      .replace(/\[FUNERAL_DATE\]/g, formData.service_date || 'N/A')
      .replace(/\[TIME\]/g, formData.service_time || 'N/A')
      .replace(/\[BURIAL_LOCATION\]/g, formData.burial_location || 'N/A')
      .replace(/\[BODY_LOCATION\]/g, formData.body_location || 'N/A')
      .replace(/\[SERVICE_LOCATION\]/g, formData.service_location || 'N/A');
  };

  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(issueDate.getFullYear() + 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.header}>
            <Text style={styles.republicText}>{template.header?.country || 'JAMHURI YA MUUNGANO WA TANZANIA'}</Text>
            <Text style={styles.officeText}>{template.header?.office || 'OFISI YA RAIS - TAMISEMI'}</Text>
            <Image 
              src={template.header?.logo_url || TANZANIA_LOGO_URL} 
              style={styles.emblem} 
            />
            <Text style={styles.officeText}>{formData.council || 'HALMASHAURI YA MANISPAA'}</Text>
          </View>

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ fontSize: 10 }}>
              <Text>Kumb. Na: {application.application_number}</Text>
              <Text>Tarehe ya Kutolewa: {issueDate.toLocaleDateString()}</Text>
              <Text>Tarehe ya Kuisha: {expiryDate.toLocaleDateString()}</Text>
            </View>
            {/* Profile Picture */}
            <View style={{ width: 80, height: 100, border: '1pt solid #ccc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {user.photo_url ? (
                <Image src={user.photo_url} style={styles.profilePic} />
              ) : (
                <Text style={{ fontSize: 8, color: '#999' }}>PHOTO</Text>
              )}
            </View>
          </View>

          <Text style={styles.title}>{template.document_type || service.name}</Text>

          <View style={styles.content}>
            {template.document_type === 'RISITI YA MALIPO' ? (
              <>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 10 }}>Mlipaji: {user.first_name} {user.last_name}</Text>
                  <Text style={{ fontSize: 10 }}>Namba ya NIDA: {user.nida_number || 'N/A'}</Text>
                  <Text style={{ fontSize: 10 }}>Simu: {user.phone || 'N/A'}</Text>
                </View>

                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>MAELEZO</Text></View>
                    <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>IDADI</Text></View>
                    <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>BEI</Text></View>
                    <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>JUMLA</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{service.name}</Text></View>
                    <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>1</Text></View>
                    <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{service.fee}</Text></View>
                    <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{service.fee}</Text></View>
                  </View>
                </View>

                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>JUMLA KUU:</Text>
                    <Text style={styles.totalValue}>TZS {service.fee}</Text>
                  </View>
                  <Text style={{ fontSize: 9, fontStyle: 'italic', marginTop: 5 }}>
                    Njia ya Malipo: {application.payment_method || 'Online'}
                  </Text>
                </View>
              </>
            ) : template.document_type === 'CHETI CHA MKAZI' ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <View style={{ backgroundColor: '#E8F5E9', padding: '4 10', borderRadius: 20, border: '1pt solid #4CAF50' }}>
                    <Text style={{ fontSize: 8, color: '#2E7D32', fontWeight: 'bold' }}>NIDA VERIFIED ✓</Text>
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>HATI HII INATHIBITISHA KUWA</Text>
                </View>

                <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 5, fontWeight: 'bold', color: '#2C3E50' }}>
                  {user.first_name} {user.last_name}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 10, marginBottom: 15 }}>MKAZI HALALI WA {formData.council || 'HALMASHAURI HII'}</Text>

                <View style={{ borderTop: '1pt solid #eee', paddingTop: 10, marginBottom: 15 }}>
                  <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                    SERIKALI YA JAMHURI YA MUUNGANO WA TANZANIA imemthibitisha na kumsajili ndugu {user.first_name} {user.last_name} mwenye namba ya NIDA {user.nida_number || 'N/A'} kama mkazi halali wa eneo la {formData.ward || user.ward || 'N/A'}, {formData.district || user.district || 'N/A'}, {formData.region || user.region || 'N/A'}.
                  </Text>
                </View>

                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>HAKI NA HADHI:</Text>
                  {[
                    "Haki ya kupata huduma za afya katika vituo vya serikali",
                    "Haki ya kujiandikisha na kupiga kura",
                    "Haki ya kufanya shughuli za biashara halali",
                    "Haki ya kumiliki mali na ardhi kwa mujibu wa sheria"
                  ].map((right, idx) => (
                    <Text key={idx} style={{ fontSize: 9, marginBottom: 2 }}>• {right}</Text>
                  ))}
                </View>

                <View style={{ backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, borderLeft: '3pt solid #8B4513' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 3 }}>ANWANI YA HUDUMA / INTENDED ADDRESS:</Text>
                  <Text style={{ fontSize: 9 }}>Taasisi: {formData.institution_name || 'N/A'}</Text>
                  <Text style={{ fontSize: 9 }}>Sababu: {formData.purpose || 'N/A'}</Text>
                </View>
              </>
            ) : template.document_type === 'HATI YA MAKUBALIANO' ? (
              <>
                <Text style={{ textAlign: 'center', fontSize: 14, marginBottom: 15, fontWeight: 'bold', textDecoration: 'underline' }}>
                  UTHIBITISHO WA MAKUBALIANO YA MAUZIANO
                </Text>
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 11, lineHeight: 1.6 }}>
                    Ofisi ya Serikali ya Mtaa inathibitisha kuwa kumefanyika makubaliano ya mauziano ya mali yenye maelezo yafuatayo:
                  </Text>
                </View>

                <View style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                  <Text style={{ fontSize: 10, marginBottom: 5 }}><Text style={{ fontWeight: 'bold' }}>Aina ya Mali:</Text> {formData.asset_type || 'N/A'}</Text>
                  <Text style={{ fontSize: 10, marginBottom: 5 }}><Text style={{ fontWeight: 'bold' }}>Maelezo:</Text> {formData.asset_description || 'N/A'}</Text>
                  <Text style={{ fontSize: 10, marginBottom: 5 }}><Text style={{ fontWeight: 'bold' }}>Thamani ya Mauziano:</Text> TZS {formData.sale_price || '0'}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
                  <View style={{ flex: 1, border: '1pt solid #eee', padding: 10, borderRadius: 5 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', borderBottom: '1pt solid #eee', pb: 3, mb: 5 }}>MUUZAJI (SELLER)</Text>
                    <Text style={{ fontSize: 9 }}>Jina: {user.first_name} {user.last_name}</Text>
                    <Text style={{ fontSize: 9 }}>TIN: {formData.seller_tin || 'N/A'}</Text>
                    <Text style={{ fontSize: 9 }}>NIDA: {user.nida_number || 'N/A'}</Text>
                  </View>
                  <View style={{ flex: 1, border: '1pt solid #eee', padding: 10, borderRadius: 5 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', borderBottom: '1pt solid #eee', pb: 3, mb: 5 }}>MNUNUZI (BUYER)</Text>
                    <Text style={{ fontSize: 9 }}>Jina: {formData.buyer_name || 'N/A'}</Text>
                    <Text style={{ fontSize: 9 }}>NIDA: {formData.buyer_nida || 'N/A'}</Text>
                  </View>
                </View>

                <View style={{ borderTop: '1pt solid #eee', pt: 10 }}>
                  <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#666' }}>
                    Makubaliano haya yamehakikiwa kidijitali na pande zote mbili na kuidhinishwa na Ofisi ya Serikali ya Mtaa.
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{template.subject || 'YAH: UTAMBULISHO WA MKAZI'}</Text>
                
                <Text style={{ marginBottom: 15 }}>
                  {renderTemplate(template.body_template || 'Naomba kumtambulisha ya kwamba ndugu [FULL_NAME] ni mkazi halali wa eneo letu.')}
                </Text>

                <Text style={{ marginBottom: 15 }}>
                  Ofisi yangu haina pingamizi dhidi yake, hivyo basi naomba apewe msaada / huduma anayohitaji.
                </Text>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <View>
              <Image 
                src={qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${application.application_number}`} 
                style={styles.qrCode} 
              />
              <Text style={styles.meta}>Namba ya Cheti: {application.certificate_id || application.application_number}</Text>
              <Text style={styles.meta}>{template.footer || 'Hati hii imethibitishwa kidijitali.'}</Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Jon_Kirsch%27s_Signature.svg/1200px-Jon_Kirsch%27s_Signature.svg.png" 
                style={styles.signatureImage} 
              />
              <View style={styles.signature}>
                <Text style={{ fontSize: 10 }}>Saini ya Afisa</Text>
              </View>
              <Text style={{ fontSize: 9, marginTop: 4 }}>Mwenyekiti wa Mtaa/Kijiji</Text>
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
            <h3 className="text-lg font-bold text-stone-800">Document Preview</h3>
            <p className="text-sm text-stone-500">{application.application_number}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
