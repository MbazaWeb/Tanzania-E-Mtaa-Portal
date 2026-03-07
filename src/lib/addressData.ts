export interface DistrictData {
  name: string;
  wards: string[];
}

export interface RegionData {
  name: string;
  districts: DistrictData[];
}

export const TANZANIA_ADDRESS_DATA: RegionData[] = [
  {
    name: "Dar es Salaam",
    districts: [
      { name: "Ilala", wards: ["Gerezani", "Jangwani", "Kariakoo", "Kivukoni", "Mchafukoge", "Upanga Magharibi", "Upanga Mashariki"] },
      { name: "Kinondoni", wards: ["Hananasif", "Kigogo", "Kijitonyama", "Kinondoni", "Magomeni", "Makumbusho", "Mwananyamala", "Ndugumbi", "Tandale"] },
      { name: "Temeke", wards: ["Azimio", "Chamazi", "Chang'ombe", "Kurasini", "Mbagala", "Mtoni", "Temeke"] },
      { name: "Kigamboni", wards: ["Kigamboni", "Kibada", "Kisarawe II", "Kimbiji", "Somangila"] },
      { name: "Ubungo", wards: ["Goba", "Kibamba", "Kimara", "Kwembe", "Mbezi", "Saranga", "Ubungo"] }
    ]
  },
  {
    name: "Arusha",
    districts: [
      { name: "Arusha City", wards: ["Baratibar", "Daraja II", "Elerai", "Engutoto", "Kaloleni", "Kati", "Kimandolu", "Lemala", "Levosi", "Moshono", "Ngarenaro", "Olasiti", "Olorien", "Sekei", "Sombetini", "Terat", "Themi"] },
      { name: "Arusha District", wards: ["Bangata", "Bwawani", "Ilkiding'a", "Kimnyaki", "Kiranyi", "Kisongo", "Musa", "Mwandeti", "Nduruma", "Oldonyosambu", "Oljoro", "Olkokola", "Oltrumet", "Sambasha", "Tarakea"] },
      { name: "Meru", wards: ["Akheri", "Kikatiti", "King'ori", "Leguruki", "Majimoto", "Makiba", "Mbuguni", "Ngarenanyuki", "Poli", "Seela Sing'isi", "Songoro", "Usa River"] },
      { name: "Karatu", wards: ["Baray", "Buger", "Daa", "Endabash", "Endamaghay", "Karatu", "Mbulumbulu", "Oldeani", "Qurus", "Rhotia"] },
      { name: "Monduli", wards: ["Engaruka", "Engutoto", "Esilalei", "Lepurko", "Makuyuni", "Meserani", "Moita", "Monduli Juu", "Monduli Mjini", "Mto wa Mbu", "Selela"] },
      { name: "Longido", wards: ["Engarenaibor", "Engikaret", "Gelai Lumbwa", "Gelai Meirugoi", "Iloirienito", "Kamwanga", "Ketumbeine", "Kimokouwa", "Longido", "Matale", "Namanga", "Olmolog", "Orbomba"] },
      { name: "Ngorongoro", wards: ["Alailelai", "Arash", "Digodigo", "Enduleni", "Kakesio", "Malambo", "Nainokanoka", "Nayobi", "Olbalbal", "Oldonyo Sambu", "Orgosorok", "Pinyinyi", "Sale", "Samunge"] }
    ]
  },
  {
    name: "Dodoma",
    districts: [
      { name: "Dodoma City", wards: ["Chahwa", "Chamwino", "Chang'ombe", "Chidatala", "Chigongwe", "Chihoni", "Dodoma Makulu", "Hazina", "Ipala", "Iyumbu", "Kikombo", "Kikuyu Kaskazini", "Kikuyu Kusini", "Kilimani", "Kiwanja cha Ndege", "Kizota", "Madukani", "Majengo", "Makole", "Makutupora", "Mbabala", "Mbalawala", "Mkonze", "Mnadani", "Mtumba", "Nala", "Nzuguni", "Tambukareli", "Viwandani", "Zuzu"] },
      { name: "Bahi", wards: ["Bahi", "Babayu", "Chali", "Chibelela", "Chikola", "Chipanga", "Ibugule", "Ilambalo", "Kigwe", "Lamaiti", "Mpalanga", "Mwitikira", "Nondwa", "Zanka"] },
      { name: "Chamwino", wards: ["Buigiri", "Chamwino", "Chilonwa", "Chinugulu", "Dabalo", "Fufu", "Handali", "Hogoro", "Idifu", "Igandu", "Ikowa", "Iringa Mvumi", "Itiso", "Loje", "Majeleko", "Makang'wa", "Manchali", "Manda", "Membe", "Mlowa Bwawani", "Mpwayungu", "Msamalo", "Msanga", "Muungano", "Mvumi Makulu", "Mvumi Mission", "Nghambaku", "Nyaligwa", "Segala", "Zajilwa"] }
    ]
  },
  {
    name: "Mwanza",
    districts: [
      { name: "Ilemela", wards: ["Bugogwa", "Buswelu", "Ilemela", "Kirumba", "Kitangiri", "Mecco", "Nyamanoro", "Nyasaka", "Pasiansi", "Sangabuye"] },
      { name: "Nyamagana", wards: ["Butimba", "Igogo", "Isamilo", "Mahina", "Mbugani", "Mirongo", "Mkuyuni", "Nyamagana", "Pamba"] }
    ]
  },
  {
    name: "Kilimanjaro",
    districts: [
      { name: "Moshi Municipal", wards: ["Bondeni", "Kaloleni", "Kiboriloni", "Kiusa", "Korongoni", "Longuo", "Majengo", "Mawenzi", "Mfumuni", "Miembeni", "Njoro", "Pasua", "Rau", "Shirimatunda"] },
      { name: "Moshi District", wards: ["Arusha Chini", "Choro", "Kibosho Magharibi", "Kibosho Mashariki", "Kibosho Kati", "Kilema Kaskazini", "Kilema Kusini", "Kilema Kati", "Kirua Vunjo Magharibi", "Kirua Vunjo Mashariki", "Kirua Vunjo Kusini", "Mamba Kaskazini", "Mamba Kusini", "Marangu Magharibi", "Marangu Mashariki", "Mbokomu", "Mwika Kaskazini", "Mwika Kusini", "Okaoni", "Old Moshi Magharibi", "Old Moshi Mashariki", "Uru Kaskazini", "Uru Kusini", "Uru Mashariki", "Uru Shimbwe"] }
    ]
  },
  {
    name: "Mbeya",
    districts: [
      { name: "Mbeya City", wards: ["Forest", "Ghana", "Iduda", "Itezi", "Itende", "Iyela", "Iyunga", "Kalobe", "Maendeleo", "Majengo", "Mbalizi Road", "Mwakibete", "Mwanjelwa", "Nzovwe", "Ruanda", "Sinde", "Sisimba", "Tembela", "Uyole"] }
    ]
  },
  {
    name: "Tanga",
    districts: [
      { name: "Tanga City", wards: ["Central", "Chumbageni", "Duga", "Kiomoni", "Mabawa", "Mabokweni", "Magomeni", "Majengo", "Makorora", "Maweni", "Mzizima", "Ngamiani Kaskazini", "Ngamiani Kusini", "Ngamiani Kati", "Nguvumali", "Pongwe", "Tongoni", "Usagara"] }
    ]
  },
  {
    name: "Morogoro",
    districts: [
      { name: "Morogoro Municipal", wards: ["Boma", "Kihonda", "Kilakala", "Kingolwira", "Kingorywira", "Kizuka", "Luhungo", "Lukobe", "Mafiga", "Mazimbu", "Mbuyuni", "Mji Mkuu", "Mji Mpya", "Mlimani", "Mwembesongo", "Mzinga", "Sabasaba", "Sultan Area", "Uwanja wa Ndege"] }
    ]
  },
  {
    name: "Pwani",
    districts: [
      { name: "Kibaha Town", wards: ["Kibaha", "Maili Moja", "Mkuza", "Msangani", "Pangani", "Soga", "Tangini", "Tumbi", "Visiga"] }
    ]
  },
  {
    name: "Kagera",
    districts: [
      { name: "Bukoba Municipal", wards: ["Bakoba", "Bilele", "Buhembe", "Hamugembe", "Ijuganyondo", "Kagondo", "Kahororo", "Kashai", "Kibeta", "Kitendaguro", "Miembeni", "Nshambya", "Nyasina", "Rwamishenye"] }
    ]
  },
  {
    name: "Unguja Mjini Magharibi",
    districts: [
      { name: "Mjini", wards: ["Amani", "Chumbuni", "Gulioni", "Jang'ombe", "Karakana", "Kwahani", "Kwamtipura", "Magomeni", "Makadara", "Malindi", "Matalumwa", "Mchangani", "Mpendae", "Mwembeladu", "Mwembetanga", "Nyerere", "Rahaleo", "Sebleni", "Shangani", "Sogea", "Vikokotoni"] }
    ]
  },
  {
    name: "Manyara",
    districts: [
      { name: "Babati Town", wards: ["Babati", "Bagara", "Bonga", "Maisaka", "Mutuka", "Nangara", "Singe"] },
      { name: "Babati District", wards: ["Arri", "Ayasanda", "Bashay", "Dareda", "Duru", "Endakiso", "Gallapo", "Gidas", "Gorowa", "Hanang", "Magara", "Malangi", "Manu", "Mamire", "Maswa", "Nar", "Orng'adida", "Qash", "Riroda", "Singe", "Sigino"] },
      { name: "Hanang", wards: ["Balangdalalu", "Bassodawish", "Dirma", "Endagaw", "Endasak", "Ganana", "Gehandu", "Gendabi", "Giting", "Hirbadaw", "Kateshi", "Lalaji", "Masakta", "Masqaroda", "Measkron", "Mulbadaw", "Nangwa", "Sirop", "Siwana", "Wareta"] },
      { name: "Kiteto", wards: ["Bwawani", "Dosidosi", "Engusero", "Kibaya", "Loolera", "Makame", "Namelock", "Ndaleta", "Ndoroboni", "Njoro", "Olkitikiti", "Partimbo", "Sunya"] },
      { name: "Mbulu", wards: ["Bashnet", "Daudi", "Dongobesh", "Endagikot", "Endamilay", "Geterer", "Harar", "Haydom", "Hydom", "Kainam", "Maghang", "Maretadu", "Masqaroda", "Mbulu Mjini", "Murray", "Tlawi", "Tumati", "Yaeda Ampa"] },
      { name: "Simanjiro", wards: ["Emboret", "Endonyongijape", "Kiruani", "Lengijave", "Loiborsoit", "Loiborosi", "Lolibondo", "Mererani", "Naberera", "Ngorika", "Orkesumet", "Ruvu Remiti", "Shambarai", "Terrat"] }
    ]
  },
  {
    name: "Iringa",
    districts: [
      { name: "Iringa Municipal", wards: ["Gangilonga", "Ilala", "Isakalilo", "Kalenga", "Kitwiru", "Kwakilosa", "Mivinjeni", "Mkimbizi", "Mkwawa", "Mlandege", "Mtwivila", "Nduli", "Ruaha Mbuyuni"] },
      { name: "Iringa District", wards: ["Ifunda", "Ihemi", "Ilalanda", "Image", "Isimani", "Itunundu", "Izazi", "Kalenga", "Kidamali", "Kigonzile", "Kilolo", "Kiponzelo", "Lumuli", "Lugalo", "Mahuninga", "Magunga", "Malengamakali", "Mlowa", "Mseke", "Mgama", "Maboga", "Pawaga", "Tanangozi", "Udekwa", "Ulanda", "Wasa"] }
    ]
  },
  {
    name: "Njombe",
    districts: [
      { name: "Njombe Town", wards: ["Igominyi", "Ihanga", "Iwungilo", "Lupembe", "Lui", "Luponde", "Makowo", "Matola", "Njombe", "Ramadhani", "Uwemba", "Yakobi"] },
      { name: "Njombe District", wards: ["Imalinyi", "Iwungilo", "Kidegembye", "Kifanya", "Lupembe", "Magereza", "Makungu", "Ninga", "Ukalawa", "Uwemba", "Wangingombe"] }
    ]
  },
  {
    name: "Rukwa",
    districts: [
      { name: "Sumbawanga Municipal", wards: ["Chanji", "Izia", "Kaoze", "Katandala", "Majengo", "Mazwi", "Milanzi", "Mollo", "Ntendo", "Pito", "Senga"] },
      { name: "Sumbawanga District", wards: ["Kalambanzite", "Kasanga", "Katazi", "Kipeta", "Laela", "Legezamwendo", "Milepa", "Mpui", "Mtowisa", "Sandulula", "Tatanda", "Uwisi"] }
    ]
  },
  {
    name: "Ruvuma",
    districts: [
      { name: "Songea Municipal", wards: ["Bombambili", "Lizaboni", "Majengo", "Maposeni", "Mateka", "Mfaranyaki", "Misufini", "Mjimwema", "Mletele", "Ruhuwiko", "Ruvuma", "Subira", "Tunduru"] },
      { name: "Songea District", wards: ["Gumbiro", "Hanga", "Lilambo", "Liparamba", "Litisha", "Luhimba", "Madaba", "Mahande", "Matimira", "Mtyangimbole", "Muhuwesi", "Nakahuga", "Ndongosi", "Njelu", "Peramiho", "Ruhuwiko", "Tinginya", "Wino"] }
    ]
  },
  {
    name: "Singida",
    districts: [
      { name: "Singida Municipal", wards: ["Ipembe", "Kindai", "Mandewa", "Majengo", "Mitunduruni", "Mtamaa", "Mtipa", "Mughanga", "Muungano", "Mwankoko", "Puma"] },
      { name: "Singida District", wards: ["Dung'unyi", "Ghaido", "Ikungi", "Ilongero", "Issuna", "Itaja", "Kinyagigi", "Makiungu", "Mang'onyi", "Mrama", "Msange", "Mtinko", "Mudida", "Ngimu", "Ntuntu", "Puma", "Sepuka", "Unyambwa"] }
    ]
  },
  {
    name: "Tabora",
    districts: [
      { name: "Tabora Municipal", wards: ["Cheyo", "Gongoni", "Ifucha", "Ikomwa", "Ipuli", "Isevya", "Itetemya", "Kalunde", "Kakola", "Kanyenye", "Kiloleni", "Mabama", "Malolo", "Mapambano", "Mtendeni", "Ndevelwa", "Ng'ambo", "Tambukareli", "Tumbi"] },
      { name: "Tabora District", wards: ["Ibiri", "Igalula", "Isikizya", "Kalua", "Kangeme", "Kipalapala", "Loya", "Mabama", "Magiri", "Mambali", "Ndono", "Nsololo", "Sikonge", "Tumbi", "Upuge", "Usagari", "Usoke"] }
    ]
  },
  {
    name: "Shinyanga",
    districts: [
      { name: "Shinyanga Municipal", wards: ["Chamaguha", "Ibadakuli", "Kambarage", "Kitangili", "Kolandoto", "Lubaga", "Mwagala", "Mwamalasa", "Ndala", "Ngokolo", "Old Shinyanga", "Upuge"] },
      { name: "Shinyanga District", wards: ["Bushashi", "Imesela", "Itwangi", "Lyabukande", "Lyamidati", "Mwakipoya", "Nsalala", "Salawe", "Solwa", "Tinde", "Ushetu", "Usule"] }
    ]
  },
  {
    name: "Simiyu",
    districts: [
      { name: "Bariadi", wards: ["Bariadi", "Bumangi", "Dutwa", "Isanga", "Lagangabilili", "Mwanhuzi", "Nkololo", "Nyakabindi", "Nyamswa", "Nyangokolwa", "Sapiwi", "Somanda", "Sengwa"] },
      { name: "Maswa", wards: ["Buchambi", "Bugarama", "Dakama", "Ipililo", "Isanga", "Kulimi", "Lalago", "Mwabusalu", "Nyalikungu", "Senani", "Sukuma", "Tinde"] }
    ]
  },
  {
    name: "Geita",
    districts: [
      { name: "Geita Town", wards: ["Bombambili", "Bukoli", "Buhalahala", "Bujula", "Bulela", "Busolwa", "Ihanamilo", "Kalangalala", "Kharumwa", "Lwamgasa", "Mtakuja", "Nyakagomba", "Nyaruyeye"] },
      { name: "Geita District", wards: ["Bugulula", "Bukombwe", "Busanda", "Chigunga", "Ihanamilo", "Kamhanga", "Kaseme", "Katoro", "Lwamgasa", "Lubanga", "Nkome", "Nyamalimbe", "Nyanguku"] }
    ]
  },
  {
    name: "Katavi",
    districts: [
      { name: "Mpanda Town", wards: ["Ilembo", "Kakese", "Kasokola", "Kawajense", "Makanyagio", "Maromaryo", "Misunkumilo", "Mpanda Ndogo", "Mpanda", "Shanwe", "Uwanja wa Ndege"] },
      { name: "Mpanda District", wards: ["Ikola", "Kabungu", "Karema", "Kasansa", "Kasekese", "Kashishi", "Katumba", "Mamba", "Mishamo", "Nsimbo", "Sibwesa", "Sitalike", "Ugalla"] }
    ]
  },
  {
    name: "Kigoma",
    districts: [
      { name: "Kigoma Ujiji Municipal", wards: ["Bangwe", "Buhanda", "Businde", "Gungu", "Kagera", "Kasingwa", "Katubuka", "Kibirizi", "Kigoma", "Kitongoni", "Majengo", "Mwanga Kaskazini", "Mwanga Kusini", "Rusimbi", "Ujiji"] },
      { name: "Kigoma District", wards: ["Bitale", "Bubango", "Kandaga", "Kagunga", "Kalinzi", "Kazuramimba", "Kibwesa", "Matyazo", "Mkongoro", "Mpotela", "Mgaraganza", "Nkungwe", "Simbo", "Sunuka"] }
    ]
  },
  {
    name: "Lindi",
    districts: [
      { name: "Lindi Municipal", wards: ["Chikonji", "Jamhuri", "Makonde", "Matopeni", "Mbanja", "Mikumbi", "Mingoyo", "Mitandi", "Msinjahili", "Ndoro", "Ng'apa", "Rasbura", "Rahaleo", "Tandangongoro", "Wailes"] },
      { name: "Lindi District", wards: ["Chikonji", "Kilangala", "Kilimani", "Kiwalala", "Madangwa", "Mchinga", "Mnazi Mmoja", "Mtama", "Nachunyu", "Pangatena", "Rutamba", "Sudi"] }
    ]
  },
  {
    name: "Mtwara",
    districts: [
      { name: "Mtwara Mikindani Municipal", wards: ["Chikongola", "Chuno", "Dinde", "Jangwani", "Likombe", "Magomeni", "Majengo", "Mashindiko", "Mikindani", "Mitengo", "Mnazi Mmoja", "Mtawanya", "Naliendele", "Rahaleo", "Shangani"] },
      { name: "Mtwara District", wards: ["Dihimba", "Kitere", "Libobe", "Likwaya", "Lipwidi", "Madimba", "Malamba", "Mandawa", "Mayanga", "Mbuo", "Mikindani", "Mkunya", "Mnima", "Msanga Mkuu", "Mwenge", "Nanyamba", "Ziwani"] }
    ]
  },
  {
    name: "Unguja Kaskazini",
    districts: [
      { name: "Kaskazini A", wards: ["Chaani", "Gamba", "Kendwa", "Kijini", "Kivunge", "Matemwe", "Mkokotoni", "Nungwi", "Potoa", "Tumbatu"] },
      { name: "Kaskazini B", wards: ["Bumbwini", "Donge", "Fukuchani", "Kinyasini", "Mahonda", "Mangapwani", "Mkwajuni", "Muwanda"] }
    ]
  },
  {
    name: "Unguja Kusini",
    districts: [
      { name: "Kusini", wards: ["Bwejuu", "Chwaka", "Jambiani", "Kizimkazi Dimbani", "Kizimkazi Mkunguni", "Makunduchi", "Mtende", "Muyuni", "Nganani", "Paje", "Pete", "Tunguu"] }
    ]
  },
  {
    name: "Pemba Kaskazini",
    districts: [
      { name: "Wete", wards: ["Chwale", "Fundo", "Gando", "Kambini", "Kiuyu", "Kojani", "mgogoni", "Mtambile", "Mzambarauani", "Ole", "Pandani", "Pujini", "Selemu", "Shumba Mjini", "Wete"] },
      { name: "Micheweni", wards: ["Chamboni", "Konde", "Makangale", "Maziwa ng'ombe", "Micheweni", "Msuka", "Shumba Viamboni", "Tumbe", "Wingwi"] }
    ]
  },
  {
    name: "Pemba Kusini",
    districts: [
      { name: "Chake Chake", wards: ["Chake Chake", "Chanjaani", "Chokocho", "Kibokoni", "Kichungwani", "Machomanne", "Mbuzini", "Mchanga Mdogo", "Mgelema", "Mkoani", "Mtambani", "Ng'ambwa", "Ole", "Piki", "Uwandani", "Vitongoji", "Wesha"] },
      { name: "Mkoani", wards: ["Changaweni", "Chokocho", "Kanga", "Kengeja", "Kiwani", "Kukuu", "Makombeni", "Mapofu", "Mbuyuni", "Michenzani", "Mkoani", "Mtambwe", "Ndagoni", "Ng'ambwa", "Wambaa", "Wingwi Njuguni"] }
    ]
  }
];

