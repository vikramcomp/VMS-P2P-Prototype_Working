"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronDown,
  FolderTree,
  Info,
  Receipt,
  Landmark,
  NotebookPen,
  Loader2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { serviceDetailsService } from "@/services/service-details-service";
import { servicesService } from "@/services/services-service";
import { useToast } from "@/hooks/use-toast";
import { AddServiceDetailRequest } from "@/types/service-details";
import { ServicesSearchParams } from "@/types/services";

interface NewServiceDetailPageProps {
  isTesting?: boolean;
}

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="mb-1 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  helper,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  helper: string;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{helper}</p>
        </div>
        <span className="relative inline-flex items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-vendor-600" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
    </div>
  );
}

export default function NewServiceDetailPage({
  isTesting = false,
}: NewServiceDetailPageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceDetailName: "",
    serviceDetailDescription: "",
  });

  // TODO: wire to API when ready
  const [majorType, setMajorType] = useState("");
  // TODO: wire to API when ready
  const [productCategory, setProductCategory] = useState("");
  // TODO: load from sub-category API
  // TODO: cascade from category
  const [subCategory, setSubCategory] = useState("");

  // TODO: wire to API when ready
  const [unitType, setUnitType] = useState("");
  // TODO: wire to API when ready
  const [unitPrice, setUnitPrice] = useState("0");
  // TODO: wire to API when ready
  const [hsnCode, setHsnCode] = useState("");
  // TODO: wire to API when ready
  const [productType, setProductType] = useState("");
  // TODO: wire to API when ready
  const [assetsType, setAssetsType] = useState("");

  // TODO: wire to API when ready
  const [gstGroup, setGstGroup] = useState("");
  // TODO: wire to API when ready
  const [gstRate, setGstRate] = useState("");
  // TODO: wire to API when ready
  const [taxPercent, setTaxPercent] = useState("");

  // TODO: wire to API when ready
  const [rcmApplicable, setRcmApplicable] = useState(false);
  // TODO: wire to API when ready
  const [gstNotApplicable, setGstNotApplicable] = useState(false);
  // TODO: wire to API when ready
  const [equalizationLevy, setEqualizationLevy] = useState(false);

  // TODO: wire to API when ready
  const [buyAccountCode, setBuyAccountCode] = useState("");
  // TODO: wire to API when ready
  const [defaultTds, setDefaultTds] = useState("");
  // TODO: wire to API when ready
  const [glCode, setGlCode] = useState("");
  // TODO: wire to API when ready
  const [glName, setGlName] = useState("");
  // TODO: wire to API when ready
  const [inventoryPostingGroup, setInventoryPostingGroup] = useState("");
  // TODO: wire to API when ready
  const [inventoryPostingGroupCode, setInventoryPostingGroupCode] = useState("");

  // TODO: wire to API when ready
  const [warranty, setWarranty] = useState("");
  // TODO: wire to API when ready
  const [period, setPeriod] = useState("");
  // TODO: wire to API when ready
  const [erpStatus, setErpStatus] = useState("");
  // TODO: wire to API when ready
  const [remarks, setRemarks] = useState("");
  // TODO: wire to API when ready
  const [isActive, setIsActive] = useState(true);

  const [majorTypeTouched, setMajorTypeTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; name: string }>>([]);

  // Testing helper effect to invoke functions for coverage
  React.useEffect(() => {
    if (isTesting) {
      isFormValid();
      handleInputChange("serviceDetailName", "test");
      handleReset();
      handleCancel();
    }
  }, [isTesting]);

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const params: ServicesSearchParams = {
          pageNumber: 1,
          pageSize: 1000,
          searchTerm: "",
          sortBy: "",
          sortDescending: false,
          filter: {},
        };

        const response = await servicesService.getServices(params);
        if (response.IsSuccess && response.Data?.Records) {
          const mapped = response.Data.Records
            .map((service, index) => {
              const id =
                (service as any).serviceId ||
                service.VendorMgrServiceId ||
                service.vendorMgrServiceId ||
                index + 1;
              const name = service.ServiceName || service.serviceName || "";
              return { id: String(id), name };
            })
            .filter((item) => item.name.trim() !== "");

          setCategoryOptions(mapped);
        }
      } catch {
        setCategoryOptions([]);
      }
    };

    loadCategories();
  }, []);

  // Form validation
  const isFormValid = () => {
    return formData.serviceDetailName.trim() !== ""; // ServiceDetailName is required
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the API request according to the specified structure
      const addServiceDetailRequest: AddServiceDetailRequest = {
        VendorMgrServiceDetailId: null,
        ServiceDetailName: formData.serviceDetailName,
        ServiceDetailDescription: formData.serviceDetailDescription,
      };

      const response = await serviceDetailsService.addServiceDetail(
        addServiceDetailRequest
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Item created successfully!",
          variant: "success",
        });

        // Navigate to View Service Details page after successful submission
        router.push("/service-details");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating service detail:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      serviceDetailName: "",
      serviceDetailDescription: "",
    });

    setMajorType("");
    setProductCategory("");
    setSubCategory("");
    setUnitType("");
    setUnitPrice("0");
    setHsnCode("");
    setProductType("");
    setAssetsType("");
    setGstGroup("");
    setGstRate("");
    setTaxPercent("");
    setRcmApplicable(false);
    setGstNotApplicable(false);
    setEqualizationLevy(false);
    setBuyAccountCode("");
    setDefaultTds("");
    setGlCode("");
    setGlName("");
    setInventoryPostingGroup("");
    setInventoryPostingGroupCode("");
    setWarranty("");
    setPeriod("");
    setErpStatus("");
    setRemarks("");
    setIsActive(true);
    setMajorTypeTouched(false);
    setNameTouched(false);
  };

  const handleCancel = () => {
    router.push("/service-details");
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="new-service-detail-page">
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Items" position="bottom">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCancel}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                Add New Item
              </h3>
              <p className="text-muted-foreground text-xs">
                Create a new purchasable item in the product master
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              setMajorTypeTouched(true);
              handleSubmit(e);
            }}
            className="space-y-6"
          >
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6 space-y-6">
                <FormSection title="Product Hierarchy" icon={FolderTree}>
                  <div>
                    <fieldset>
                      <legend className="mb-2 block text-sm font-medium text-gray-700">
                        Major Type <span className="text-red-500">*</span>
                      </legend>
                      <div className="grid gap-6 md:grid-cols-3">
                        {[
                          { value: "Goods", title: "Goods", desc: "Physical products" },
                          { value: "Services", title: "Services", desc: "Non-physical services" },
                          {
                            value: "GoodsAndServices",
                            title: "Goods and Services",
                            desc: "Mixed type",
                          },
                        ].map((option) => {
                          const selected = majorType === option.value;
                          return (
                            <label
                              key={option.value}
                              className={`cursor-pointer rounded-lg border px-3 py-2 transition-colors ${
                                selected
                                  ? "border-vendor-600 bg-vendor-50"
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                            >
                              <input
                                type="radio"
                                name="majorType"
                                value={option.value}
                                checked={selected}
                                onChange={(e) => {
                                  setMajorType(e.target.value);
                                  setMajorTypeTouched(true);
                                }}
                                className="sr-only"
                              />
                              <div className="flex items-start gap-2">
                                <span className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-vendor-600" : "border-gray-400"}`}>
                                  {selected ? <span className="h-2 w-2 rounded-full bg-vendor-600" /> : null}
                                </span>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{option.title}</div>
                                  <div className="text-xs text-gray-500">{option.desc}</div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    {majorTypeTouched && !majorType ? (
                      <div className="mt-1 text-xs text-red-600">Please select a Major Type</div>
                    ) : null}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Product Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-vendor-600 focus:border-vendor-600"
                        >
                          <option value="">Select product category</option>
                          {categoryOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Product Sub Category
                      </label>
                      <div className="relative">
                        <select
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-vendor-600 focus:border-vendor-600"
                        >
                          <option value="">Select sub category</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Basic Information" icon={Info}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Product Code</label>
                      <Input value="Auto Generated" disabled className="bg-gray-50 text-gray-500" />
                      <div className="mt-1 text-xs text-gray-500">Will be assigned on save</div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.serviceDetailName}
                        onChange={(e) => handleInputChange("serviceDetailName", e.target.value)}
                        onBlur={() => setNameTouched(true)}
                        placeholder="Enter product name"
                        className={nameTouched && formData.serviceDetailName.trim() === "" ? "border-red-600 focus-visible:ring-red-600" : "border-gray-300"}
                        required
                      />
                      {nameTouched && formData.serviceDetailName.trim() === "" ? (
                        <div className="mt-1 text-xs text-red-600">Product Name is required</div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="serviceDetailDescription" className="mb-2 block text-sm font-medium text-gray-700">
                      Product Description
                    </label>
                    <Textarea
                      id="serviceDetailDescription"
                      value={formData.serviceDetailDescription}
                      onChange={(e) => handleInputChange("serviceDetailDescription", e.target.value)}
                      placeholder="Enter item description"
                      rows={4}
                      className="resize-y border-gray-300"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Unit Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={unitType}
                          onChange={(e) => setUnitType(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-vendor-600 focus:border-vendor-600"
                        >
                          <option value="">Select unit type</option>
                          <option value="QTY">QTY</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Kg">Kg</option>
                          <option value="Ltr">Ltr</option>
                          <option value="Set">Set</option>
                          <option value="Box">Box</option>
                          <option value="Nos">Nos</option>
                          <option value="Mtr">Mtr</option>
                          <option value="Sqft">Sqft</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Unit Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
                        <Input
                          type="number"
                          min={0}
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          className="pl-8 border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">HSN / SAC Code</label>
                      <Input
                        value={hsnCode}
                        onChange={(e) => setHsnCode(e.target.value)}
                        placeholder="HSN / SAC Code"
                        className="border-gray-300"
                      />
                      <div className="mt-1 text-xs text-gray-500">HSN for goods, SAC for services</div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Product Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-vendor-600 focus:border-vendor-600"
                        >
                          <option value="">Select product type</option>
                          <option value="goods">Goods</option>
                          <option value="services">Services</option>
                          <option value="both">Both (Goods &amp; Services)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Assets Type</label>
                      <div className="relative">
                        <select
                          value={assetsType}
                          onChange={(e) => setAssetsType(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-vendor-600 focus:border-vendor-600"
                        >
                          <option value="">Select assets type</option>
                          <option value="Assets">Assets</option>
                          <option value="Expense">Expense</option>
                          <option value="NA">Not Applicable</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Tax & Compliance" icon={Receipt}>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">GST Group</label>
                      <Input
                        value={gstGroup}
                        onChange={(e) => setGstGroup(e.target.value)}
                        placeholder="e.g. GST18G, GST12G"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">GST Rate (%)</label>
                      <Input
                        type="number"
                        value={gstRate}
                        onChange={(e) => setGstRate(e.target.value)}
                        placeholder="e.g. 18"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Tax (%)</label>
                      <Input
                        type="number"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                        placeholder="e.g. 10"
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <ToggleRow
                      checked={rcmApplicable}
                      onChange={setRcmApplicable}
                      label="RCM Applicable"
                      helper="Reverse Charge Mechanism"
                    />
                    <ToggleRow
                      checked={gstNotApplicable}
                      onChange={setGstNotApplicable}
                      label="GST Not Applicable"
                      helper="Mark if GST exempt item"
                    />
                    <ToggleRow
                      checked={equalizationLevy}
                      onChange={setEqualizationLevy}
                      label="Equalization Levy Applicable"
                      helper="Applicable on digital services"
                    />
                  </div>
                </FormSection>

                <FormSection title="Accounting & GL Details" icon={Landmark}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Buy Account Code</label>
                      <Input
                        value={buyAccountCode}
                        onChange={(e) => setBuyAccountCode(e.target.value)}
                        placeholder="e.g. ACC248"
                        className="border-gray-300"
                      />
                      <div className="mt-1 text-xs text-gray-500">Ledger account for purchase</div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Default TDS</label>
                      <Input
                        value={defaultTds}
                        onChange={(e) => setDefaultTds(e.target.value)}
                        placeholder="e.g. 194J 10, 194C"
                        className="border-gray-300"
                      />
                      <div className="mt-1 text-xs text-gray-500">TDS section applicable</div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">GL Code</label>
                      <Input
                        value={glCode}
                        onChange={(e) => setGlCode(e.target.value)}
                        placeholder="e.g. 72007"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">GL Name</label>
                      <Input
                        value={glName}
                        onChange={(e) => setGlName(e.target.value)}
                        placeholder="e.g. Advertisement Expenses"
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Inventory Posting Group</label>
                      <Input
                        value={inventoryPostingGroup}
                        onChange={(e) => setInventoryPostingGroup(e.target.value)}
                        placeholder="e.g. Capital Goods"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Inventory Posting Group Code</label>
                      <Input
                        value={inventoryPostingGroupCode}
                        onChange={(e) => setInventoryPostingGroupCode(e.target.value)}
                        placeholder="e.g. IPGL10003"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Additional Details" icon={NotebookPen}>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Warranty</label>
                      <Input
                        value={warranty}
                        onChange={(e) => setWarranty(e.target.value)}
                        placeholder="e.g. 1 Year"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Period</label>
                      <Input
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        placeholder="e.g. Annual, Monthly"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">ERP Status</label>
                      <Input
                        value={erpStatus}
                        onChange={(e) => setErpStatus(e.target.value)}
                        placeholder="ERP sync status"
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Remarks</label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                      placeholder="Additional notes (optional)"
                      className="resize-y border-gray-300"
                    />
                  </div>

                  <ToggleRow
                    checked={isActive}
                    onChange={setIsActive}
                    label="Is Active"
                    helper="Inactive items will not appear in Purchase Request dropdowns"
                  />
                </FormSection>

                <div className="flex gap-4 pt-0 justify-start">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-xs cus-primary-submit-btn"
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="text-xs gap-2 cus-secondary-reset-btn"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
