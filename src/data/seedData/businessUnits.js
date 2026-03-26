import { COMPANIES } from "./companies";

// TODO: replace static seed data with Branches API when backend is ready.
// ── BRANCHES ────────────────────────────────────────────────────────────────

const COUNTRY_BRANCH_TEMPLATES = {
  Canada: [
    {
      suffix: "toronto",
      code: "TOR",
      name: "Toronto",
      location: "Toronto, ON",
      description: "100 King St W, Toronto, ON M5X 1A9, Canada"
    },
    {
      suffix: "vancouver",
      code: "VAN",
      name: "Vancouver",
      location: "Vancouver, BC",
      description: "200 Burrard St, Vancouver, BC V6C 3L6, Canada"
    },
    {
      suffix: "calgary",
      code: "CAL",
      name: "Calgary",
      location: "Calgary, AB",
      description: "300 5 Ave SW, Calgary, AB T2P 3C4, Canada"
    },
    {
      suffix: "montreal",
      code: "MTL",
      name: "Montreal",
      location: "Montreal, QC",
      description: "400 Rene-Levesque Blvd W, Montreal, QC H2Z 1V7, Canada"
    },
    {
      suffix: "ottawa",
      code: "OTT",
      name: "Ottawa",
      location: "Ottawa, ON",
      description: "500 Laurier Ave W, Ottawa, ON K1R 5E1, Canada"
    },
    {
      suffix: "edmonton",
      code: "EDM",
      name: "Edmonton",
      location: "Edmonton, AB",
      description: "600 Jasper Ave, Edmonton, AB T5J 3R8, Canada"
    },
    {
      suffix: "halifax",
      code: "HLX",
      name: "Halifax",
      location: "Halifax, NS",
      description: "700 Barrington St, Halifax, NS B3H 1Z5, Canada"
    },
    {
      suffix: "winnipeg",
      code: "WPG",
      name: "Winnipeg",
      location: "Winnipeg, MB",
      description: "800 Main St, Winnipeg, MB R3C 1A8, Canada"
    }
  ],
  USA: [
    {
      suffix: "new-york",
      code: "NYC",
      name: "New York",
      location: "New York, NY",
      description: "350 5th Ave, New York, NY 10118, USA"
    },
    {
      suffix: "dallas",
      code: "DAL",
      name: "Dallas",
      location: "Dallas, TX",
      description: "2100 Ross Ave, Dallas, TX 75201, USA"
    },
    {
      suffix: "chicago",
      code: "CHI",
      name: "Chicago",
      location: "Chicago, IL",
      description: "233 S Wacker Dr, Chicago, IL 60606, USA"
    },
    {
      suffix: "atlanta",
      code: "ATL",
      name: "Atlanta",
      location: "Atlanta, GA",
      description: "3344 Peachtree Rd NE, Atlanta, GA 30326, USA"
    },
    {
      suffix: "seattle",
      code: "SEA",
      name: "Seattle",
      location: "Seattle, WA",
      description: "1201 3rd Ave, Seattle, WA 98101, USA"
    },
    {
      suffix: "phoenix",
      code: "PHX",
      name: "Phoenix",
      location: "Phoenix, AZ",
      description: "2398 E Camelback Rd, Phoenix, AZ 85016, USA"
    },
    {
      suffix: "miami",
      code: "MIA",
      name: "Miami",
      location: "Miami, FL",
      description: "701 Brickell Ave, Miami, FL 33131, USA"
    },
    {
      suffix: "denver",
      code: "DEN",
      name: "Denver",
      location: "Denver, CO",
      description: "1144 15th St, Denver, CO 80202, USA"
    }
  ],
  India: [
    {
      suffix: "mohali",
      code: "MOH",
      name: "Mohali",
      location: "Mohali, PB",
      description: "Plot 1, Focal Point, Phase 9, Mohali, PB 160062, India"
    },
    {
      suffix: "bhopal",
      code: "BPL",
      name: "Bhopal",
      location: "Bhopal, MP",
      description: "21 MP Nagar, Zone II, Bhopal, MP 462011, India"
    },
    {
      suffix: "noida-hq",
      code: "NDH",
      name: "Noida Head Office",
      location: "Noida, UP",
      description: "C-4, Sector 58, Noida, UP 201301, India"
    },
    {
      suffix: "visakhapatnam",
      code: "VSK",
      name: "Visakhapatnam",
      location: "Visakhapatnam, AP",
      description: "Waltair Main Road, Visakhapatnam, AP 530003, India"
    },
    {
      suffix: "jaipur",
      code: "JPR",
      name: "Jaipur",
      location: "Jaipur, RJ",
      description: "Tonk Road, Jaipur, RJ 302018, India"
    },
    {
      suffix: "hyderabad",
      code: "HYD",
      name: "Hyderabad",
      location: "Hyderabad, TS",
      description: "Begumpet, Hyderabad, TS 500016, India"
    },
    {
      suffix: "vadodara",
      code: "VDR",
      name: "Vadodara",
      location: "Vadodara, GJ",
      description: "Vikram Sarabhai Marg, Vadodara, GJ 390007, India"
    },
    {
      suffix: "goa",
      code: "GOA",
      name: "Goa",
      location: "Panaji, GA",
      description: "Patto Business District, Panaji, GA 403001, India"
    }
  ]
};

