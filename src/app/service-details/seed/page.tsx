"use client";

import React, { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import { servicesService } from "@/services/services-service";
import { serviceDetailsService } from "@/services/service-details-service";
import seedItems from "@/data/seedData/seed_items.json";

type MajorType = "Goods" | "Services" | "Goods and Services";

type SeedItem = {
  productCode: string;
  productName: string;
  productDescription: string | null;
  unitType: string | null;
  productCategory: string | null;
  productSubCategory: string | null;
  unitPrice: number | string | null;
  hsnCode: string | null;
  majorType: string | null;
  productType: string | null;
  rcmApplicable: string | null;
  gstNotApplicable: string | null;
  buyAccountCode: string | null;
  defaultTds: string | null;
  equalizationLevy: string | null;
  taxPercentage: number | string | null;
  remarks: string | null;
  isActive: boolean | null;
  glCode: string | null;
  glName: string | null;
  gstGroup: string | null;
  gstRate: string | null;
  assetsType: string | null;
  inventoryPostingGroup: string | null;
  inventoryPostingGroupCode: string | null;
  warrantyPeriod: string | null;
};

type CategoryRecord = {
  id: number;
  name: string;
};

type ExistingItemRecord = {
  id?: number;
  name: string;
  description: string;
  productCode?: string;
};

type SeedFailure = {
  productCode: string;
  productName: string;
  reason: string;
};

type SeedResult = {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  missingCategories: string[];
  failures: SeedFailure[];
};

const ITEM_META_MARKER = "##VMSITEMMETA:";
const EXPECTED_TOTAL = 516;
const EXPECTED_COUNTS: Record<MajorType, number> = {
  Goods: 404,
  Services: 64,
  "Goods and Services": 48,
};

const rawSeedItems = seedItems as SeedItem[];

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeMajorType(value: string | null | undefined): MajorType | null {
  const normalized = normalizeText(value);

  if (normalized === "goods") {
    return "Goods";
  }

  if (normalized === "services" || normalized === "service") {
    return "Services";
  }

  if (
    normalized === "goods and services" ||
    normalized === "good and services" ||
    normalized === "goods & services" ||
    normalized === "both"
  ) {
    return "Goods and Services";
  }

  return null;
}

function buildSeedDescription(
  item: SeedItem,
  companyId: string,
  category: CategoryRecord,
  majorType: MajorType
): string {
  const cleanDescription = String(item.productDescription || item.productName || item.productCode || "").trim();
  const metadata = {
    seededDemo: true,
    sourceFile: "src/data/seedData/seed_items.json",
    companyId,
    productCategoryId: category.id,
    productCategoryName: category.name,
    majorType,
    productCode: item.productCode,
    productName: item.productName,
    productDescription: item.productDescription,
    unitType: item.unitType,
    productCategory: item.productCategory,
    productSubCategory: item.productSubCategory,
    unitPrice: item.unitPrice,
    hsnCode: item.hsnCode,
    productType: item.productType,
    rcmApplicable: item.rcmApplicable,
    gstNotApplicable: item.gstNotApplicable,
    buyAccountCode: item.buyAccountCode,
    defaultTds: item.defaultTds,
    equalizationLevy: item.equalizationLevy,
    taxPercentage: item.taxPercentage,
    remarks: item.remarks,
    isActive: true,
    glCode: item.glCode,
    glName: item.glName,
    gstGroup: item.gstGroup,
    gstRate: item.gstRate,
    assetsType: item.assetsType,
    inventoryPostingGroup: item.inventoryPostingGroup,
    inventoryPostingGroupCode: item.inventoryPostingGroupCode,
    warrantyPeriod: item.warrantyPeriod,
  };

  return `${cleanDescription}${ITEM_META_MARKER} ${JSON.stringify(metadata)}`;
}

function parseSeedMetadata(description: string | null | undefined): Record<string, unknown> {
  const value = String(description ?? "");
  const markerIndex = value.lastIndexOf(ITEM_META_MARKER);

  if (markerIndex === -1) {
    return {};
  }

  const rawMeta = value.slice(markerIndex + ITEM_META_MARKER.length).trim();

  try {
    const parsed = JSON.parse(rawMeta);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function getAllCategories(): Promise<CategoryRecord[]> {
  const response = await servicesService.getServices({
    searchTerm: "",
    pageNumber: 1,
    pageSize: 1000,
    sortBy: "",
    sortDescending: false,
    filter: {},
  });

  const records = response.Data?.Records ?? [];

  return records
    .map((record, index) => {
      const rawId =
        (record as { serviceId?: number }).serviceId ??
        record.VendorMgrServiceId ??
        record.vendorMgrServiceId ??
        index + 1;
      const rawName = record.ServiceName ?? record.serviceName ?? "";

      return {
        id: Number(rawId),
        name: String(rawName).trim(),
      };
    })
    .filter((record) => Number.isFinite(record.id) && record.name.length > 0);
}

async function getAllExistingItems(): Promise<ExistingItemRecord[]> {
  const pageSize = 1000;
  const firstPage = await serviceDetailsService.getServiceDetails({
    searchTerm: "",
    pageNumber: 1,
    pageSize,
    sortBy: "",
    sortDescending: false,
    filter: {},
  });

  const totalPages = firstPage.Data?.TotalPages ?? 1;
  const records = [...(firstPage.Data?.Records ?? [])];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const page = await serviceDetailsService.getServiceDetails({
      searchTerm: "",
      pageNumber,
      pageSize,
      sortBy: "",
      sortDescending: false,
      filter: {},
    });
    records.push(...(page.Data?.Records ?? []));
  }

  return records.map((record) => {
    const name = String(record.ServiceDetailName ?? record.serviceDetailName ?? "").trim();
    const description = String(
      record.ServiceDetailDescription ?? record.serviceDetailDescription ?? ""
    );
    const metadata = parseSeedMetadata(description);
    const productCode = typeof metadata.productCode === "string" ? metadata.productCode : undefined;

    return {
      id: record.VendorMgrServiceDetailId ?? record.vendorMgrServiceDetailId,
      name,
      description,
      productCode,
    };
  });
}

function SeedStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function SeedServiceDetailsPage() {
  const { activeCompany } = useCompany();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const sourceStats = useMemo(() => {
    const counts: Record<MajorType, number> = {
      Goods: 0,
      Services: 0,
      "Goods and Services": 0,
    };

    for (const item of rawSeedItems) {
      const majorType = normalizeMajorType(item.majorType);
      if (majorType) {
        counts[majorType] += 1;
      }
    }

    return {
      total: rawSeedItems.length,
      counts,
      matchesExpected:
        rawSeedItems.length === EXPECTED_TOTAL &&
        counts.Goods === EXPECTED_COUNTS.Goods &&
        counts.Services === EXPECTED_COUNTS.Services &&
        counts["Goods and Services"] === EXPECTED_COUNTS["Goods and Services"],
    };
  }, []);

  const handleSeed = async () => {
    if (!activeCompany?.id) {
      toast({
        title: "Active company required",
        description: "Select an active company before seeding demo items.",
        variant: "destructive",
      });
      return;
    }

    setIsSeeding(true);
    setResult(null);

    try {
      const [categories, existingItems] = await Promise.all([
        getAllCategories(),
        getAllExistingItems(),
      ]);

      const categoriesByName = new Map<string, CategoryRecord>();
      for (const category of categories) {
        categoriesByName.set(normalizeText(category.name), category);
      }

      const existingNames = new Set(existingItems.map((item) => normalizeText(item.name)).filter(Boolean));
      const existingCodes = new Set(existingItems.map((item) => normalizeText(item.productCode)).filter(Boolean));

      let created = 0;
      let skipped = 0;
      const failures: SeedFailure[] = [];
      const missingCategoryNames = new Set<string>();

      for (const item of rawSeedItems) {
        const productNameKey = normalizeText(item.productName);
        const productCodeKey = normalizeText(item.productCode);
        const categoryKey = normalizeText(item.productCategory);
        const category = categoriesByName.get(categoryKey);
        const majorType = normalizeMajorType(item.majorType);

        if (!majorType) {
          failures.push({
            productCode: item.productCode,
            productName: item.productName,
            reason: `Unsupported majorType: ${item.majorType ?? ""}`,
          });
          continue;
        }

        if (!category) {
          missingCategoryNames.add(String(item.productCategory ?? "").trim());
          failures.push({
            productCode: item.productCode,
            productName: item.productName,
            reason: `Category not found: ${item.productCategory ?? ""}`,
          });
          continue;
        }

        if ((productCodeKey && existingCodes.has(productCodeKey)) || existingNames.has(productNameKey)) {
          skipped += 1;
          continue;
        }

        const response = await serviceDetailsService.addServiceDetail({
          VendorMgrServiceDetailId: null,
          ServiceDetailName: item.productName,
          ServiceDetailDescription: buildSeedDescription(item, activeCompany.id, category, majorType),
        });

        if (response.success) {
          created += 1;
          existingNames.add(productNameKey);
          if (productCodeKey) {
            existingCodes.add(productCodeKey);
          }
        } else {
          failures.push({
            productCode: item.productCode,
            productName: item.productName,
            reason: response.message || "Failed to create item",
          });
        }
      }

      const nextResult: SeedResult = {
        total: rawSeedItems.length,
        created,
        skipped,
        failed: failures.length,
        missingCategories: Array.from(missingCategoryNames).filter(Boolean).sort((a, b) => a.localeCompare(b)),
        failures,
      };

      setResult(nextResult);

      toast({
        title: failures.length === 0 ? "Seed completed" : "Seed completed with issues",
        description:
          failures.length === 0
            ? `${created} items created, ${skipped} skipped.`
            : `${created} created, ${skipped} skipped, ${failures.length} failed.`,
        variant: failures.length === 0 ? "success" : "default",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to seed demo items.";
      toast({
        title: "Seed failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Seed Product Items</h3>
              <p className="mt-1 text-sm text-gray-600">
                Imports the demo file into Product Items by resolving the active company, matching product
                categories by name, skipping existing records, and creating items through the existing item API.
              </p>
            </div>
            <Button
              onClick={handleSeed}
              disabled={isSeeding || !activeCompany?.id}
              className="bg-vendor-600 text-white hover:bg-vendor-700"
            >
              {isSeeding ? "Seeding..." : "Seed Demo Items"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <SeedStatCard label="Active Company" value={activeCompany?.id || "Not selected"} />
            <SeedStatCard label="Source Items" value={sourceStats.total} />
            <SeedStatCard label="Goods" value={sourceStats.counts.Goods} />
            <SeedStatCard label="Services / Both" value={`${sourceStats.counts.Services} / ${sourceStats.counts["Goods and Services"]}`} />
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Source Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <div>Total expected: {EXPECTED_TOTAL}</div>
              <div>Goods expected: {EXPECTED_COUNTS.Goods}</div>
              <div>Services expected: {EXPECTED_COUNTS.Services}</div>
              <div>Goods and Services expected: {EXPECTED_COUNTS["Goods and Services"]}</div>
              <div className={sourceStats.matchesExpected ? "text-green-700" : "text-red-700"}>
                {sourceStats.matchesExpected
                  ? "Source file counts match the requested totals."
                  : "Source file counts do not match the requested totals."}
              </div>
            </CardContent>
          </Card>

          {result ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <SeedStatCard label="Created" value={result.created} />
                <SeedStatCard label="Skipped" value={result.skipped} />
                <SeedStatCard label="Failed" value={result.failed} />
                <SeedStatCard label="Missing Categories" value={result.missingCategories.length} />
              </div>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Missing Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.missingCategories.length === 0 ? (
                    <div className="text-sm text-gray-600">All source categories were resolved successfully.</div>
                  ) : (
                    <div className="space-y-1 text-sm text-gray-700">
                      {result.missingCategories.map((name) => (
                        <div key={name}>{name}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.failures.length === 0 ? (
                    <div className="text-sm text-gray-600">No failed records.</div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-700">
                      {result.failures.slice(0, 100).map((failure) => (
                        <div key={`${failure.productCode}-${failure.productName}`} className="rounded border border-gray-200 p-3">
                          <div className="font-medium">{failure.productCode} - {failure.productName}</div>
                          <div className="text-gray-600">{failure.reason}</div>
                        </div>
                      ))}
                      {result.failures.length > 100 ? (
                        <div className="text-gray-500">Showing first 100 failures of {result.failures.length}.</div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}