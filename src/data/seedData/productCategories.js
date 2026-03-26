import { COMPANIES } from "./companies";

const LOCAL_STORAGE_KEY = "vms_local_product_categories";
const LOCAL_DELETED_STORAGE_KEY = "vms_deleted_product_categories";

const GOODS = [
  "Biometric",
  "Biometric Services",
  "Building/Office Renovation",
  "Cafeteria Supply",
  "Electrical",
  "Fixed Assets",
  "HR Welfare",
  "Housekeeping material",
  "Meal Services",
  "Office Furniture",
  "Office Interior Design Consultancy",
  "Office Setup/Event/Miscellaneous",
  "Office Stationery",
  "Office Surveillance Equipment",
  "Pantry Sevices",
  "Printing Stationery",
  "Security & Compliance",
  "Service Charges (ITS)",
  "Stationery Items",
  "VAPT",
  "VAPT Application",
  "Welcome Kits for HR",
];

const SERVICES = [
  "Background Verificaiton",
  "Contractual Resources",
  "Courier and Postage",
  "Healthcare",
  "Internet",
  "Mediclaim",
  "Synergita Portal",
  "Transport",
  "Welfare",
];

const GOODS_AND_SERVICES = [
  "Conference, Summit, Events, RnR",
  "Employee Engagement",
  "Maintenance (Admin)",
  "Maintenance (ITS)",
  "Miscellaneous",
  "Office Cars",
  "Office Hygiene and Sanitation",
  "Project Outsourcing",
  "Rental",
  "Softwares and Licences",
];

const buildTemplate = (name, majorType, index) => ({
  name,
  majorType,
  description: `Demo category for ${name}`,
  category: "General",
  categoryCode: `CAT-${String(index + 1).padStart(3, "0")}`,
});

const CATEGORY_TEMPLATES = [
  ...GOODS.map((name, index) => buildTemplate(name, "Goods", index)),
  ...SERVICES.map((name, index) => buildTemplate(name, "Services", GOODS.length + index)),
  ...GOODS_AND_SERVICES.map((name, index) =>
    buildTemplate(name, "Goods and Services", GOODS.length + SERVICES.length + index)
  ),
];

const normalizeMajorType = (value = "") => {
  const normalized = String(value).trim().toLowerCase();

  if (
    normalized.includes("goods and services") ||
    normalized.includes("good and service") ||
    normalized.includes("goodsandservices")
  ) {
    return "Goods and Services";
  }

  if (normalized.includes("goods") || normalized === "good") {
    return "Goods";
  }

  if (normalized.includes("service")) {
    return "Services";
  }

  return "Services";
};

const getUnitOfMeasure = (majorType) => {
  const normalized = normalizeMajorType(majorType);

  if (normalized === "Goods") {
    return "Each";
  }

  if (normalized === "Goods and Services") {
    return "Lot";
  }

  return "Hour";
};

const parseCompanyNumericSuffix = (companyId = "") => {
  const parts = String(companyId).split("-");
  const parsed = Number(parts[1]);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildCategoryId = (companyId, templateIndex) => {
  const companyNum = parseCompanyNumericSuffix(companyId);
  return 900000 + companyNum * 1000 + (templateIndex + 1);
};

export const buildMetaDescription = (description = "", metadata = {}) => {
  const cleanDescription = String(description || "").trim();
  const metaJson = JSON.stringify(metadata || {});
  return `${cleanDescription}##VMSMETA: ${metaJson}`;
};

export const parseDescriptionWithMeta = (descriptionValue = "") => {
  const marker = "##VMSMETA:";
  const markerIndex = descriptionValue.lastIndexOf(marker);

  if (markerIndex === -1) {
    return { cleanDescription: descriptionValue, meta: {} };
  }

  const cleanDescription = descriptionValue.slice(0, markerIndex).trim();
  const metaPart = descriptionValue.slice(markerIndex + marker.length).trim();

  try {
    const meta = JSON.parse(metaPart);
    return { cleanDescription, meta };
  } catch {
    return { cleanDescription: descriptionValue, meta: {} };
  }
};

const toServiceRecord = (companyId, template, index) => {
  const majorType = normalizeMajorType(template.majorType);

  return {
    VendorMgrServiceId: buildCategoryId(companyId, index),
    companyId,
    isDemoCategory: true,
    ServiceName: template.name,
    Description: buildMetaDescription(template.description, {
      itemType: majorType,
      category: template.category,
      categoryCode: template.categoryCode,
      unitOfMeasure: getUnitOfMeasure(majorType),
      status: "Active",
      seededDemo: true,
    }),
    MaxAmount: 0,
    StatusText: "Active",
  };
};

const SEEDED_CATEGORY_RECORDS = COMPANIES.flatMap((company) =>
  CATEGORY_TEMPLATES.map((template, index) => toServiceRecord(company.id, template, index))
);

export const getSeededProductCategoriesByCompany = (companyId) =>
  SEEDED_CATEGORY_RECORDS.filter((record) => record.companyId === companyId);

export const getLocalProductCategories = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const getLocalProductCategoriesByCompany = (companyId) =>
  getLocalProductCategories().filter((record) => record.companyId === companyId);

export const getDeletedProductCategoryKeys = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(LOCAL_DELETED_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const buildDeletedCategoryKey = (companyId, categoryId) => `${companyId}:${categoryId}`;

const setDeletedProductCategoryKeys = (keys) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LOCAL_DELETED_STORAGE_KEY, JSON.stringify(keys));
};

