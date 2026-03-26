"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COMPANIES, getCompanyById } from "@/data/seedData/companies";

const STORAGE_KEY = "vms_active_company_id";

const CompanyContext = createContext({
  companies: /** @type {any[]} */ ([]),
  activeCompany: /** @type {any} */ (null),
  setActiveCompany: /** @type {(company: any) => void} */ (() => {}),
  setCompanies: /** @type {(companies: any[]) => void} */ (() => {}),
});

export function CompanyProvider({ children }) {
  // TODO: replace COMPANIES import with API call
  const [companies, setCompanies] = useState(COMPANIES);
  // TODO: hydrate initial company from auth-aware tenant bootstrap when backend is ready.
  const [activeCompany, setActiveCompanyState] = useState(null);

  useEffect(() => {
    // TODO: replace localStorage bootstrap with API-driven tenant context bootstrap.
    const storedCompanyId = localStorage.getItem(STORAGE_KEY);
    const initialCompany = storedCompanyId ? getCompanyById(storedCompanyId) : null;
    setActiveCompanyState(initialCompany || COMPANIES[0] || null);
  }, []);

  const setActiveCompany = (company) => {
    if (!company) return;
    setActiveCompanyState(company);
    localStorage.setItem(STORAGE_KEY, company.id);
  };

  const value = useMemo(
    () => ({
      companies,
      activeCompany,
      setActiveCompany,
      setCompanies,
    }),
    [companies, activeCompany]
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  return useContext(CompanyContext);
}

export function useCompanyContext() {
  // TODO: keep temporary alias for pages expecting useCompanyContext naming.
  return useCompany();
}

export default CompanyContext;
