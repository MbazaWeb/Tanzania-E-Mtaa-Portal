import { Service } from '@/src/lib/supabase';

export const TANZANIA_LOGO_URL = "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png";

export const HARDCODED_SERVICES: Service[] = [
  {
    id: "1",
    name: "Hati ya Mkazi",
    name_en: "Residency Certificate",
    description: "Pata uthibitisho rasmi wa makazi yako kwenye mtaa wako.",
    description_en: "Get official confirmation of your residence in your street.",
    fee: 5000,
    active: true,
    form_schema: [
      {"name": "section_header", "label": "TAARIFA ZA HALMASHAURI", "type": "header"},
      {"name": "council", "label": "Halmashauri", "type": "select", "required": true, "options": [
        {"label": "HALMASHAURI YA MANISPAA YA ARUSHA", "value": "ARUSHA"},
        {"label": "HALMASHAURI YA MANISPAA YA KINONDONI", "value": "KINONDONI"},
        {"label": "HALMASHAURI YA MANISPAA YA ILALA", "value": "ILALA"},
        {"label": "HALMASHAURI YA MANISPAA YA TEMEKE", "value": "TEMEKE"},
        {"label": "HALMASHAURI YA MANISPAA YA UBUNGO", "value": "UBUNGO"},
        {"label": "HALMASHAURI YA MANISPAA YA KIGAMBONI", "value": "KIGAMBONI"},
        {"label": "HALMASHAURI YA MANISPAA YA DODOMA", "value": "DODOMA"},
        {"label": "HALMASHAURI YA MANISPAA YA MBEYA", "value": "MBEYA"},
        {"label": "HALMASHAURI YA MANISPAA YA MWANZA", "value": "MWANZA"},
        {"label": "HALMASHAURI YA MANISPAA YA MOROGORO", "value": "MOROGORO"},
        {"label": "HALMASHAURI YA MANISPAA YA IRINGA", "value": "IRINGA"},
        {"label": "HALMASHAURI YA MANISPAA YA TANGA", "value": "TANGA"},
        {"label": "HALMASHAURI YA MANISPAA YA MOSHI", "value": "MOSHI"},
        {"label": "NYINGINE", "value": "NYINGINE"}
      ]},
      {"name": "section_personal", "label": "TAARIFA BINAFSI (Zilizohakikiwa na NIDA)", "type": "header"},
      {"name": "occupation", "label": "Kazi/Shughuli", "type": "text", "required": true},
      
      {"name": "section_marital", "label": "TAARIFA ZA NDOA", "type": "header"},
      {"name": "marital_status", "label": "Hali ya Ndoa", "type": "select", "options": [
        {"label": "SIJAOA/SIJAOLEWA", "value": "SINGLE"},
        {"label": "NIMEOA/NIMEOLEWA", "value": "MARRIED"},
        {"label": "TALAKA", "value": "DIVORCED"},
        {"label": "MJANE", "value": "WIDOWED"}
      ], "required": true},
      
      {"name": "section_spouse", "label": "TAARIFA ZA MKE/MUME (Jaza kama umeoa/umeolewa)", "type": "header", "showIf": {"field": "marital_status", "value": "MARRIED"}},
      {"name": "spouse_1_name", "label": "Jina Kamili la Mke/Mume wa 1", "type": "text", "showIf": {"field": "marital_status", "value": "MARRIED"}},
      {"name": "spouse_1_nida", "label": "NIDA/Kitambulisho cha Mke/Mume wa 1", "type": "text", "showIf": {"field": "marital_status", "value": "MARRIED"}},
      {"name": "spouse_1_dob", "label": "Tarehe ya Kuzaliwa - Mke/Mume wa 1", "type": "date", "showIf": {"field": "marital_status", "value": "MARRIED"}},
      {"name": "spouse_1_phone", "label": "Namba ya Simu - Mke/Mume wa 1", "type": "text", "showIf": {"field": "marital_status", "value": "MARRIED"}},
      {"name": "spouse_1_occupation", "label": "Kazi/Shughuli - Mke/Mume wa 1", "type": "text", "showIf": {"field": "marital_status", "value": "MARRIED"}},
      
      {"name": "has_multiple_spouses", "label": "Je, una mke/mume zaidi ya mmoja?", "type": "select", "options": [
        {"label": "HAPANA", "value": "NO"},
        {"label": "NDIYO - 2", "value": "YES_2"},
        {"label": "NDIYO - 3", "value": "YES_3"},
        {"label": "NDIYO - 4", "value": "YES_4"}
      ], "showIf": {"field": "marital_status", "value": "MARRIED"}},
      
      {"name": "spouse_2_name", "label": "Jina Kamili la Mke/Mume wa 2", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_2", "YES_3", "YES_4"]}},
      {"name": "spouse_2_nida", "label": "NIDA/Kitambulisho cha Mke/Mume wa 2", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_2", "YES_3", "YES_4"]}},
      {"name": "spouse_2_dob", "label": "Tarehe ya Kuzaliwa - Mke/Mume wa 2", "type": "date", "showIf": {"field": "has_multiple_spouses", "values": ["YES_2", "YES_3", "YES_4"]}},
      {"name": "spouse_2_phone", "label": "Namba ya Simu - Mke/Mume wa 2", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_2", "YES_3", "YES_4"]}},
      {"name": "spouse_2_occupation", "label": "Kazi/Shughuli - Mke/Mume wa 2", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_2", "YES_3", "YES_4"]}},
      
      {"name": "spouse_3_name", "label": "Jina Kamili la Mke/Mume wa 3", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_3", "YES_4"]}},
      {"name": "spouse_3_nida", "label": "NIDA/Kitambulisho cha Mke/Mume wa 3", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_3", "YES_4"]}},
      {"name": "spouse_3_dob", "label": "Tarehe ya Kuzaliwa - Mke/Mume wa 3", "type": "date", "showIf": {"field": "has_multiple_spouses", "values": ["YES_3", "YES_4"]}},
      {"name": "spouse_3_phone", "label": "Namba ya Simu - Mke/Mume wa 3", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_3", "YES_4"]}},
      {"name": "spouse_3_occupation", "label": "Kazi/Shughuli - Mke/Mume wa 3", "type": "text", "showIf": {"field": "has_multiple_spouses", "values": ["YES_3", "YES_4"]}},
      
      {"name": "spouse_4_name", "label": "Jina Kamili la Mke/Mume wa 4", "type": "text", "showIf": {"field": "has_multiple_spouses", "value": "YES_4"}},
      {"name": "spouse_4_nida", "label": "NIDA/Kitambulisho cha Mke/Mume wa 4", "type": "text", "showIf": {"field": "has_multiple_spouses", "value": "YES_4"}},
      {"name": "spouse_4_dob", "label": "Tarehe ya Kuzaliwa - Mke/Mume wa 4", "type": "date", "showIf": {"field": "has_multiple_spouses", "value": "YES_4"}},
      {"name": "spouse_4_phone", "label": "Namba ya Simu - Mke/Mume wa 4", "type": "text", "showIf": {"field": "has_multiple_spouses", "value": "YES_4"}},
      {"name": "spouse_4_occupation", "label": "Kazi/Shughuli - Mke/Mume wa 4", "type": "text", "showIf": {"field": "has_multiple_spouses", "value": "YES_4"}},
      
      {"name": "section_children", "label": "TAARIFA ZA WATOTO", "type": "header"},
      {"name": "has_children", "label": "Je, una watoto?", "type": "select", "options": [
        {"label": "HAPANA", "value": "NO"},
        {"label": "NDIYO", "value": "YES"}
      ], "required": true},
      {"name": "number_of_children", "label": "Idadi ya Watoto", "type": "number", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_1_name", "label": "Jina Kamili la Mtoto wa 1", "type": "text", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_1_dob", "label": "Tarehe ya Kuzaliwa - Mtoto wa 1", "type": "date", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_2_name", "label": "Jina Kamili la Mtoto wa 2", "type": "text", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_2_dob", "label": "Tarehe ya Kuzaliwa - Mtoto wa 2", "type": "date", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_3_name", "label": "Jina Kamili la Mtoto wa 3", "type": "text", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_3_dob", "label": "Tarehe ya Kuzaliwa - Mtoto wa 3", "type": "date", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_4_name", "label": "Jina Kamili la Mtoto wa 4", "type": "text", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_4_dob", "label": "Tarehe ya Kuzaliwa - Mtoto wa 4", "type": "date", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_5_name", "label": "Jina Kamili la Mtoto wa 5", "type": "text", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "child_5_dob", "label": "Tarehe ya Kuzaliwa - Mtoto wa 5", "type": "date", "showIf": {"field": "has_children", "value": "YES"}},
      {"name": "additional_children", "label": "Watoto Wengine (Majina na Tarehe za Kuzaliwa)", "type": "textarea", "showIf": {"field": "has_children", "value": "YES"}},
      
      {"name": "section_dependents", "label": "WATU WENGINE WANAOISHI NAWE (Dependents)", "type": "header"},
      {"name": "has_dependents", "label": "Je, kuna watu wengine wanaoishi nawe?", "type": "select", "options": [
        {"label": "HAPANA", "value": "NO"},
        {"label": "NDIYO", "value": "YES"}
      ]},
      {"name": "dependent_1_name", "label": "Jina la Mtu wa 1", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_1_relationship", "label": "Uhusiano (Kaka, Dada, Mjomba, n.k)", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_1_nida", "label": "NIDA/Kitambulisho", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_1_occupation", "label": "Kazi/Shughuli", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_2_name", "label": "Jina la Mtu wa 2", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_2_relationship", "label": "Uhusiano", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_2_nida", "label": "NIDA/Kitambulisho", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "dependent_2_occupation", "label": "Kazi/Shughuli", "type": "text", "showIf": {"field": "has_dependents", "value": "YES"}},
      {"name": "additional_dependents", "label": "Watu Wengine Wanaoishi Nawe", "type": "textarea", "showIf": {"field": "has_dependents", "value": "YES"}},
      
      {"name": "section_residence", "label": "TAARIFA ZA MAKAZI", "type": "header"},
      {"name": "neighborhood", "label": "Kitongoji", "type": "text", "required": true},
      {"name": "house_number", "label": "Nyumba No.", "type": "text"},
      {"name": "block_number", "label": "Block/Area", "type": "text"},
      
      {"name": "housing_status", "label": "Hali ya Nyumba", "type": "select", "required": true, "options": [
        {"label": "NIMEPANGA (Tenant)", "value": "RENTING"},
        {"label": "NIMEJENGA/NINAMILIKI (Owner)", "value": "OWNER"},
        {"label": "NINAISHI NA NDUGU (Living with relatives)", "value": "WITH_RELATIVES"}
      ]},
      
      {"name": "section_landlord", "label": "TAARIFA ZA MWENYE NYUMBA (Jaza kama umepanga)", "type": "header", "showIf": {"field": "housing_status", "value": "RENTING"}},
      {"name": "landlord_name", "label": "Jina Kamili la Mwenye Nyumba", "type": "text", "showIf": {"field": "housing_status", "value": "RENTING"}},
      {"name": "landlord_nida", "label": "NIDA/Kitambulisho cha Mwenye Nyumba", "type": "text", "showIf": {"field": "housing_status", "value": "RENTING"}},
      {"name": "landlord_phone", "label": "Namba ya Simu ya Mwenye Nyumba", "type": "text", "showIf": {"field": "housing_status", "value": "RENTING"}},
      {"name": "rental_period", "label": "Muda wa Pango (miezi/miaka)", "type": "text", "showIf": {"field": "housing_status", "value": "RENTING"}},
      {"name": "rental_start_date", "label": "Tarehe ya Kuanza Pango", "type": "date", "showIf": {"field": "housing_status", "value": "RENTING"}},
      
      {"name": "section_utilities", "label": "TAARIFA ZA HUDUMA (Utilities)", "type": "header"},
      {"name": "luku_meter_number", "label": "Namba ya Meter ya LUKU (Umeme)", "type": "text"},
      {"name": "water_meter_number", "label": "Namba ya Meter ya Maji", "type": "text"},
      
      {"name": "section_purpose", "label": "SABABU YA MAOMBI", "type": "header"},
      {"name": "purpose", "label": "Sababu ya Maombi", "type": "select", "required": true, "options": [
        {"label": "UTAMBULISHO WA MTAA", "value": "UTAMBULISHO"},
        {"label": "KUSOMA", "value": "KUSOMA"},
        {"label": "AJIRA", "value": "AJIRA"},
        {"label": "BIASHARA", "value": "BIASHARA"},
        {"label": "HUDUMA YA AFYA", "value": "HUDUMA_YA_AFYA"},
        {"label": "HATI YA KUSAFIRI", "value": "HATI_YA_KUSAFIRI"},
        {"label": "KUFUNGUA AKAUNTI YA BENKI", "value": "BENKI"},
        {"label": "KUPATA HUDUMA ZA SERIKALI", "value": "SERIKALI"},
        {"label": "KUOMBA LESENI", "value": "LESENI"},
        {"label": "NYINGINEZO", "value": "NYINGINEZO"}
      ]},
      {"name": "section_intended", "label": "ANWANI YA HUDUMA (INTENDED SERVICE ADDRESS)", "type": "header"},
      {"name": "institution_name", "label": "Jina la Taasisi", "type": "text"},
      {"name": "institution_type", "label": "Aina ya Taasisi", "type": "select", "options": [
        {"label": "OFISI YA SERIKALI", "value": "OFISI_YA_SERIKALI"},
        {"label": "HOSPITALI", "value": "HOSPITALI"},
        {"label": "BENKI", "value": "BENKI"},
        {"label": "SHULE/CHUO", "value": "SHULE_CHUO"},
        {"label": "KAMPUNI/BIASHARA", "value": "KAMPUNI"},
        {"label": "NYINGINE", "value": "NYINGINE"}
      ]}
    ],
    diaspora_form_schema: null,
    validity_months: 12,
    document_template: {
      "document_type": "CHETI CHA MKAZI",
      "header": {
        "country": "JAMHURI YA MUUNGANO WA TANZANIA",
        "office": "OFISI YA RAIS - TAMISEMI",
        "logo_url": "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png"
      },
      "footer": "Cheti hiki ni rasmi na kinaweza kuthibitishwa kwa kuchanganua QR code. Hati hii ina muda wa miezi 12 tangu tarehe ya kutolewa."
    },
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Barua ya Utambulisho",
    name_en: "Introduction Letter",
    description: "Barua rasmi kwa ajili ya kazi, shule, na huduma nyingine.",
    description_en: "Official letter for work, school, and other services.",
    fee: 3000,
    active: true,
    form_schema: [
      {"name": "section_mkazi", "label": "HATI YA MKAZI (Ikiwa Unacho)", "type": "header"},
      {"name": "has_residence_certificate", "label": "Je, una Hati ya Mkazi?", "type": "select", "options": [
        {"label": "NDIYO", "value": "YES"},
        {"label": "HAPANA", "value": "NO"}
      ]},
      {"name": "mkazi_certificate_number", "label": "Namba ya Hati ya Mkazi", "type": "text", "showIf": {"field": "has_residence_certificate", "value": "YES"}, "placeholder": "Mfano: MKZ-2024-123456"},
      
      {"name": "section_purpose", "label": "SABABU YA UTAMBULISHO", "type": "header"},
      {"name": "purpose", "label": "Sababu ya Barua", "type": "select", "required": true, "options": [
        {"label": "KUFUNGUA AKAUNTI YA BENKI", "value": "BENKI"},
        {"label": "MAOMBI YA AJIRA", "value": "AJIRA"},
        {"label": "MAOMBI YA CHUO/SHULE", "value": "CHUO"},
        {"label": "KUPATA HUDUMA ZA AFYA", "value": "AFYA"},
        {"label": "KUOMBA LESENI YA BIASHARA", "value": "LESENI_BIASHARA"},
        {"label": "KUOMBA LESENI YA UDEREVA", "value": "LESENI_UDEREVA"},
        {"label": "KUSAJILI SIMU/SIM CARD", "value": "SIMU"},
        {"label": "KUOMBA PASSPORT/VISA", "value": "PASSPORT"},
        {"label": "KUPATA HUDUMA ZA TRA (Kodi)", "value": "TRA"},
        {"label": "KUPATA HUDUMA ZA BIMA", "value": "BIMA"},
        {"label": "KUSAJILI MTOTO SHULENI", "value": "KUSAJILI_MTOTO"},
        {"label": "KUOMBA MKOPO", "value": "MKOPO"},
        {"label": "KUNUNUA ARDHI/NYUMBA", "value": "ARDHI"},
        {"label": "KUPATA UMEME/MAJI (TANESCO/DAWASCO)", "value": "HUDUMA_UMEME_MAJI"},
        {"label": "UTHIBITISHO KWA WAAJIRI", "value": "WAAJIRI"},
        {"label": "MAOMBI YA SERIKALI", "value": "SERIKALI"},
        {"label": "NYINGINEZO", "value": "NYINGINEZO"}
      ]},
      {"name": "purpose_details", "label": "Maelezo ya Sababu (kama ni NYINGINEZO)", "type": "textarea", "showIf": {"field": "purpose", "value": "NYINGINEZO"}},
      
      {"name": "section_destination", "label": "TAASISI YA KWANZA (PRIMARY DESTINATION)", "type": "header"},
      {"name": "institution_1_name", "label": "Jina la Taasisi", "type": "text", "required": true},
      {"name": "institution_1_address", "label": "Anwani ya Taasisi", "type": "text"},
      {"name": "institution_1_contact", "label": "Jina la Anayehusika (kama unamjua)", "type": "text"},
      
      {"name": "section_extra", "label": "TAASISI ZA ZIADA (Extra TZS 1,000 kwa kila anwani)", "type": "header"},
      {"name": "num_extra_addresses", "label": "Idadi ya Anwani za Ziada", "type": "select", "options": [
        {"label": "HAKUNA (0)", "value": "0"},
        {"label": "1 (Jumla TZS 4,000)", "value": "1"},
        {"label": "2 (Jumla TZS 5,000)", "value": "2"},
        {"label": "3 (Jumla TZS 6,000)", "value": "3"},
        {"label": "4 (Jumla TZS 7,000)", "value": "4"},
        {"label": "5 (Jumla TZS 8,000)", "value": "5"}
      ]},
      
      {"name": "institution_2_name", "label": "Taasisi ya 2 - Jina", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["1", "2", "3", "4", "5"]}},
      {"name": "institution_2_address", "label": "Taasisi ya 2 - Anwani", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["1", "2", "3", "4", "5"]}},
      
      {"name": "institution_3_name", "label": "Taasisi ya 3 - Jina", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["2", "3", "4", "5"]}},
      {"name": "institution_3_address", "label": "Taasisi ya 3 - Anwani", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["2", "3", "4", "5"]}},
      
      {"name": "institution_4_name", "label": "Taasisi ya 4 - Jina", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["3", "4", "5"]}},
      {"name": "institution_4_address", "label": "Taasisi ya 4 - Anwani", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["3", "4", "5"]}},
      
      {"name": "institution_5_name", "label": "Taasisi ya 5 - Jina", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["4", "5"]}},
      {"name": "institution_5_address", "label": "Taasisi ya 5 - Anwani", "type": "text", "showIf": {"field": "num_extra_addresses", "values": ["4", "5"]}},
      
      {"name": "institution_6_name", "label": "Taasisi ya 6 - Jina", "type": "text", "showIf": {"field": "num_extra_addresses", "value": "5"}},
      {"name": "institution_6_address", "label": "Taasisi ya 6 - Anwani", "type": "text", "showIf": {"field": "num_extra_addresses", "value": "5"}},
      
      {"name": "additional_info", "label": "Maelezo ya Ziada", "type": "textarea"}
    ],
    diaspora_form_schema: null,
    extra_address_fee: 1000,
    document_template: {
      "document_type": "BARUA YA UTAMBULISHO",
      "header": {
        "country": "JAMHURI YA MUUNGANO WA TANZANIA",
        "office": "OFISI YA RAIS - TAMISEMI",
        "logo_url": "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png"
      },
      "subject": "YAH: UTAMBULISHO WA NDUGU [FULL_NAME]",
      "body_template": "Ofisi ya Serikali ya Mtaa inamtambulisha ndugu [FULL_NAME] kuwa ni mkazi halali wa mtaa huu. Barua hii imetolewa kwa ajili ya [PURPOSE] katika taasisi ya [INSTITUTION_NAME].",
      "footer": "Barua hii ni ya matumizi maalumu kwa taasisi iliyoainishwa hapo juu pekee.",
      "multi_address_note": "Barua tofauti zitatayarishwa kwa kila taasisi iliyoainishwa."
    },
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Kibali cha Tukio",
    name_en: "Event Permit",
    description: "Vibali vya matukio na sherehe za mtaani.",
    description_en: "Permits for events and street celebrations.",
    fee: 10000,
    active: true,
    form_schema: [
      {"name": "section_event", "label": "TAARIFA ZA TUKIO", "type": "header"},
      {"name": "event_type", "label": "Aina ya Tukio", "type": "select", "required": true, "options": [
        {"label": "SHEREHE YA HARUSI", "value": "HARUSI"},
        {"label": "MAZISHI / KISOMO", "value": "MAZISHI"},
        {"label": "MKUTANO WA HADHARA", "value": "MKUTANO"},
        {"label": "NYINGINEZO", "value": "NYINGINEZO"}
      ]},
      {"name": "event_date", "label": "Tarehe ya Tukio", "type": "date", "required": true},
      {"name": "event_location", "label": "Mahali pa Tukio", "type": "text", "required": true},
      {"name": "expected_guests", "label": "Idadi ya Wageni", "type": "number"}
    ],
    diaspora_form_schema: null,
    document_template: {
      "document_type": "KIBALI CHA TUKIO",
      "header": {
        "country": "JAMHURI YA MUUNGANO WA TANZANIA",
        "office": "OFISI YA RAIS - TAMISEMI",
        "logo_url": "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png"
      },
      "subject": "YAH: KIBALI CHA KUFANYA [EVENT_TYPE]",
      "body_template": "Ofisi ya Serikali ya Mtaa inatoa kibali kwa ndugu [FULL_NAME] kufanya [EVENT_TYPE] katika eneo la [EVENT_LOCATION] tarehe [EVENT_DATE].",
      "footer": "Kibali hiki kinapaswa kuonyeshwa kwa mamlaka za usalama pindi kikihitajika."
    },
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Kibali cha Mazishi",
    name_en: "Burial Permit",
    description: "Kibali rasmi cha mazishi.",
    description_en: "Official burial permit.",
    fee: 2000,
    active: true,
    form_schema: [
      {"name": "section_deceased", "label": "TAARIFA ZA MAREHEMU", "type": "header"},
      {"name": "deceased_full_name", "label": "Jina Kamili la Marehemu", "type": "text", "required": true},
      {"name": "date_of_death", "label": "Tarehe ya Kufariki", "type": "date", "required": true},
      {"name": "burial_location", "label": "Mahala pa Kuzika", "type": "text", "required": true},
      {"name": "family_representative", "label": "Mwakilishi wa Familia", "type": "text", "required": true},
      {"name": "representative_phone", "label": "Simu ya Mwakilishi", "type": "tel", "required": true}
    ],
    diaspora_form_schema: null,
    document_template: {
      "document_type": "KIBALI CHA MAZISHI",
      "header": {
        "country": "JAMHURI YA MUUNGANO WA TANZANIA",
        "office": "OFISI YA RAIS - TAMISEMI",
        "logo_url": "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png"
      },
      "subject": "YAH: TAARIFA YA MSIBA NA MAZISHI YA [DECEASED_FULL_NAME]",
      "body_template": "Kwa huzuni kubwa, tunamtangaza kifo cha ndugu yetu mpenzi [DECEASED_FULL_NAME], ambaye ametufia tarehe [DATE_OF_DEATH]. Marehemu atazikwa katika [BURIAL_LOCATION].",
      "footer": "Mwenyezi Mungu ailaze roho ya marehemu mahala pema peponi. Amina."
    },
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "Makubaliano ya Mauziano",
    name_en: "Sales Agreement",
    description: "Sajili makubaliano ya mauziano ya mali. Ada ya huduma ni 5% na VAT ni 18% ya thamani ya mauziano.",
    description_en: "Register property sales agreements. Service fee is 5% and VAT is 18% of the sale value.",
    fee: 0,
    active: true,
    form_schema: [
      {"name": "section_asset", "label": "TAARIFA ZA MALI (ASSET DETAILS)", "type": "header"},
      {"name": "asset_type", "label": "Aina ya Mali", "type": "select", "options": [
        {"label": "ARDHI / KIWANJA", "value": "ARDHI"},
        {"label": "GARI / CHOMBO CHA MOTO", "value": "GARI"},
        {"label": "NYUMBA", "value": "NYUMBA"},
        {"label": "NYINGINEZO", "value": "NYINGINEZO"}
      ], "required": true},
      
      // Plot specific fields
      {"name": "plot_type", "label": "Aina ya Kiwanja", "type": "select", "options": [
        {"label": "MAKAZI (RESIDENTIAL)", "value": "MAKAZI"},
        {"label": "BIASHARA (COMMERCIAL)", "value": "BIASHARA"},
        {"label": "VIWANDA (INDUSTRIAL)", "value": "VIWANDA"},
        {"label": "KILIMO (AGRICULTURAL)", "value": "KILIMO"}
      ], "showIf": {"field": "asset_type", "value": "ARDHI"}},
      {"name": "plot_number", "label": "Namba ya Kiwanja / Block", "type": "text", "showIf": {"field": "asset_type", "value": "ARDHI"}},
      
      // Car specific fields
      {"name": "car_reg_no", "label": "Namba ya Usajili (Registration No.)", "type": "text", "showIf": {"field": "asset_type", "value": "GARI"}},
      {"name": "car_make", "label": "Aina ya Gari (Make/Model)", "type": "text", "showIf": {"field": "asset_type", "value": "GARI"}},
      {"name": "car_chassis", "label": "Namba ya Chassis", "type": "text", "showIf": {"field": "asset_type", "value": "GARI"}},
      
      // House specific fields
      {"name": "house_no", "label": "Namba ya Nyumba", "type": "text", "showIf": {"field": "asset_type", "value": "NYUMBA"}},
      {"name": "house_type", "label": "Aina ya Nyumba", "type": "select", "options": [
        {"label": "NYUMBA YA KAWAIDA (BUNGALOW)", "value": "BUNGALOW"},
        {"label": "GHOROFA (STOREY BUILDING)", "value": "STOREY"},
        {"label": "APARTMENT", "value": "APARTMENT"},
        {"label": "NYUMBA YA KUPANGA (TENEMENT)", "value": "TENEMENT"},
        {"label": "NYINGINEZO (OTHER)", "value": "OTHER"}
      ], "showIf": {"field": "asset_type", "value": "NYUMBA"}},

      {"name": "section_location", "label": "MAHALI HALISI ILIPO MALI (EXACT LOCATION)", "type": "header"},
      {"name": "region", "label": "Mkoa", "type": "text", "required": true},
      {"name": "district", "label": "Wilaya", "type": "text", "required": true},
      {"name": "ward", "label": "Kata", "type": "text", "required": true},
      {"name": "street", "label": "Mtaa / Kitongoji", "type": "text", "required": true},
      {"name": "gps_coordinates", "label": "GPS Coordinates (Kama unazo)", "type": "text", "placeholder": "-6.7924, 39.2083"},
      
      {"name": "asset_description", "label": "Maelezo ya Ziada ya Mali", "type": "textarea", "required": true},
      {"name": "section_sale_calc", "label": "HESABU ZA MAUZIANO (SALE CALCULATIONS)", "type": "header"},
      {"name": "sale_price", "label": "Bei ya Mauziano (TZS)", "type": "number", "required": true},
      {"name": "vat_amount", "label": "VAT (18%) - TZS", "type": "number", "required": true, "disabled": true},
      {"name": "service_fee", "label": "Ada ya Huduma (5%) - TZS", "type": "number", "required": true, "disabled": true},
      {"name": "total_amount", "label": "Jumla Kuu (Total Amount) - TZS", "type": "number", "required": true, "disabled": true},
      {"name": "section_seller", "label": "TAARIFA ZA MUUZAJI (SELLER)", "type": "header"},
      {"name": "seller_name", "label": "Jina Kamili la Muuzaji", "type": "text", "required": true},
      {"name": "seller_tin", "label": "Namba ya TIN (TRA)", "type": "text", "required": true},
      {"name": "agreement_file", "label": "Pakia Mkataba wa Mauziano (Attached Agreement)", "type": "file", "required": true},
      {"name": "section_buyer_info", "label": "TAARIFA ZA MNUNUZI (BUYER)", "type": "header"},
      {"name": "buyer_is_self", "label": "Je, mnunuzi ni wewe mwenyewe?", "type": "select", "options": [
        {"label": "NDIYO - Mimi ndiye mnunuzi", "value": "SELF"},
        {"label": "HAPANA - Mnunuzi ni mtu mwingine", "value": "OTHER"}
      ], "required": true},
      {"name": "buyer_nida", "label": "Namba ya NIDA ya Mnunuzi", "type": "text", "required": true},
      {"name": "buyer_name", "label": "Jina Kamili la Mnunuzi", "type": "text", "required": true}
    ],
    diaspora_form_schema: null,
    document_template: {
      "document_type": "HATI YA MAKUBALIANO",
      "header": {
        "country": "JAMHURI YA MUUNGANO WA TANZANIA",
        "office": "OFISI YA RAIS - TAMISEMI",
        "logo_url": "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png"
      },
      "subject": "YAH: UTHIBITISHO WA MAKUBALIANO YA MAUZIANO YA [ASSET_TYPE]",
      "body_template": "Ofisi ya Serikali ya Mtaa inathibitisha kuwa kumefanyika makubaliano ya mauziano ya [ASSET_TYPE] yaliyopo [STREET], [WARD], [DISTRICT], [REGION] (Namba: [PLOT_NUMBER]/[HOUSE_NO]/[CAR_REG_NO]) yenye thamani ya TZS [SALE_PRICE] kati ya Muuzaji [SELLER_NAME] na Mnunuzi [BUYER_NAME]. Jumla ya malipo ikijumuisha kodi na ada ni TZS [TOTAL_AMOUNT].",
      "footer": "Hati hii ni uthibitisho wa kisheria wa mauziano haya yaliyosajiliwa kupitia E-Mtaa."
    },
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "PANGISHA - Makubaliano ya Pango",
    name_en: "PANGISHA - Rent Agreement",
    description: "Sajili mkataba wa pango kati ya mwenye nyumba na mpangaji. Ada ya huduma ni 3% ya kodi itakayolipwa.",
    description_en: "Register a rent agreement between landlord and tenant. Service fee is 3% of the total rent.",
    fee: 0,
    active: true,
    form_schema: [
      {"name": "section_property", "label": "TAARIFA ZA NYUMBA (PROPERTY DETAILS)", "type": "header"},
      {"name": "property_type", "label": "Aina ya Nyumba/Pango", "type": "select", "options": [
        {"label": "NYUMBA YA KUISHI", "value": "LIVING"},
        {"label": "FREMU YA BIASHARA", "value": "BUSINESS"},
        {"label": "KIWANJA / SHAMBA", "value": "LAND"}
      ], "required": true},
      
      // Dynamic Living Details
      {"name": "living_space_type", "label": "Je ni nyumba nzima au chumba?", "type": "select", "options": [
        {"label": "NYUMBA NZIMA", "value": "FULL_HOUSE"},
        {"label": "CHUMBA / VYUMBA", "value": "ROOM"}
      ], "showIf": {"field": "property_type", "value": "LIVING"}},
      {"name": "house_type", "label": "Aina ya Nyumba", "type": "select", "options": [
        {"label": "NYUMBA YA KAWAIDA (BUNGALOW)", "value": "BUNGALOW"},
        {"label": "GHOROFA (STOREY BUILDING)", "value": "STOREY"},
        {"label": "APARTMENT", "value": "APARTMENT"},
        {"label": "NYUMBA YA KUPANGA (TENEMENT)", "value": "TENEMENT"},
        {"label": "NYINGINEZO (OTHER)", "value": "OTHER"}
      ], "showIf": {"field": "property_type", "value": "LIVING"}},
      {"name": "room_count", "label": "Idadi ya Vyumba", "type": "number", "showIf": {"field": "living_space_type", "value": "ROOM"}},

      {"name": "section_location", "label": "MAHALI HALISI ILIPO NYUMBA (EXACT LOCATION)", "type": "header"},
      {"name": "region", "label": "Mkoa", "type": "text", "required": true},
      {"name": "district", "label": "Wilaya", "type": "text", "required": true},
      {"name": "ward", "label": "Kata", "type": "text", "required": true},
      {"name": "street", "label": "Mtaa / Kitongoji", "type": "text", "required": true},
      {"name": "gps_coordinates", "label": "GPS Coordinates (Kama unazo)", "type": "text", "placeholder": "-6.7924, 39.2083"},
      
      {"name": "house_number", "label": "Namba ya Nyumba / Plot", "type": "text", "required": true},
      {"name": "house_description", "label": "Maelezo ya Nyumba (Mfano: Vyumba 3, Sebule)", "type": "textarea"},
      
      {"name": "section_rent_calc", "label": "HESABU ZA KODI (RENT CALCULATIONS)", "type": "header"},
      {"name": "monthly_rent", "label": "Kodi ya Mwezi (TZS)", "type": "number", "required": true},
      {"name": "payment_period", "label": "Muda wa Malipo (Miezi)", "type": "number", "required": true},
      {"name": "vat_amount", "label": "VAT (18%) - TZS", "type": "number", "required": true, "disabled": true},
      {"name": "service_fee", "label": "Ada ya Huduma (3%) - TZS", "type": "number", "required": true, "disabled": true},
      {"name": "total_rent", "label": "Jumla ya Kodi (Total Rent) - TZS", "type": "number", "required": true, "disabled": true},
      
      {"name": "section_landlord", "label": "TAARIFA ZA MWENYE NYUMBA (LANDLORD)", "type": "header"},
      {"name": "landlord_role", "label": "Mwenye nyumba ni Owner au Msimamizi?", "type": "select", "options": [
        {"label": "MWENYE NYUMBA (OWNER)", "value": "OWNER"},
        {"label": "MSIMAMIZI (MANAGER)", "value": "MANAGER"}
      ], "required": true},
      {"name": "landlord_name", "label": "Jina Kamili la Mwenye Nyumba / Msimamizi", "type": "text", "required": true},
      {"name": "landlord_nida", "label": "Namba ya NIDA ya Mwenye Nyumba / Msimamizi", "type": "text", "required": true},
      {"name": "landlord_phone", "label": "Namba ya Simu ya Mwenye Nyumba / Msimamizi", "type": "tel", "required": true},
      
      {"name": "section_tenant", "label": "TAARIFA ZA MPANGAJI (TENANT)", "type": "header"},
      {"name": "tenant_is_self", "label": "Je, mpangaji ni wewe mwenyewe?", "type": "select", "options": [
        {"label": "NDIYO - Mimi ndiye mpangaji", "value": "SELF"},
        {"label": "HAPANA - Mpangaji ni mtu mwingine", "value": "OTHER"}
      ], "required": true},
      {"name": "tenant_name", "label": "Jina Kamili la Mpangaji", "type": "text", "required": true},
      {"name": "tenant_nida", "label": "Namba ya NIDA ya Mpangaji", "type": "text", "required": true},
      {"name": "tenant_marital_status", "label": "Hali ya Ndoa ya Mpangaji", "type": "select", "options": [
        {"label": "AMEOA / AMEOLEWA", "value": "MARRIED"},
        {"label": "HAJAOA / HAJAOLEWA", "value": "SINGLE"},
        {"label": "TALAKA", "value": "DIVORCED"},
        {"label": "MJANE", "value": "WIDOWED"}
      ], "required": true},
      {"name": "tenant_occupation", "label": "Aina ya Kazi ya Mpangaji", "type": "select", "options": [
        {"label": "MWAJIRIWA", "value": "EMPLOYED"},
        {"label": "MWAJIRIWA BINAFSI", "value": "SELF_EMPLOYED"},
        {"label": "MWANAFUNZI", "value": "STUDENT"},
        {"label": "MKULIMA", "value": "FARMER"},
        {"label": "NYINGINEZO", "value": "OTHER"}
      ], "required": true},
      {"name": "tenant_living_arrangement", "label": "Mpangaji anaishi peke yake au na familia?", "type": "select", "options": [
        {"label": "PEKE YANGU (ALONE)", "value": "ALONE"},
        {"label": "NA FAMILIA (WITH FAMILY)", "value": "FAMILY"}
      ], "required": true},
      {"name": "family_member_count", "label": "Idadi ya wanafamilia watakaoishi hapa", "type": "number", "showIf": {"field": "tenant_living_arrangement", "value": "FAMILY"}},
      
      {"name": "section_agreement", "label": "MAKUBALIANO NA SERA", "type": "header"},
      {"name": "agreement_terms", "label": "Vigezo na Masharti", "type": "textarea", "required": true},
      {"name": "agreement_accepted", "label": "Nimekubali vigezo na masharti ya pango", "type": "checkbox", "required": true}
    ],
    document_template: {
      "document_type": "MKATABA WA PANGO (PANGISHA)",
      "header": {
        "country": "JAMHURI YA MUUNGANO WA TANZANIA",
        "office": "OFISI YA RAIS - TAMISEMI",
        "logo_url": "https://e-serikali-mtaa.vercel.app/tz-coat-of-arms.png"
      },
      "subject": "YAH: UTHIBITISHO WA MKATABA WA PANGO LA NYUMBA [HOUSE_NUMBER]",
      "body_template": "Ofisi ya Serikali ya Mtaa inathibitisha mkataba wa pango kati ya Mwenye Nyumba [LANDLORD_NAME] na Mpangaji [TENANT_NAME] kwa ajili ya nyumba namba [HOUSE_NUMBER] iliyopo [STREET], [WARD], [DISTRICT], [REGION]. Kodi ya pango ni TZS [MONTHLY_RENT] kwa mwezi kwa kipindi cha miezi [PAYMENT_PERIOD]. Jumla ya malipo ni TZS [TOTAL_RENT] (ikijumuisha VAT na Ada ya Huduma).",
      "footer": "Mkataba huu ni halali kisheria na umesajiliwa katika mfumo wa E-Mtaa kupitia huduma ya PANGISHA."
    },
    created_at: new Date().toISOString()
  }
];

export const INITIAL_SERVICES = HARDCODED_SERVICES;