const inferCountryFromCompanyName = (companyName = "") => {
  const normalizedName = companyName.toLowerCase();

  if (normalizedName.includes("canada")) {
    return "Canada";
  }

  if (normalizedName.includes("usa") || normalizedName.includes("us")) {
    return "USA";
  }

  return "India";
};

const CONTEXTUAL_RECENT_BRANCHES = COMPANIES.flatMap((company) => {
  const companySuffix = company.id.replace("comp-", "");
  const countryFromName = inferCountryFromCompanyName(company.name);
  const branchTemplates = COUNTRY_BRANCH_TEMPLATES[countryFromName] || COUNTRY_BRANCH_TEMPLATES.India;

  return branchTemplates.map((branch) => ({
    id: `bu-${companySuffix}-${branch.suffix}`,
    companyId: company.id,
    code: `BR-${companySuffix}-${branch.code}`,
    name: branch.name,
    location: branch.location,
    description: branch.description,
    isActive: true
  }));
});

export const BUSINESS_UNITS = [
  // ── COMPUNNEL CANADA (comp-001) ──────────
  {
    id: "bu-001",
    companyId: "comp-001",
    code: "BR-CAD-OPS",
    name: "Canada Operations",
    location: "Toronto, ON",
    description: "Main operations center handling North American operations and strategic planning.",
    isActive: true
  },

  // ── COMPUNNEL USA (comp-002) ─────────────
  {
    id: "bu-002",
    companyId: "comp-002",
    code: "BR-USA-OPS",
    name: "USA Operations",
    location: "New York, NY",
    description: "US operations focusing on market development and customer engagement.",
    isActive: true
  },

  // ── CONSOLIDATED (comp-003) ──────────────
  {
    id: "bu-003",
    companyId: "comp-003",
    code: "BR-CON-OPS",
    name: "Consolidated Hub",
    location: "Noida, UP",
    description: "A-8, Sector 62, Noida, UP 201309, India",
    isActive: true
  },

  // ── INFOPRO (comp-004) ───────────────────
  {
    id: "bu-004",
    companyId: "comp-004",
    code: "BR-INF-OPS",
    name: "InfoPro Division",
    location: "Bengaluru, KA",
    description: "Outer Ring Road, Marathahalli, Bengaluru, KA 560037, India",
    isActive: true
  },

  // ── JOBLETICS (comp-005) ─────────────────
  {
    id: "bu-005",
    companyId: "comp-005",
    code: "BR-JOB-OPS",
    name: "Jobletics Division",
    location: "Pune, MH",
    description: "Baner Road, Pune, MH 411045, India",
    isActive: true
  },

  // ── LMG (comp-006) ───────────────────────
  {
    id: "bu-006",
    companyId: "comp-006",
    code: "BR-LMG-OPS",
    name: "LMG Operations",
    location: "Ahmedabad, GJ",
    description: "SG Highway, Ahmedabad, GJ 380054, India",
    isActive: true
  },

  // ── NURSEDECK (comp-007) ─────────────────
  {
    id: "bu-007",
    companyId: "comp-007",
    code: "BR-ND-OPS",
    name: "NurseDeck Ops",
    location: "Chennai, TN",
    description: "OMR Road, Perungudi, Chennai, TN 600096, India",
    isActive: true
  },

  // ── SPARTOI (comp-008) ───────────────────
  {
    id: "bu-008",
    companyId: "comp-008",
    code: "BR-SPA-OPS",
    name: "Spartoi Operations",
    location: "Gurugram, HR",
    description: "DLF Cyber City, Gurugram, HR 122002, India",
    isActive: true
  },

  // ── WEBSTART (comp-009) ──────────────────
  {
    id: "bu-009",
    companyId: "comp-009",
    code: "BR-WEB-OPS",
    name: "WebStart Solutions",
    location: "Kolkata, WB",
    description: "Sector V, Salt Lake, Kolkata, WB 700091, India",
    isActive: true
  },

  // ── FOUNDATION (comp-010) ────────────────
  {
    id: "bu-010",
    companyId: "comp-010",
    code: "BR-FOU-OPS",
    name: "Foundation Services",
    location: "Delhi, DL",
    description: "Barakhamba Road, Connaught Place, Delhi, DL 110001, India",
    isActive: true
  },

  // ── TECHNOLOGY INDIA (comp-011) ──────────
  {
    id: "bu-011",
    companyId: "comp-011",
    code: "BR-TI-OPS",
    name: "Technology India",
    location: "Bengaluru, KA",
    description: "Technology services and innovation center in India.",
    isActive: true
  },

  // ── INCUBATION SYSTEMS (comp-012) ───────
  {
    id: "bu-012",
    companyId: "comp-012",
    code: "BR-INC-OPS",
    name: "Incubation Systems",
    location: "Hyderabad, TS",
    description: "Startup incubation and business development platform.",
    isActive: true
  },

  // ── INFOPRO INDIA (comp-013) ────────────
  {
    id: "bu-013",
    companyId: "comp-013",
    code: "BR-II-OPS",
    name: "InfoPro India",
    location: "Noida, UP",
    description: "Information technology services in India market.",
    isActive: true
  },

  // ── RBA TRADELINK (comp-014) ────────────
  {
    id: "bu-014",
    companyId: "comp-014",
    code: "BR-RBA-OPS",
    name: "RBA Tradelink",
    location: "Mumbai, MH",
    description: "Trade and logistics solutions provider.",
    isActive: true
  },

  ...CONTEXTUAL_RECENT_BRANCHES
];

