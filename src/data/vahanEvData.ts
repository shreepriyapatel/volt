export interface VahanDistrictData {
  id: string;
  districtName: string;
  stateName: string;
  stateCode: string;
  rtoCodes: string[];
  totalEvCount: number;
  evPenetrationPct: number;
  yoyGrowthPct: number;
  categoryBreakdown: {
    twoWheelerE2W: number;
    threeWheelerE3W: number;
    fourWheelerE4W: number;
    commercialBus: number;
    otherCommercial: number;
  };
  historicalTrend: {
    year2022: number;
    year2023: number;
    year2024: number;
    year2025: number;
    year2026YTD: number;
  };
  activePublicChargers: number;
  evToChargerRatio: number; // e.g., 75:1
  chargingDeficitScore: number; // 0 to 100 (higher means larger unmet charging demand)
  densityPerSqKm: number;
  estDailyKwhDemand: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  keyVehicleMakersTop3: string[];
  topFleetCorridors: string[];
}

export interface VahanStateSummary {
  stateName: string;
  stateCode: string;
  totalEvs: number;
  twoWheelerPct: number;
  threeWheelerPct: number;
  fourWheelerPct: number;
  busPct: number;
  commercialPct: number;
  yoyGrowthPct: number;
  totalPublicChargers: number;
  avgEvToChargerRatio: number;
  topDistricts: string[];
}

export const VAHAN_NATIONAL_SUMMARY = {
  dataSource: 'Ministry of Road Transport and Highways (MoRTH) - Vahan 4.0 Dashboard (vahan.parivahan.gov.in)',
  lastSyncTimestamp: 'August 2026 Live Sync',
  totalNationalEvCount: 4820540,
  yoyNationalGrowthRatePct: 48.2,
  nationalEvPenetrationPct: 7.8,
  totalInstalledPublicChargers: 28450,
  nationalEvToChargerRatio: 169.4,
  categoryShare: {
    twoWheelerE2W: 55.4, // 55.4%
    threeWheelerE3W: 34.2, // 34.2%
    fourWheelerE4W: 8.6,  // 8.6%
    commercialBus: 0.6,   // 0.6%
    otherCommercial: 1.2, // 1.2%
  }
};

