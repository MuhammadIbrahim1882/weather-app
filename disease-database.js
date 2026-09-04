/**
 * CropDoctor AI - Plant Disease Knowledge Base & Color Signatures
 */

const DISEASE_DATABASE = [
  {
    id: "tomato_late_blight",
    crop: "Tomato",
    name: "Late Blight",
    nameUrdu: "ٹماٹر کا دیرینہ جھلساؤ (لیٹ بلائٹ)",
    scientificName: "Phytophthora infestans",
    pathogenType: "Fungal", // Oomycete
    severity: "Critical",
    hsvSignature: {
      chlorosisMin: 0.10, // Yellowing halo
      necrosisMin: 0.18,  // Dark brown/black spots
      greenRange: [0.18, 0.45],
      darkSpotRatioMin: 0.12
    },
    symptoms: [
      "Large, irregular dark brown to black water-soaked lesions on leaves",
      "Yellow chlorotic halos surrounding brown leaf spots",
      "White fungal mold growth on the undersides of leaves during humid conditions",
      "Rapid wilting and collapse of foliage within days"
    ],
    causes: "Cool, wet, humid weather (temperatures between 15°C - 22°C and humidity > 80%). Wind-borne sporangia spread rapidly across fields.",
    organicControl: [
      "Spray Copper Hydroxide or Liquid Copper Octanoate every 7 days.",
      "Apply Neem oil (5ml/Liter water) + Potassium Bicarbonate spray to suppress spore germinability.",
      "Prune lower infected leaves immediately and destroy infected plant debris away from the field."
    ],
    chemicalControl: [
      "Mancozeb 75% WP @ 2.5g per Liter of water as preventive spray.",
      "Metalaxyl + Mancozeb (Ridomil Gold) @ 2g per Liter for curative systemic action.",
      "Cymoxanil + Mancozeb @ 2g/L during high disease pressure outbreaks."
    ],
    prevention: [
      "Use certified disease-resistant tomato hybrids (e.g. Mountain Magic, Defiant).",
      "Ensure proper plant spacing (min 45-60cm) to maximize airflow.",
      "Avoid overhead sprinkler irrigation; use drip irrigation to keep foliage dry."
    ],
    climateRiskFactor: {
      tempRange: [12, 24],
      humidityMin: 75
    }
  },
  {
    id: "tomato_early_blight",
    crop: "Tomato",
    name: "Early Blight",
    nameUrdu: "ٹماٹر کا ابتدائی جھلساؤ (ارلی بلائٹ)",
    scientificName: "Alternaria solani",
    pathogenType: "Fungal",
    severity: "Moderate",
    hsvSignature: {
      chlorosisMin: 0.12,
      necrosisMin: 0.10,
      concentricRings: true
    },
    symptoms: [
      "Concentric ring 'bullseye' target patterns inside brown leaf spots",
      "Starts on older lower leaves first, spreading upward",
      "Leaves turn yellow around spots and drop prematurely",
      "Stem lesions dark and slightly sunken"
    ],
    causes: "Warm temperatures (24°C - 29°C) combined with frequent rain or heavy dew cycles.",
    organicControl: [
      "Apply Bacillus subtilis bio-fungicide weekly.",
      "Spray 5% Neem seed kernel extract (NSKE) solution.",
      "Mulch soil base heavily with straw to prevent fungal spores splashing from soil onto lower leaves."
    ],
    chemicalControl: [
      "Chlorothalonil 75% WP @ 2g/L of water.",
      "Azoxystrobin 23% SC @ 1ml/L as broad spectrum systemic protection."
    ],
    prevention: [
      "Maintain 3-year crop rotation with non-solanaceous crops (e.g., corn, beans).",
      "Remove infected bottom foliage up to 30cm off the ground."
    ],
    climateRiskFactor: {
      tempRange: [22, 32],
      humidityMin: 65
    }
  },
  {
    id: "tomato_yellow_leaf_curl",
    crop: "Tomato",
    name: "Yellow Leaf Curl Virus (TYLCV)",
    nameUrdu: "ٹماٹر کا پیلا پتہ مروڑ وائرس",
    scientificName: "Tomato yellow leaf curl virus",
    pathogenType: "Viral",
    severity: "Severe",
    hsvSignature: {
      chlorosisMin: 0.28,
      necrosisMin: 0.02,
      curlingPattern: true
    },
    symptoms: [
      "Severe upward curling and cupping of leaves",
      "Intense interveinal yellowing (chlorosis) on new growth",
      "Stunted overall plant growth with bushy top appearance",
      "Flower abortion and failure to set fruit"
    ],
    causes: "Transmitted exclusively by Silverleaf Whitefly (Bemisia tabaci).",
    organicControl: [
      "Yellow sticky traps placed 15cm above crop canopy (15-20 traps per acre).",
      "Spray Neem Oil (10000 ppm) @ 3ml/L or Potassium Salt of Fatty Acids to suppress whiteflies.",
      "Reflective silver plastic mulch to deter incoming whitefly vectors."
    ],
    chemicalControl: [
      "Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.5g/L for whitefly vector control.",
      "Note: Viruses cannot be cured chemically once infected; focus on vector destruction."
    ],
    prevention: [
      "Install fine insect mesh (40-50 mesh) in greenhouse production.",
      "Plant TYLCV resistant hybrids."
    ],
    climateRiskFactor: {
      tempRange: [26, 38],
      humidityMin: 35
    }
  },
  {
    id: "corn_common_rust",
    crop: "Corn (Maize)",
    name: "Common Rust",
    nameUrdu: "مئی / مکئی کی رتوی (کامن رسٹ)",
    scientificName: "Puccinia sorghi",
    pathogenType: "Fungal",
    severity: "Moderate",
    hsvSignature: {
      rustRedMin: 0.08,
      chlorosisMin: 0.08,
      pustulesDetected: true
    },
    symptoms: [
      "Small, oval to elongated cinnamon-brown reddish pustules on both upper and lower leaf surfaces",
      "Pustules rupture epidermal leaf layer releasing powdery reddish spores",
      "Severe infection causes leaf yellowing and premature leaf death"
    ],
    causes: "Cooler temperatures (16°C - 23°C) with high relative humidity and free moisture on leaf surface.",
    organicControl: [
      "Foliar application of sulfur dust or wettable sulfur (3g/L).",
      "Spray Compost Tea rich in antagonistic beneficial microflora."
    ],
    chemicalControl: [
      "Propiconazole 25% EC @ 1ml/L water.",
      "Tebuconazole + Trifloxystrobin @ 0.7g/L at first appearance of pustules."
    ],
    prevention: [
      "Plant rust-resistant corn cultivars.",
      "Plant early in the season to avoid peak spore migration windows."
    ],
    climateRiskFactor: {
      tempRange: [15, 23],
      humidityMin: 85
    }
  },
  {
    id: "corn_northern_leaf_blight",
    crop: "Corn (Maize)",
    name: "Northern Corn Leaf Blight",
    nameUrdu: "مکئی کا شمالی پتا جھلساؤ",
    scientificName: "Exserohilum turcicum",
    pathogenType: "Fungal",
    severity: "Severe",
    hsvSignature: {
      cigarLesions: true,
      necrosisMin: 0.15,
      chlorosisMin: 0.05
    },
    symptoms: [
      "Long, elliptical, cigar-shaped grayish-green to tan lesions (2.5 to 15 cm long)",
      "Dark dark grey fungal spore masses inside center of mature lesions during humid weather",
      "Coalescing lesions cause extensive leaf blade burning"
    ],
    causes: "Moderate temperatures (18°C - 27°C) and extended wet leaf periods (6+ hours).",
    organicControl: [
      "Deep tillage to bury crop residues from previous season.",
      "Trichoderma viride foliar spray @ 5g/L."
    ],
    chemicalControl: [
      "Pyraclostrobin 20% WG @ 1g/L.",
      "Azoxystrobin + Difenoconazole @ 1ml/L spray at silking stage."
    ],
    prevention: [
      "Rotate corn with non-host crops like soybeans or clover.",
      "Select resistant hybrids with Ht genes."
    ],
    climateRiskFactor: {
      tempRange: [18, 28],
      humidityMin: 75
    }
  },
  {
    id: "potato_late_blight",
    crop: "Potato",
    name: "Potato Late Blight",
    nameUrdu: "آلو کا لیٹ بلائٹ (جھلساؤ)",
    scientificName: "Phytophthora infestans",
    pathogenType: "Fungal",
    severity: "Critical",
    hsvSignature: {
      necrosisMin: 0.20,
      chlorosisMin: 0.10,
      darkSpotRatioMin: 0.15
    },
    symptoms: [
      "Irregular dark green to brown water-soaked blotches on leaf tips and margins",
      "Yellow chlorotic border around dark necrotized leaf areas",
      "White cottony fungal growth on underside of leaves in morning dampness",
      "Tuber infection shows brown dry rot under the skin"
    ],
    causes: "High humidity (>90%) combined with moderate temperatures (12°C - 20°C).",
    organicControl: [
      "Preventive sprays of Bordeaux Mixture (1%).",
      "Copper oxychloride 50% WP @ 3g/L."
    ],
    chemicalControl: [
      "Dimethomorph 50% WP @ 1g/L.",
      "Mandipropamid 23.4% SC @ 0.8ml/L water."
    ],
    prevention: [
      "Plant certified disease-free seed tubers.",
      "Hill up soil around tubers to prevent spore washed down by rain."
    ],
    climateRiskFactor: {
      tempRange: [10, 20],
      humidityMin: 85
    }
  },
  {
    id: "apple_scab",
    crop: "Apple",
    name: "Apple Scab",
    nameUrdu: "سیب کا داغ (ایپل اسکیب)",
    scientificName: "Venturia inaequalis",
    pathogenType: "Fungal",
    severity: "Moderate",
    hsvSignature: {
      velvetyOliveMin: 0.10,
      necrosisMin: 0.08
    },
    symptoms: [
      "Olive-green to velvety dark brown circular spots on leaves",
      "Leaves turn yellow, become distorted, and drop early",
      "Scabby corky lesions on fruit surface leading to fruit cracking"
    ],
    causes: "Frequent spring rain and leaf wetness at temperatures between 13°C - 24°C.",
    organicControl: [
      "Apply Liquid Lime Sulfur during dormant and green-tip bud stages.",
      "Clean up and compost or burn fallen leaves in autumn to reduce winter spores."
    ],
    chemicalControl: [
      "Difenoconazole 25% EC @ 0.5ml/L.",
      "Captan 50% WP @ 2.5g/L."
    ],
    prevention: [
      "Prune tree canopy to maximize sun exposure and rapid leaf drying.",
      "Plant scab-resistant apple varieties (e.g. Liberty, Enterprise)."
    ],
    climateRiskFactor: {
      tempRange: [13, 24],
      humidityMin: 80
    }
  },
  {
    id: "grape_black_rot",
    crop: "Grape",
    name: "Grape Black Rot",
    nameUrdu: "انگور کا سیاہ سڑاند (بلیک روٹ)",
    scientificName: "Guignardia bidwellii",
    pathogenType: "Fungal",
    severity: "Severe",
    hsvSignature: {
      reddishBrownSpots: true,
      blackPycnidia: true
    },
    symptoms: [
      "Small reddish-brown circular spots on leaf surfaces",
      "Tiny black dots (pycnidia) visible inside brown leaf spots",
      "Grapes shrivel into hard, black, wrinkled mummies"
    ],
    causes: "Warm wet weather during spring and early summer shoot development.",
    organicControl: [
      "Remove mummified berries from vine during winter pruning.",
      "Copper hydroxide spray @ 2g/L."
    ],
    chemicalControl: [
      "Myclobutanil 10% WP @ 0.4g/L.",
      "Mancozeb 75% WP spray."
    ],
    prevention: [
      "Ensure good trellis aeration and shoot thinning.",
      "Destroy all infected leaf litter under grapevines."
    ],
    climateRiskFactor: {
      tempRange: [20, 30],
      humidityMin: 70
    }
  },
  {
    id: "pepper_bacterial_spot",
    crop: "Pepper (Capsicum)",
    name: "Bacterial Spot",
    nameUrdu: "مرچ کا بیکٹیریائی داغ",
    scientificName: "Xanthomonas euvesicatoria",
    pathogenType: "Bacterial",
    severity: "Severe",
    hsvSignature: {
      waterSoakedSpots: true,
      necrosisMin: 0.12,
      chlorosisMin: 0.08
    },
    symptoms: [
      "Small, yellow-green water-soaked spots on leaves turning dark brown",
      "Leaf spots have a greasy or translucent appearance",
      "Severe leaf drop leaving pepper fruits exposed to sunscald"
    ],
    causes: "Splashing rain, overhead irrigation, and warm temperatures (24°C - 32°C).",
    organicControl: [
      "Copper Hydroxide + Mancozeb tank mix spray.",
      "Biocontrol spray with Streptomyces sp. or Pseudomonas fluorescens."
    ],
    chemicalControl: [
      "Copper Oxychloride (2.5g/L) + Streptocycline (Bactericide) @ 0.1g/L of water."
    ],
    prevention: [
      "Use pathogen-tested certified pepper seeds.",
      "Avoid handling pepper plants when foliage is wet."
    ],
    climateRiskFactor: {
      tempRange: [24, 34],
      humidityMin: 75
    }
  },
  {
    id: "cotton_leaf_curl",
    crop: "Cotton",
    name: "Cotton Leaf Curl Disease (CLCuD)",
    nameUrdu: "کپاس کا پتہ مروڑ وائرس (لیف کرل)",
    scientificName: "Cotton leaf curl Multan virus",
    pathogenType: "Viral",
    severity: "Critical",
    hsvSignature: {
      veinThickening: true,
      curlingPattern: true,
      enationDetected: true
    },
    symptoms: [
      "Upward or downward curling of leaf margins",
      "Thickening of leaf veins on the underside",
      "Cup-like leaf outgrowths (enations) on leaf undersides",
      "Severe stunting of cotton plant with zero boll formation"
    ],
    causes: "Whitefly (Bemisia tabaci) vector transmission during hot, dry summer months.",
    organicControl: [
      "Erect yellow sticky traps @ 25 traps/acre.",
      "Neem Oil spray 10,000 ppm @ 3ml/Liter water every 5 days."
    ],
    chemicalControl: [
      "Diafenthiuron 50% WP @ 1g/L for whitefly knock-down.",
      "Spirotetramat 15.3% OD @ 1ml/L for long lasting whitefly nymph control."
    ],
    prevention: [
      "Sow CLCuD resistant/tolerant cotton varieties (e.g., CKC-01, MNH-886).",
      "Eradicate weed hosts like Abutilon and Malvestrum around field borders."
    ],
    climateRiskFactor: {
      tempRange: [30, 42],
      humidityMin: 40
    }
  },
  {
    id: "wheat_stripe_rust",
    crop: "Wheat",
    name: "Yellow / Stripe Rust",
    nameUrdu: "گندم کی پیلی رتوی (اسٹرائپ رسٹ)",
    scientificName: "Puccinia striiformis",
    pathogenType: "Fungal",
    severity: "Critical",
    hsvSignature: {
      yellowStripes: true,
      rustRedMin: 0.15
    },
    symptoms: [
      "Bright yellow lemon-colored pustules arranged in linear stripes along leaf veins",
      "Powdery yellow spores rub off on fingers when leaf is touched",
      "Leaves dry out, turn brown, and shrivel up like burnt paper"
    ],
    causes: "Cool climate (7°C - 15°C) with persistent fog or dew during tiller and boot stage.",
    organicControl: [
      "Bio-control spray of Trichoderma harzianum @ 10g/L.",
      "Sulfur dust 25 kg/hectare."
    ],
    chemicalControl: [
      "Tebuconazole 25.9% EC @ 1ml/L at first stripe appearance.",
      "Propiconazole 25% EC @ 1ml/L."
    ],
    prevention: [
      "Plant rust-resistant wheat varieties (e.g., Akbar-19, Dilkash-20, Faisalabad-08).",
      "Avoid late sowing of wheat crops."
    ],
    climateRiskFactor: {
      tempRange: [6, 18],
      humidityMin: 85
    }
  },
  {
    id: "healthy_plant",
    crop: "All Crops",
    name: "Healthy Plant Leaf",
    nameUrdu: "صحت مند پودا (کوئی بیماری نہیں)",
    scientificName: "Normal Foliage",
    pathogenType: "Healthy",
    severity: "Healthy",
    hsvSignature: {
      greenRatioMin: 0.70,
      necrosisMax: 0.04,
      chlorosisMax: 0.08
    },
    symptoms: [
      "Vibrant green leaf lamina with clean leaf margins",
      "No visible spots, water-soaked lesions, or powdery pustules",
      "Uniform turgor pressure and healthy vein vascularization"
    ],
    causes: "Optimal nutrient availability, balanced moisture, and good crop management.",
    organicControl: [
      "Maintain healthy soil food web with organic compost / vermicompost.",
      "Foliar spray of Seaweed extract (2ml/L) as natural biostimulant."
    ],
    chemicalControl: [
      "No chemical pesticides required! Maintain balanced NPK fertilizers (e.g. 20-20-20 balanced feed)."
    ],
    prevention: [
      "Continue regular crop scouting every 3-4 days.",
      "Maintain drip irrigation schedule and soil mulch layer."
    ],
    climateRiskFactor: {
      tempRange: [18, 32],
      humidityMin: 40
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DISEASE_DATABASE };
}