// ── DEPARTMENTS (Functional Departments) ────────────────────────────────────

export const DEPARTMENTS = [

  // TODO: remove static block after API integration.
  // ── COMPUNNEL CANADA (comp-001) ──────────

  {
    id: "dept-001",
    companyId: "comp-001",
    code: "HR",
    name: "Human Resources",
    description: "Manages all people operations, talent acquisition, learning and development, and employee engagement.",
    isActive: true
  },
  {
    id: "dept-002",
    companyId: "comp-001",
    code: "IT",
    name: "Information Technology",
    description: "Manages IT infrastructure, software, hardware, networking, and security.",
    isActive: true
  },
  {
    id: "dept-003",
    companyId: "comp-001",
    code: "FIN",
    name: "Finance",
    description: "Manages accounts payable, receivable, treasury, budgeting and financial reporting.",
    isActive: true
  },
  {
    id: "dept-004",
    companyId: "comp-001",
    code: "ADMIN",
    name: "Administration",
    description: "Manages facility operations, housekeeping, transport, pantry, and general office management.",
    isActive: true
  },
  {
    id: "dept-005",
    companyId: "comp-001",
    code: "OPS",
    name: "Operations",
    description: "Manages day-to-day business operations, process improvement, and delivery support.",
    isActive: true
  },
  {
    id: "dept-006",
    companyId: "comp-001",
    code: "SALES",
    name: "Sales & Business Development",
    description: "Manages client acquisition, business development, and revenue growth.",
    isActive: true
  },
  {
    id: "dept-007",
    companyId: "comp-001",
    code: "MKT",
    name: "Marketing",
    description: "Manages brand, digital marketing, events, content and communications.",
    isActive: true
  },
  {
    id: "dept-008",
    companyId: "comp-001",
    code: "LEGAL",
    name: "Legal & Compliance",
    description: "Manages legal contracts, regulatory compliance, and risk management.",
    isActive: true
  },
  {
    id: "dept-009",
    companyId: "comp-001",
    code: "PMO",
    name: "Project Management Office",
    description: "Manages project governance, delivery standards, and program management.",
    isActive: true
  },
  {
    id: "dept-010",
    companyId: "comp-001",
    code: "PROC",
    name: "Procurement",
    description: "Manages vendor relationships, sourcing, purchase requests, and supply chain.",
    isActive: true
  },

  // TODO: remove static block after API integration.
  // ── COMPUNNEL USA (comp-002) ─────────────

  {
    id: "dept-011",
    companyId: "comp-002",
    code: "HR-US",
    name: "Human Resources",
    description: "US HR operations, talent acquisition, and employee engagement.",
    isActive: true
  },
  {
    id: "dept-012",
    companyId: "comp-002",
    code: "IT-US",
    name: "Information Technology",
    description: "US IT infrastructure, software licensing, and technical support.",
    isActive: true
  },
  {
    id: "dept-013",
    companyId: "comp-002",
    code: "FIN-US",
    name: "Finance",
    description: "US accounts, payroll, treasury, and financial compliance.",
    isActive: true
  },
  {
    id: "dept-014",
    companyId: "comp-002",
    code: "SALES-US",
    name: "Sales & Business Development",
    description: "US client acquisition and revenue growth.",
    isActive: true
  },
  {
    id: "dept-015",
    companyId: "comp-002",
    code: "OPS-US",
    name: "Operations",
    description: "US delivery operations and process management.",
    isActive: true
  }

];

