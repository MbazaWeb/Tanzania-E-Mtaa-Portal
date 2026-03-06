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
  }
];