export const addLocalProductCategory = (category) => {
  if (typeof window === "undefined") {
    return;
  }

  const current = getLocalProductCategories();
  const next = [...current, category];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));

  const deletedKeys = getDeletedProductCategoryKeys().filter(
    (key) => key !== buildDeletedCategoryKey(category.companyId, category.VendorMgrServiceId)
  );
  setDeletedProductCategoryKeys(deletedKeys);
};

export const updateLocalProductCategory = (category) => {
  if (typeof window === "undefined") {
    return;
  }

  const current = getLocalProductCategories();
  const index = current.findIndex(
    (record) => record.companyId === category.companyId && record.VendorMgrServiceId === category.VendorMgrServiceId
  );

  if (index === -1) {
    current.push(category);
  } else {
    current[index] = {
      ...current[index],
      ...category,
    };
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));

  const deletedKeys = getDeletedProductCategoryKeys().filter(
    (key) => key !== buildDeletedCategoryKey(category.companyId, category.VendorMgrServiceId)
  );
  setDeletedProductCategoryKeys(deletedKeys);
};

export const deleteProductCategory = (companyId, categoryId) => {
  if (typeof window === "undefined") {
    return;
  }

  const nextLocal = getLocalProductCategories().filter(
    (record) => !(record.companyId === companyId && Number(record.VendorMgrServiceId) === Number(categoryId))
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextLocal));

  const deletedKeys = new Set(getDeletedProductCategoryKeys());
  deletedKeys.add(buildDeletedCategoryKey(companyId, categoryId));
  setDeletedProductCategoryKeys(Array.from(deletedKeys));
};

export const getProductCategoriesByCompany = (companyId) => {
  const seeded = getSeededProductCategoriesByCompany(companyId);
  const local = getLocalProductCategoriesByCompany(companyId);
  const deletedKeys = new Set(getDeletedProductCategoryKeys());

  const merged = new Map();
  seeded.forEach((record) => {
    const key = buildDeletedCategoryKey(companyId, record.VendorMgrServiceId);
    if (!deletedKeys.has(key)) {
      merged.set(record.VendorMgrServiceId, record);
    }
  });
  local.forEach((record) => {
    const key = buildDeletedCategoryKey(companyId, record.VendorMgrServiceId);
    if (!deletedKeys.has(key)) {
      merged.set(record.VendorMgrServiceId, record);
    }
  });

  return Array.from(merged.values());
};

export const getNextProductCategoryId = (companyId) => {
  const allRecords = [
    ...getSeededProductCategoriesByCompany(companyId),
    ...getLocalProductCategoriesByCompany(companyId),
  ];

  const maxId = allRecords.reduce((highest, record) => {
    const currentId = Number(record.VendorMgrServiceId);
    return Number.isFinite(currentId) && currentId > highest ? currentId : highest;
  }, buildCategoryId(companyId, CATEGORY_TEMPLATES.length));

  return maxId + 1;
};

export const getProductCategoryByIdForCompany = (companyId, categoryId) =>
  getProductCategoriesByCompany(companyId).find((record) => Number(record.VendorMgrServiceId) === Number(categoryId)) || null;

export const getDemoCategoryTemplates = () => CATEGORY_TEMPLATES.slice();
export const normalizeProductCategoryMajorType = normalizeMajorType;