// TODO: move helper access to API service when backend is available.
// ── HELPER FUNCTIONS - BUSINESS UNITS ────────────────────────────────

// Get Business Units for a specific company
export const getBusinessUnitsByCompany = (companyId) =>
  BUSINESS_UNITS.filter(bu => bu.companyId === companyId);

// Get a single Business Unit by id
export const getBusinessUnitById = (id) =>
  BUSINESS_UNITS.find(bu => bu.id === id) || null;

// TODO: replace helper with API search endpoint when backend is available.
export const getBusinessUnitByIdForCompany = (companyId, id) => {
  const seedUnit = BUSINESS_UNITS.find((bu) => bu.companyId === companyId && bu.id === id) || null;
  const localUnit = getLocalBusinessUnitsByCompany(companyId).find((bu) => bu.id === id) || null;
  return localUnit || seedUnit;
};

// Get active Business Units for a company
export const getActiveBusinessUnits = (companyId) =>
  BUSINESS_UNITS.filter(
    bu => bu.companyId === companyId && bu.isActive
  );

const LOCAL_STORAGE_KEY = 'vms_local_business_units';

// TODO: replace local storage cache with backend persistence.
export const getLocalBusinessUnits = () => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// TODO: replace local storage cache with backend persistence.
export const getLocalBusinessUnitsByCompany = (companyId) =>
  getLocalBusinessUnits().filter((bu) => bu.companyId === companyId);

// TODO: replace local storage cache with backend persistence.
export const addLocalBusinessUnit = (businessUnit) => {
  if (typeof window === 'undefined') return;
  const current = getLocalBusinessUnits();
  const next = [...current, businessUnit];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
};

// TODO: replace local edit cache with backend persistence.
export const updateLocalBusinessUnit = (businessUnit) => {
  if (typeof window === 'undefined') return;

  const current = getLocalBusinessUnits();
  const index = current.findIndex((bu) => bu.id === businessUnit.id);

  if (index === -1) {
    current.push(businessUnit);
  } else {
    current[index] = {
      ...current[index],
      ...businessUnit,
    };
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
};

// ── HELPER FUNCTIONS - DEPARTMENTS ──────────────────────────────────

// Get Departments for a specific company
export const getDepartmentsByCompany = (companyId) =>
  DEPARTMENTS.filter(dept => dept.companyId === companyId);

// Get a single Department by id
export const getDepartmentById = (id) =>
  DEPARTMENTS.find(dept => dept.id === id) || null;

// Get active Departments for a company
export const getActiveDepartments = (companyId) =>
  DEPARTMENTS.filter(
    dept => dept.companyId === companyId && dept.isActive
  );