export const VAHAN_STATE_SUMMARIES: VahanStateSummary[] = [
  {
    stateName: 'Maharashtra',
    stateCode: 'MH',
    totalEvs: 642300,
    twoWheelerPct: 68.4,
    threeWheelerPct: 15.2,
    fourWheelerPct: 14.8,
    busPct: 0.8,
    commercialPct: 0.8,
    yoyGrowthPct: 52.6,
    totalPublicChargers: 4120,
    avgEvToChargerRatio: 155.8,
    topDistricts: ['Pune', 'Mumbai Suburban', 'Thane', 'Nagpur', 'Nashik', 'Pimpri-Chinchwad'],
  },
  {
    stateName: 'Karnataka',
    stateCode: 'KA',
    totalEvs: 498200,
    twoWheelerPct: 74.2,
    threeWheelerPct: 11.5,
    fourWheelerPct: 13.1,
    busPct: 0.6,
    commercialPct: 0.6,
    yoyGrowthPct: 56.4,
    totalPublicChargers: 3680,
    avgEvToChargerRatio: 135.3,
    topDistricts: ['Bengaluru Urban', 'Mysuru', 'Dakshina Kannada', 'Dharwad', 'Belagavi'],
  },
  {
    stateName: 'Delhi NCR',
    stateCode: 'DL',
    totalEvs: 382400,
    twoWheelerPct: 42.1,
    threeWheelerPct: 41.5,
    fourWheelerPct: 15.1,
    busPct: 1.1,
    commercialPct: 0.2,
    yoyGrowthPct: 44.8,
    totalPublicChargers: 3240,
    avgEvToChargerRatio: 118.0,
    topDistricts: ['South Delhi', 'Central Delhi', 'West Delhi', 'North Delhi', 'New Delhi'],
  },
  {
    stateName: 'Tamil Nadu',
    stateCode: 'TN',
    totalEvs: 415600,
    twoWheelerPct: 76.5,
    threeWheelerPct: 12.8,
    fourWheelerPct: 9.8,
    busPct: 0.4,
    commercialPct: 0.5,
    yoyGrowthPct: 49.3,
    totalPublicChargers: 2890,
    avgEvToChargerRatio: 143.8,
    topDistricts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur'],
  },
  {
    stateName: 'Uttar Pradesh',
    stateCode: 'UP',
    totalEvs: 785900,
    twoWheelerPct: 32.4,
    threeWheelerPct: 62.1,
    fourWheelerPct: 4.8,
    busPct: 0.3,
    commercialPct: 0.4,
    yoyGrowthPct: 41.2,
    totalPublicChargers: 1980,
    avgEvToChargerRatio: 396.9,
    topDistricts: ['Gautam Buddha Nagar (Noida)', 'Lucknow', 'Kanpur Nagar', 'Ghaziabad', 'Agra', 'Varanasi'],
  },
  {
    stateName: 'Gujarat',
    stateCode: 'GJ',
    totalEvs: 392100,
    twoWheelerPct: 72.8,
    threeWheelerPct: 14.1,
    fourWheelerPct: 12.1,
    busPct: 0.5,
    commercialPct: 0.5,
    yoyGrowthPct: 58.7,
    totalPublicChargers: 2450,
    avgEvToChargerRatio: 160.0,
    topDistricts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  },
  {
    stateName: 'Telangana',
    stateCode: 'TS',
    totalEvs: 268400,
    twoWheelerPct: 69.2,
    threeWheelerPct: 16.4,
    fourWheelerPct: 13.5,
    busPct: 0.5,
    commercialPct: 0.4,
    yoyGrowthPct: 61.2,
    totalPublicChargers: 1840,
    avgEvToChargerRatio: 145.8,
    topDistricts: ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Karimnagar'],
  },
  {
    stateName: 'Kerala',
    stateCode: 'KL',
    totalEvs: 246500,
    twoWheelerPct: 71.4,
    threeWheelerPct: 14.2,
    fourWheelerPct: 13.9,
    busPct: 0.3,
    commercialPct: 0.2,
    yoyGrowthPct: 54.1,
    totalPublicChargers: 1620,
    avgEvToChargerRatio: 152.1,
    topDistricts: ['Ernakulam (Kochi)', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam'],
  },
  {
    stateName: 'Rajasthan',
    stateCode: 'RJ',
    totalEvs: 298000,
    twoWheelerPct: 58.2,
    threeWheelerPct: 34.6,
    fourWheelerPct: 6.7,
    busPct: 0.2,
    commercialPct: 0.3,
    yoyGrowthPct: 46.5,
    totalPublicChargers: 1420,
    avgEvToChargerRatio: 209.8,
    topDistricts: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Alwar'],
  },
  {
    stateName: 'Haryana',
    stateCode: 'HR',
    totalEvs: 215400,
    twoWheelerPct: 54.8,
    threeWheelerPct: 32.4,
    fourWheelerPct: 11.9,
    busPct: 0.4,
    commercialPct: 0.5,
    yoyGrowthPct: 51.8,
    totalPublicChargers: 1580,
    avgEvToChargerRatio: 136.3,
    topDistricts: ['Gurugram', 'Faridabad', 'Panipat', 'Karnal', 'Sonipat'],
  }
];

export const VAHAN_DISTRICTS_DATA: VahanDistrictData[] = [
  {
    id: 'MH-PUN',
    districtName: 'Pune',
    stateName: 'Maharashtra',
    stateCode: 'MH',
    rtoCodes: ['MH-12', 'MH-14 (Pimpri)'],
    totalEvCount: 168420,
    evPenetrationPct: 11.4,
    yoyGrowthPct: 64.2,
    categoryBreakdown: {
      twoWheelerE2W: 119570,
      threeWheelerE3W: 18520,
      fourWheelerE4W: 28430,
      commercialBus: 1240,
      otherCommercial: 660,
    },
    historicalTrend: {
      year2022: 24500,
      year2023: 54800,
      year2024: 104200,
      year2025: 148900,
      year2026YTD: 168420,
    },
    activePublicChargers: 1120,
    evToChargerRatio: 150.3,
    chargingDeficitScore: 92,
    densityPerSqKm: 10.8,
    estDailyKwhDemand: 524000,
    coordinates: { lat: 18.5204, lng: 73.8567 },
    keyVehicleMakersTop3: ['Tata Motors (Nexon/Punch EV)', 'Ola Electric (S1 Pro)', 'Ather Energy (450X)'],
    topFleetCorridors: ['Pune-Mumbai Expressway', 'Hinjawadi IT Corridor', 'Kharadi-Viman Nagar Tech Zone', 'Bhosari MIDC Hub'],
  },
  {
    id: 'KA-BLR',
    districtName: 'Bengaluru Urban',
    stateName: 'Karnataka',
    stateCode: 'KA',
    rtoCodes: ['KA-01 (Koramangala)', 'KA-03 (Indiranagar)', 'KA-04 (Yeshwanthpur)', 'KA-05 (Jayanagar)', 'KA-51 (Electronic City)', 'KA-53 (K.R. Puram)'],
    totalEvCount: 248900,
    evPenetrationPct: 14.8,
    yoyGrowthPct: 71.5,
    categoryBreakdown: {
      twoWheelerE2W: 182400,
      threeWheelerE3W: 19800,
      fourWheelerE4W: 44200,
      commercialBus: 1820,
      otherCommercial: 680,
    },
    historicalTrend: {
      year2022: 38200,
      year2023: 84600,
      year2024: 158900,
      year2025: 221000,
      year2026YTD: 248900,
    },
    activePublicChargers: 2150,
    evToChargerRatio: 115.7,
    chargingDeficitScore: 94,
    densityPerSqKm: 113.6,
    estDailyKwhDemand: 792000,
    coordinates: { lat: 12.9716, lng: 77.5946 },
    keyVehicleMakersTop3: ['Ather Energy (Ather 450X/Apex)', 'Tata Motors (Nexon/Tiago EV)', 'Ola Electric'],
    topFleetCorridors: ['Outer Ring Road (ORR Tech Belt)', 'Electronic City Elevated Expressway', 'Kempegowda Airport Corridor (NH-44)', 'Whitefield Metro Strip'],
  },
  {
    id: 'MH-MUM-SUB',
    districtName: 'Mumbai Suburban',
    stateName: 'Maharashtra',
    stateCode: 'MH',
    rtoCodes: ['MH-02 (Andheri)', 'MH-03 (Wadala)', 'MH-47 (Borivali)'],
    totalEvCount: 142800,
    evPenetrationPct: 10.9,
    yoyGrowthPct: 58.4,
    categoryBreakdown: {
      twoWheelerE2W: 88500,
      threeWheelerE3W: 21400,
      fourWheelerE4W: 31200,
      commercialBus: 1180,
      otherCommercial: 520,
    },
    historicalTrend: {
      year2022: 21800,
      year2023: 49200,
      year2024: 89400,
      year2025: 127600,
      year2026YTD: 142800,
    },
    activePublicChargers: 1340,
    evToChargerRatio: 106.5,
    chargingDeficitScore: 89,
    densityPerSqKm: 320.1,
    estDailyKwhDemand: 468000,
    coordinates: { lat: 19.1136, lng: 72.8697 },
    keyVehicleMakersTop3: ['Tata Motors EV', 'MG Motor (ZS EV/Comet)', 'Bajaj Chetak EV'],
    topFleetCorridors: ['Western Express Highway (WEH)', 'BKC Commercial Hub', 'Eastern Freeway Corridor', 'Chhatrapati Shivaji Maharaj Airport Link'],
  },
  {
    id: 'DL-DELHI-NCR',
    districtName: 'Delhi Central & South',
    stateName: 'Delhi NCR',
    stateCode: 'DL',
    rtoCodes: ['DL-01 (Mall Road)', 'DL-03 (Sheikh Sarai)', 'DL-04 (Janakpuri)', 'DL-06 (Sarai Kale Khan)', 'DL-09 (Palam)'],
    totalEvCount: 284100,
    evPenetrationPct: 16.2,
    yoyGrowthPct: 49.8,
    categoryBreakdown: {
      twoWheelerE2W: 119800,
      threeWheelerE3W: 118400,
      fourWheelerE4W: 42600,
      commercialBus: 2650,
      otherCommercial: 650,
    },
    historicalTrend: {
      year2022: 48900,
      year2023: 108400,
      year2024: 186500,
      year2025: 254200,
      year2026YTD: 284100,
    },
    activePublicChargers: 2680,
    evToChargerRatio: 106.0,
    chargingDeficitScore: 91,
    densityPerSqKm: 191.5,
    estDailyKwhDemand: 840000,
    coordinates: { lat: 28.6139, lng: 77.209 },
    keyVehicleMakersTop3: ['Tata Motors (Nexon/Punch EV)', 'Yakuza / Saarthi E-3W', 'Ola Electric'],
    topFleetCorridors: ['Ring Road - AIIMS & Nehru Place', 'IGI Airport Terminal 3 Expressway', 'Connaught Place Ring', 'DND Flyway'],
  },
  {
    id: 'TS-HYD',
    districtName: 'Hyderabad',
    stateName: 'Telangana',
    stateCode: 'TS',
    rtoCodes: ['TS-09 (Khairatabad)', 'TS-10 (Secunderabad)', 'TS-11 (Malakpet)', 'TS-12 (Bahadurpura)', 'TS-13 (Tolichowki)'],
    totalEvCount: 154300,
    evPenetrationPct: 12.1,
    yoyGrowthPct: 68.9,
    categoryBreakdown: {
      twoWheelerE2W: 108200,
      threeWheelerE3W: 22600,
      fourWheelerE4W: 22100,
      commercialBus: 980,
      otherCommercial: 420,
    },
    historicalTrend: {
      year2022: 19400,
      year2023: 45800,
      year2024: 92400,
      year2025: 136200,
      year2026YTD: 154300,
    },
    activePublicChargers: 1180,
    evToChargerRatio: 130.7,
    chargingDeficitScore: 88,
    densityPerSqKm: 237.3,
    estDailyKwhDemand: 440000,
    coordinates: { lat: 17.385, lng: 78.4867 },
    keyVehicleMakersTop3: ['Ola Electric', 'Tata Motors EV', 'TVS Motor (iQube)'],
    topFleetCorridors: ['HITEC City Cyberabad Expressway', 'Nehru Outer Ring Road (ORR Gachibowli)', 'Financial District Loop', 'Rajiv Gandhi Int. Airport Corridor'],
  },
  {
    id: 'GJ-AHM',
    districtName: 'Ahmedabad',
    stateName: 'Gujarat',
    stateCode: 'GJ',
    rtoCodes: ['GJ-01 (Subhash Bridge)', 'GJ-27 (Vastral)'],
    totalEvCount: 138600,
    evPenetrationPct: 11.2,
    yoyGrowthPct: 62.4,
    categoryBreakdown: {
      twoWheelerE2W: 104500,
      threeWheelerE3W: 16800,
      fourWheelerE4W: 16100,
      commercialBus: 760,
      otherCommercial: 440,
    },
    historicalTrend: {
      year2022: 18200,
      year2023: 42600,
      year2024: 83500,
      year2025: 122400,
      year2026YTD: 138600,
    },
    activePublicChargers: 980,
    evToChargerRatio: 141.4,
    chargingDeficitScore: 87,
    densityPerSqKm: 29.8,
    estDailyKwhDemand: 395000,
    coordinates: { lat: 23.0225, lng: 72.5714 },
    keyVehicleMakersTop3: ['Ola Electric', 'Tata Motors EV', 'Hero Electric / Ather'],
    topFleetCorridors: ['SG Highway (Sarkhej-Gandhinagar)', 'SP Ring Road (Sardar Patel)', 'Sabarmati Riverfront Arterial', 'Sanand Industrial Cluster Link'],
  },
  {
    id: 'GJ-SURAT',
    districtName: 'Surat',
    stateName: 'Gujarat',
    stateCode: 'GJ',
    rtoCodes: ['GJ-05 (Surat)', 'GJ-28 (Pal)'],
    totalEvCount: 114200,
    evPenetrationPct: 12.8,
    yoyGrowthPct: 66.8,
    categoryBreakdown: {
      twoWheelerE2W: 86400,
      threeWheelerE3W: 14200,
      fourWheelerE4W: 12800,
      commercialBus: 480,
      otherCommercial: 320,
    },
    historicalTrend: {
      year2022: 14200,
      year2023: 33900,
      year2024: 68400,
      year2025: 101200,
      year2026YTD: 114200,
    },
    activePublicChargers: 640,
    evToChargerRatio: 178.4,
    chargingDeficitScore: 93,
    densityPerSqKm: 24.2,
    estDailyKwhDemand: 320000,
    coordinates: { lat: 21.1702, lng: 72.8311 },
    keyVehicleMakersTop3: ['Ola Electric', 'TVS iQube', 'Tata Motors EV'],
    topFleetCorridors: ['Surat-Dumas Airport Road', 'Ring Road Textile Gateway', 'Hazira Industrial Belt', 'Varachha Diamond Corridor'],
  },
  {
    id: 'TN-CHE',
    districtName: 'Chennai',
    stateName: 'Tamil Nadu',
    stateCode: 'TN',
    rtoCodes: ['TN-01 (Chennai Central)', 'TN-02 (Chennai NW)', 'TN-07 (Thiruvanmiyur)', 'TN-09 (T. Nagar)', 'TN-10 (Virugambakkam)', 'TN-22 (Meenambakkam)'],
    totalEvCount: 149800,
    evPenetrationPct: 10.6,
    yoyGrowthPct: 53.8,
    categoryBreakdown: {
      twoWheelerE2W: 116200,
      threeWheelerE3W: 16900,
      fourWheelerE4W: 15800,
      commercialBus: 620,
      otherCommercial: 280,
    },
    historicalTrend: {
      year2022: 21500,
      year2023: 49400,
      year2024: 92800,
      year2025: 133400,
      year2026YTD: 149800,
    },
    activePublicChargers: 1080,
    evToChargerRatio: 138.7,
    chargingDeficitScore: 86,
    densityPerSqKm: 85.3,
    estDailyKwhDemand: 410000,
    coordinates: { lat: 13.0827, lng: 80.2707 },
    keyVehicleMakersTop3: ['TVS Motor (iQube)', 'Ather Energy', 'Tata Motors EV'],
    topFleetCorridors: ['Old Mahabalipuram Road (OMR IT Expressway)', 'Grand Southern Trunk Road (GST / Airport)', 'Mount-Poonamallee High Road', 'East Coast Road (ECR)'],
  },
  {
    id: 'UP-NOIDA-GBN',
    districtName: 'Gautam Buddha Nagar (Noida / Greater Noida)',
    stateName: 'Uttar Pradesh',
    stateCode: 'UP',
    rtoCodes: ['UP-16 (Noida)'],
    totalEvCount: 96800,
    evPenetrationPct: 14.1,
    yoyGrowthPct: 59.4,
    categoryBreakdown: {
      twoWheelerE2W: 46200,
      threeWheelerE3W: 34100,
      fourWheelerE4W: 15800,
      commercialBus: 480,
      otherCommercial: 220,
    },
    historicalTrend: {
      year2022: 12800,
      year2023: 31200,
      year2024: 59400,
      year2025: 86400,
      year2026YTD: 96800,
    },
    activePublicChargers: 720,
    evToChargerRatio: 134.4,
    chargingDeficitScore: 89,
    densityPerSqKm: 69.1,
    estDailyKwhDemand: 310000,
    coordinates: { lat: 28.5355, lng: 77.391 },
    keyVehicleMakersTop3: ['Tata Motors EV', 'Saarthi E-Rickshaws', 'Ola Electric'],
    topFleetCorridors: ['Noida-Greater Noida Expressway', 'Yamuna Expressway (Jewar Airport Gateway)', 'Sector 62-63 Tech Zone', 'Pari Chowk Hub'],
  },
  {
    id: 'HR-GGN',
    districtName: 'Gurugram',
    stateName: 'Haryana',
    stateCode: 'HR',
    rtoCodes: ['HR-26 (North Gurugram)', 'HR-72 (South Gurugram)'],
    totalEvCount: 88400,
    evPenetrationPct: 15.6,
    yoyGrowthPct: 62.1,
    categoryBreakdown: {
      twoWheelerE2W: 49500,
      threeWheelerE3W: 18200,
      fourWheelerE4W: 20100,
      commercialBus: 420,
      otherCommercial: 180,
    },
    historicalTrend: {
      year2022: 11600,
      year2023: 28400,
      year2024: 54900,
      year2025: 78900,
      year2026YTD: 88400,
    },
    activePublicChargers: 860,
    evToChargerRatio: 102.8,
    chargingDeficitScore: 85,
    densityPerSqKm: 70.3,
    estDailyKwhDemand: 320000,
    coordinates: { lat: 28.4595, lng: 77.0266 },
    keyVehicleMakersTop3: ['Tata Motors (Nexon/Curvv EV)', 'MG Motor (ZS EV)', 'Ola Electric / Ather'],
    topFleetCorridors: ['Golf Course Road & Extension', 'Delhi-Gurgaon Expressway (NH-48 / CyberHub)', 'Sohna Elevated Highway', 'Manesar IMT Industrial Belt'],
  },
  {
    id: 'KL-EKM',
    districtName: 'Ernakulam (Kochi)',
    stateName: 'Kerala',
    stateCode: 'KL',
    rtoCodes: ['KL-07 (Ernakulam)', 'KL-39 (Thripunithura)', 'KL-40 (Perumbavoor)', 'KL-42 (North Paravur)'],
    totalEvCount: 68900,
    evPenetrationPct: 13.4,
    yoyGrowthPct: 57.2,
    categoryBreakdown: {
      twoWheelerE2W: 48900,
      threeWheelerE3W: 9400,
      fourWheelerE4W: 10200,
      commercialBus: 260,
      otherCommercial: 140,
    },
    historicalTrend: {
      year2022: 9500,
      year2023: 22800,
      year2024: 43200,
      year2025: 61800,
      year2026YTD: 68900,
    },
    activePublicChargers: 510,
    evToChargerRatio: 135.1,
    chargingDeficitScore: 87,
    densityPerSqKm: 22.5,
    estDailyKwhDemand: 215000,
    coordinates: { lat: 9.9816, lng: 76.2999 },
    keyVehicleMakersTop3: ['Tata Motors EV', 'Ather Energy', 'MG Motor EV'],
    topFleetCorridors: ['Kochi Airport-Seaport Highway', 'Edappally-Vyttila Bypass (NH-66)', 'MG Road Central Hub', 'Kakkanad Infopark Tech Belt'],
  },
  {
    id: 'RJ-JAI',
    districtName: 'Jaipur',
    stateName: 'Rajasthan',
    stateCode: 'RJ',
    rtoCodes: ['RJ-14 (Jaipur South)', 'RJ-45 (Jaipur North)'],
    totalEvCount: 94200,
    evPenetrationPct: 9.8,
    yoyGrowthPct: 51.4,
    categoryBreakdown: {
      twoWheelerE2W: 56400,
      threeWheelerE3W: 30800,
      fourWheelerE4W: 6600,
      commercialBus: 240,
      otherCommercial: 160,
    },
    historicalTrend: {
      year2022: 13200,
      year2023: 31500,
      year2024: 61200,
      year2025: 84600,
      year2026YTD: 94200,
    },
    activePublicChargers: 480,
    evToChargerRatio: 196.3,
    chargingDeficitScore: 95,
    densityPerSqKm: 8.5,
    estDailyKwhDemand: 240000,
    coordinates: { lat: 26.9124, lng: 75.7873 },
    keyVehicleMakersTop3: ['Saarthi / Atul E-3W', 'Ola Electric', 'Tata Motors EV'],
    topFleetCorridors: ['Tonk Road & Sitapura Industrial Hub', 'Ajmer Road Highway Bypass', 'JLN Marg - Airport Expressway', 'MI Road Central Commercial'],
  },
  {
    id: 'UP-LKO',
    districtName: 'Lucknow',
    stateName: 'Uttar Pradesh',
    stateCode: 'UP',
    rtoCodes: ['UP-32 (Lucknow)'],
    totalEvCount: 118400,
    evPenetrationPct: 10.4,
    yoyGrowthPct: 45.8,
    categoryBreakdown: {
      twoWheelerE2W: 42100,
      threeWheelerE3W: 68400,
      fourWheelerE4W: 7400,
      commercialBus: 320,
      otherCommercial: 180,
    },
    historicalTrend: {
      year2022: 18400,
      year2023: 42100,
      year2024: 78500,
      year2025: 106200,
      year2026YTD: 118400,
    },
    activePublicChargers: 390,
    evToChargerRatio: 303.6,
    chargingDeficitScore: 98,
    densityPerSqKm: 46.9,
    estDailyKwhDemand: 285000,
    coordinates: { lat: 26.8467, lng: 80.9462 },
    keyVehicleMakersTop3: ['Yakuza / City Life E-Rickshaws', 'Tata Motors EV', 'Ola Electric'],
    topFleetCorridors: ['Shaheed Path Ring Expressway', 'Hazratganj Central Corridor', 'Amausi Airport Highway', 'Vibhuti Khand Gomti Nagar Tech Hub'],
  },
  {
    id: 'WB-KOL',
    districtName: 'Kolkata',
    stateName: 'West Bengal',
    stateCode: 'WB',
    rtoCodes: ['WB-01 (Beltala)', 'WB-02 (PBT)', 'WB-04 (Alipore)', 'WB-06 (Cossipore)', 'WB-08 (Salt Lake)'],
    totalEvCount: 84600,
    evPenetrationPct: 8.2,
    yoyGrowthPct: 42.1,
    categoryBreakdown: {
      twoWheelerE2W: 38200,
      threeWheelerE3W: 37400,
      fourWheelerE4W: 8200,
      commercialBus: 640,
      otherCommercial: 160,
    },
    historicalTrend: {
      year2022: 12500,
      year2023: 28900,
      year2024: 54800,
      year2025: 75900,
      year2026YTD: 84600,
    },
    activePublicChargers: 460,
    evToChargerRatio: 183.9,
    chargingDeficitScore: 93,
    densityPerSqKm: 412.7,
    estDailyKwhDemand: 230000,
    coordinates: { lat: 22.5726, lng: 88.3639 },
    keyVehicleMakersTop3: ['Saarthi / Thukral E-3W', 'Tata Motors EV', 'Ola Electric'],
    topFleetCorridors: ['EM Bypass (Eastern Metropolitan)', 'Rajarhat / New Town IT Hub Expressway', 'Kona Expressway', 'VIP Road Airport Corridor'],
  },
  {
    id: 'TN-CBE',
    districtName: 'Coimbatore',
    stateName: 'Tamil Nadu',
    stateCode: 'TN',
    rtoCodes: ['TN-37 (Coimbatore South)', 'TN-38 (Coimbatore North)', 'TN-66 (Coimbatore Central)', 'TN-99 (Coimbatore West)'],
    totalEvCount: 79400,
    evPenetrationPct: 13.9,
    yoyGrowthPct: 59.8,
    categoryBreakdown: {
      twoWheelerE2W: 64200,
      threeWheelerE3W: 7800,
      fourWheelerE4W: 7100,
      commercialBus: 180,
      otherCommercial: 120,
    },
    historicalTrend: {
      year2022: 11200,
      year2023: 26400,
      year2024: 50800,
      year2025: 71200,
      year2026YTD: 79400,
    },
    activePublicChargers: 420,
    evToChargerRatio: 189.0,
    chargingDeficitScore: 94,
    densityPerSqKm: 16.8,
    estDailyKwhDemand: 220000,
    coordinates: { lat: 11.0168, lng: 76.9558 },
    keyVehicleMakersTop3: ['Ather Energy', 'TVS iQube', 'Tata Motors EV'],
    topFleetCorridors: ['Avinashi Road IT & Airport Strip', 'Trichy Road Expressway', 'Pollachi Road Industrial Corridor', 'Saravanampatti Tech Zone'],
  }
];

// Helper search function across state, district, or RTO code
export const searchVahanDistricts = (query: string): VahanDistrictData[] => {
  if (!query || !query.trim()) return VAHAN_DISTRICTS_DATA;
  const q = query.toLowerCase().trim();
  return VAHAN_DISTRICTS_DATA.filter((d) => {
    return (
      d.districtName.toLowerCase().includes(q) ||
      d.stateName.toLowerCase().includes(q) ||
      d.stateCode.toLowerCase().includes(q) ||
      d.rtoCodes.some((code) => code.toLowerCase().includes(q)) ||
      d.topFleetCorridors.some((c) => c.toLowerCase().includes(q))
    );
  });
};

// Calculate Vahan Feasibility Demand Score based on EV registrations, 4W count, YoY acceleration and charger deficit
export const calculateVahanDemandScore = (district: VahanDistrictData, targetChargerCount: number = 4): {
  demandScore: number;
  unmetDemandRatio: number;
  estDailySessionsPerPort: number;
  projectedAnnualKwhDispensed: number;
  vahanExecutiveInsight: string;
} => {
  // Acute deficit multiplier: if EV to charger ratio > 150:1 -> high score
  const deficitScore = Math.min(100, Math.round((district.evToChargerRatio / 150) * 80 + (district.yoyGrowthPct / 60) * 20));
  
  // Daily session demand projection: 4W fleet + 2W fast charge + E-3Ws
  const fourWheelerDailyShare = (district.categoryBreakdown.fourWheelerE4W * 0.12); // 12% need public DC charge daily
  const commercialShare = (district.categoryBreakdown.threeWheelerE3W * 0.25); // 25% E-3W need fast swap/top-up
  const totalLocalDailySessions = (fourWheelerDailyShare + commercialShare);
  
  const estimatedSessionsPerPort = Math.min(14, Math.max(5, Math.round(totalLocalDailySessions / Math.max(1, district.activePublicChargers * 0.4))));
  const projectedAnnualKwh = Math.round(targetChargerCount * estimatedSessionsPerPort * 32 * 365); // ~32kWh avg session

  const vahanExecutiveInsight = `District ${district.districtName} (${district.stateCode}) registers ${district.totalEvCount.toLocaleString()} EVs on the Vahan 4.0 registry (${district.yoyGrowthPct}% YoY growth). With an EV-to-charger ratio of ${district.evToChargerRatio}:1, the area has a severe charging infrastructure deficit index of ${district.chargingDeficitScore}/100. Introducing ${targetChargerCount} ultra-fast ports will capture an estimated ${estimatedSessionsPerPort} sessions/port/day.`;

  return {
    demandScore: deficitScore,
    unmetDemandRatio: district.evToChargerRatio,
    estDailySessionsPerPort: estimatedSessionsPerPort,
    projectedAnnualKwhDispensed: projectedAnnualKwh,
    vahanExecutiveInsight,
  };
};
