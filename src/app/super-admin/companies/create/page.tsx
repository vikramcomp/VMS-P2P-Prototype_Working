'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useCompanyContext } from '@/context/CompanyContext';
import { authService } from '@/services/auth-service';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Lock,
  Pencil,
  Sparkles,
} from 'lucide-react';

const INDUSTRY_OPTIONS = [
  'IT Services',
  'Manufacturing',
  'Healthcare',
  'Retail & E-Commerce',
  'Finance & Banking',
  'Construction & Real Estate',
  'Education',
  'Logistics & Supply Chain',
  'Media & Entertainment',
  'Other',
];

const COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'UAE',
  'Germany',
  'Other',
];

const REGION_STATE_OPTIONS: Record<string, string[]> = {
  India: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Telangana', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Other'],
  'United States': ['California', 'Texas', 'Florida', 'New York', 'New Jersey', 'Illinois', 'Pennsylvania', 'Other'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Other'],
  Canada: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Other'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Other'],
  Singapore: ['Central Region', 'North Region', 'North-East Region', 'East Region', 'West Region', 'Other'],
  UAE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Other'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'North Rhine-Westphalia', 'Other'],
  Other: ['Other'],
};

const TIMEZONE_OPTIONS = [
  'IST — Asia/Kolkata (UTC+5:30)',
  'EST — America/New_York (UTC-5)',
  'PST — America/Los_Angeles (UTC-8)',
  'CST — America/Chicago (UTC-6)',
  'GMT — Europe/London (UTC+0)',
  'CET — Europe/Berlin (UTC+1)',
  'SGT — Asia/Singapore (UTC+8)',
  'GST — Asia/Dubai (UTC+4)',
];

const EXISTING_ADMIN_EMAILS = ['admin@compunnel.in', 'admin@compunnel.com'];

const STEPS = ['Company Info', 'Address & Contact', 'Admin User', 'Review & Submit'];

const PASSWORD_WIDTH_CLASS: Record<number, string> = {
  1: 'w-1/4',
  2: 'w-2/4',
  3: 'w-3/4',
  4: 'w-full',
};

type FormDataState = {
  name: string;
  code: string;
  industry: string;
  website: string;
  gst: string;
  pan: string;
  tan: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  timezone: string;
  primaryContact: string;
  designation: string;
  primaryEmail: string;
  primaryPhone: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  sendWelcomeEmail: boolean;
  confirmPassword: string;
  termsAccepted: boolean;
  region: string;
};

// TODO: move date helpers into a shared date utility when onboarding APIs are integrated.
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

// TODO: replace local code suggestion with server-side unique-code generator endpoint.
function suggestCompanyCode(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join('');
  return initials.slice(0, 10);
}

// TODO: move password strength checks to shared auth-validation utility.
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: 'Weak', level: 1, barClass: 'bg-red-500' };
  if (score === 2) return { label: 'Fair', level: 2, barClass: 'bg-amber-500' };
  if (score === 3) return { label: 'Strong', level: 3, barClass: 'bg-green-500' };
  return { label: 'Very Strong', level: 4, barClass: 'bg-green-600' };
}

// TODO: switch random password generation to backend-issued temporary credential when API is available.
function generateStrongPassword() {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';
  const all = `${uppercase}${lowercase}${numbers}${symbols}`;

  const seed = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  while (seed.length < 12) {
    seed.push(all[Math.floor(Math.random() * all.length)]);
  }

  return seed.sort(() => Math.random() - 0.5).join('');
}

export default function CreateCompanyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { companies, setCompanies, setActiveCompany } = useCompanyContext();
  const [userRole, setUserRole] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [returnToReview, setReturnToReview] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<any>(null);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const successRedirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    code: '',
    industry: '',
    website: '',
    gst: '',
    pan: '',
    tan: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    timezone: 'IST — Asia/Kolkata (UTC+5:30)',
    primaryContact: '',
    designation: '',
    primaryEmail: '',
    primaryPhone: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    sendWelcomeEmail: true,
    confirmPassword: '',
    termsAccepted: false,
    region: 'India',
  });

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSuperAdmin = useMemo(() => userRole.toLowerCase().includes('admin'), [userRole]);

  useEffect(() => {
    const user = authService.getUser();
    setUserRole(user?.role || '');
  }, []);

  useEffect(() => {
    // TODO: replace timed redirect with API-confirmed onboarding completion navigation.
    if (showSuccessState && createdCompany) {
      successRedirectTimerRef.current = setTimeout(() => {
        router.push('/super-admin/companies');
      }, 3000);
    }

    return () => {
      if (successRedirectTimerRef.current) {
        clearTimeout(successRedirectTimerRef.current);
        successRedirectTimerRef.current = null;
      }
    };
  }, [showSuccessState, createdCompany, router]);

  // TODO: centralize field update logic with schema-based form library after API contracts stabilize.
  const updateField = (field: keyof FormDataState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // TODO: replace manual scroll targeting with reusable form error focus utility.
  const scrollToFirstError = (stepErrors: Record<string, string>) => {
    const firstKey = Object.keys(stepErrors)[0];
    const target = fieldRefs.current[firstKey];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // TODO: move validation rules to shared schema for frontend/backend parity.
  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};
    const existingCodes = companies.map((company: any) => company.code?.toUpperCase());
    const existingEmails = [...EXISTING_ADMIN_EMAILS, ...companies.map((company: any) => company.primaryEmail?.toLowerCase())];

    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 3) stepErrors.name = 'Company name must be at least 3 characters.';
      if (!formData.code.trim()) stepErrors.code = 'Company code is required.';
      if (formData.code.trim().length > 10) stepErrors.code = 'Company code cannot exceed 10 characters.';
      if (/\s/.test(formData.code)) stepErrors.code = 'Company code cannot contain spaces.';
      if (existingCodes.includes(formData.code.toUpperCase())) stepErrors.code = 'Company code must be unique.';
      if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) stepErrors.website = 'Please enter a valid URL.';
    }

    if (step === 2) {
      if (!formData.address.trim()) stepErrors.address = 'Registered address is required.';
      if (!formData.region.trim()) stepErrors.region = 'Region / Country is required.';
      if (!formData.state.trim()) stepErrors.state = 'State / Province is required.';
      if (!formData.city.trim()) stepErrors.city = 'City is required.';
      if (!formData.pinCode.trim()) stepErrors.pinCode = 'PIN / ZIP code is required.';
      if (!formData.timezone.trim()) stepErrors.timezone = 'Time zone is required.';
      if (!formData.primaryContact.trim()) stepErrors.primaryContact = 'Primary contact name is required.';
      if (!formData.primaryEmail.trim()) stepErrors.primaryEmail = 'Primary email is required.';
      if (formData.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryEmail)) stepErrors.primaryEmail = 'Enter a valid email address.';
      if (!formData.primaryPhone.trim()) stepErrors.primaryPhone = 'Primary phone is required.';
    }

    if (step === 3) {
      if (!formData.adminFirstName.trim()) stepErrors.adminFirstName = 'First name is required.';
      if (!formData.adminLastName.trim()) stepErrors.adminLastName = 'Last name is required.';
      if (!formData.adminEmail.trim()) stepErrors.adminEmail = 'Admin email is required.';
      if (formData.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) stepErrors.adminEmail = 'Enter a valid email address.';
      if (existingEmails.includes(formData.adminEmail.toLowerCase())) stepErrors.adminEmail = 'Admin email must be unique.';
      if (!formData.adminPassword) stepErrors.adminPassword = 'Temporary password is required.';
      if (formData.adminPassword.length < 8) stepErrors.adminPassword = 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(formData.adminPassword)) stepErrors.adminPassword = 'Password must include 1 uppercase character.';
      if (!/\d/.test(formData.adminPassword)) stepErrors.adminPassword = 'Password must include 1 number.';
      if (!/[^A-Za-z0-9]/.test(formData.adminPassword)) stepErrors.adminPassword = 'Password must include 1 special character.';
      if (!formData.confirmPassword) stepErrors.confirmPassword = 'Confirm password is required.';
      if (formData.confirmPassword !== formData.adminPassword) stepErrors.confirmPassword = 'Passwords must match.';
    }

    if (step === 4) {
      if (!formData.termsAccepted) stepErrors.termsAccepted = 'You must confirm before submitting.';
    }

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      scrollToFirstError(stepErrors);
      return false;
    }
    return true;
  };

  // TODO: keep next-step navigation local until onboarding workflow state is persisted server-side.
  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (returnToReview && currentStep < 4) {
      setCurrentStep(4);
      setReturnToReview(false);
      return;
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  // TODO: replace local review jump state with URL-based wizard state when deep-linking is required.
  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    setReturnToReview(true);
  };

  // TODO: replace local reset with server-provided onboarding draft reset endpoint.
  const handleResetAll = () => {
    if (successRedirectTimerRef.current) {
      clearTimeout(successRedirectTimerRef.current);
      successRedirectTimerRef.current = null;
    }

    setFormData({
      name: '',
      code: '',
      industry: '',
      website: '',
      gst: '',
      pan: '',
      tan: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      timezone: 'IST — Asia/Kolkata (UTC+5:30)',
      primaryContact: '',
      designation: '',
      primaryEmail: '',
      primaryPhone: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      sendWelcomeEmail: true,
      confirmPassword: '',
      termsAccepted: false,
      region: 'India',
    });
    setErrors({});
    setCurrentStep(1);
    setReturnToReview(false);
    setShowSuccessState(false);
    setCreatedCompany(null);
  };

  // TODO: replace local company creation with POST /api/companies and real success payload handling.
  const handleCreateCompany = () => {
    if (!validateStep(4)) return;

    const defaultStartDate = getTodayISO();
    const defaultEndDate = new Date(new Date(`${defaultStartDate}T00:00:00`).setFullYear(new Date(`${defaultStartDate}T00:00:00`).getFullYear() + 1)).toISOString().slice(0, 10);

    const newCompany = {
      id: `comp-${Date.now()}`,
      name: formData.name,
      shortName: formData.name,
      code: formData.code,
      type: 'Corporate',
      industry: formData.industry,
      country: formData.country,
      city: formData.city,
      state: formData.state,
      website: formData.website,
      gst: formData.gst,
      pan: formData.pan,
      tan: formData.tan,
      primaryContact: formData.primaryContact,
      primaryEmail: formData.primaryEmail,
      primaryPhone: formData.primaryPhone,
      subscriptionPlan: 'Basic',
      subscriptionStatus: 'active',
      setupStatus: 'pending',
      maxUsers: 10,
      maxPRsPerMonth: 100,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      isActive: true,
      isSuperAdmin: false,
      region: formData.region,
      accountType: 'corporate',
      onboardingStatus: 'pending',
      adminName: `${formData.adminFirstName} ${formData.adminLastName}`.trim(),
      adminEmail: formData.adminEmail,
      userCount: 1,
    };

    setCompanies([...(companies || []), newCompany]);
    setActiveCompany(newCompany);
    setCreatedCompany(newCompany);
    setShowSuccessState(true);

    toast({
      title: 'Company Created Successfully',
      description: `${newCompany.shortName} is now available in Company Accounts.`,
      variant: 'success',
    });
  };

  // TODO: switch password visibility timing to secure one-time reveal from backend when available.
  const handleGeneratePassword = () => {
    const password = generateStrongPassword();
    setFormData((prev) => ({ ...prev, adminPassword: password, confirmPassword: password }));
    setShowGeneratedPassword(true);
    setTimeout(() => setShowGeneratedPassword(false), 500);
  };

  if (!isSuperAdmin) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="mt-1 text-sm text-muted-foreground">Only Super Admin users can create tenant companies.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push('/super-admin/companies')}>
                  Back to Company Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const passwordStrength = getPasswordStrength(formData.adminPassword);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="create-company-page">
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Company Accounts" position="bottom">
              <Button variant="outline" size="icon" onClick={() => router.push('/super-admin/companies')} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">Add New Company</h3>
              <p className="text-muted-foreground text-xs">Onboard a new tenant to the platform</p>
            </div>
          </div>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="mb-6 grid gap-3 md:grid-cols-4">
                {STEPS.map((step, index) => {
                  const stepNumber = index + 1;
                  const isCurrent = currentStep === stepNumber;
                  const isCompleted = currentStep > stepNumber;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-[#0152ef] text-white ring-2 ring-[#0152ef]/20' : 'bg-gray-200 text-gray-600'}`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                      </div>
                      <span className={`text-xs ${isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                      {stepNumber < STEPS.length && (
                        <div className={`hidden h-0.5 flex-1 md:block ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {showSuccessState && createdCompany ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
                  <h4 className="mt-4 text-xl font-semibold text-foreground">Company Created Successfully!</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {createdCompany.name} has been successfully added.
                  </p>
                  <p className="text-sm text-muted-foreground">Code: {createdCompany.code}</p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button variant="outline" onClick={() => router.push(`/super-admin/companies/${createdCompany.id}`)}>
                      View Company
                    </Button>
                    <Button variant="secondary" onClick={handleResetAll}>
                      Add Another
                    </Button>
                    <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                  </div>
                </div>
              ) : (
                <>
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">Company Information</div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.name = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Company Name <span className="text-red-600">*</span></label>
                          <Input
                            value={formData.name}
                            onChange={(event) => {
                              const nextName = event.target.value;
                              const nextCode = formData.code ? formData.code : suggestCompanyCode(nextName);
                              setFormData((prev) => ({ ...prev, name: nextName, code: nextCode }));
                            }}
                            placeholder="e.g. Compunnel India Pvt. Ltd."
                            className={errors.name ? 'border-red-600 focus-visible:ring-red-600' : ''}
                          />
                          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div ref={(el) => { fieldRefs.current.code = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Company Code <span className="text-red-600">*</span></label>
                          <Input
                            value={formData.code}
                            onChange={(event) => updateField('code', event.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 10))}
                            placeholder="e.g. CI, CSG-ATH"
                            className={errors.code ? 'border-red-600 focus-visible:ring-red-600' : ''}
                          />
                          <p className="mt-1 text-xs text-gray-500">Auto-suggested from initials. Must be unique.</p>
                          {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Industry / Sector</label>
                          <select value={formData.industry} onChange={(event) => updateField('industry', event.target.value)} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef]">
                            <option value="">Select industry</option>
                            {INDUSTRY_OPTIONS.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div ref={(el) => { fieldRefs.current.website = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Company Website</label>
                          <Input value={formData.website} onChange={(event) => updateField('website', event.target.value)} type="url" placeholder="https://www.example.com" className={errors.website ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website}</p>}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">GST Number</label>
                          <Input value={formData.gst} onChange={(event) => updateField('gst', event.target.value)} placeholder="e.g. 09AABCC1234F1ZK" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">PAN Number</label>
                          <Input value={formData.pan} onChange={(event) => updateField('pan', event.target.value.toUpperCase())} placeholder="e.g. AABCC1234F" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">TAN Number</label>
                        <Input value={formData.tan} onChange={(event) => updateField('tan', event.target.value.toUpperCase())} placeholder="e.g. DELC12345D" />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">Address & Contact</div>

                      {/* ── Address ─────────────────────────────── */}
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Address</p>

                      <div ref={(el) => { fieldRefs.current.address = el; }}>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Registered Address <span className="text-red-600">*</span></label>
                        <Textarea rows={2} value={formData.address} onChange={(event) => updateField('address', event.target.value)} placeholder="Building name, street, area, landmark" className={errors.address ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.region = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Region / Country <span className="text-red-600">*</span></label>
                          <select
                            value={formData.region}
                            onChange={(event) => {
                              const nextRegion = event.target.value;
                              const nextStateOptions = REGION_STATE_OPTIONS[nextRegion] || ['Other'];
                              setFormData((prev) => ({ ...prev, region: nextRegion, state: nextStateOptions[0] }));
                              setErrors((prev) => ({ ...prev, region: '', state: '' }));
                            }}
                            className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${errors.region ? 'border-red-600' : ''}`}
                          >
                            <option value="">Select country</option>
                            {COUNTRY_OPTIONS.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                          {errors.region && <p className="mt-1 text-xs text-red-600">{errors.region}</p>}
                        </div>

                        <div ref={(el) => { fieldRefs.current.state = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">State / Province <span className="text-red-600">*</span></label>
                          <select
                            value={formData.state}
                            onChange={(event) => updateField('state', event.target.value)}
                            className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${errors.state ? 'border-red-600' : ''}`}
                          >
                            <option value="">Select state</option>
                            {(REGION_STATE_OPTIONS[formData.region] || []).map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                          {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.city = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">City <span className="text-red-600">*</span></label>
                          <Input value={formData.city} onChange={(event) => updateField('city', event.target.value)} placeholder="e.g. Noida" className={errors.city ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                        </div>
                        <div ref={(el) => { fieldRefs.current.pinCode = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">PIN / ZIP Code <span className="text-red-600">*</span></label>
                          <Input value={formData.pinCode} onChange={(event) => updateField('pinCode', event.target.value)} placeholder="e.g. 201301" className={errors.pinCode ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.pinCode && <p className="mt-1 text-xs text-red-600">{errors.pinCode}</p>}
                        </div>
                      </div>

                      <div ref={(el) => { fieldRefs.current.timezone = el; }}>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Time Zone <span className="text-red-600">*</span></label>
                        <select value={formData.timezone} onChange={(event) => updateField('timezone', event.target.value)} className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${errors.timezone ? 'border-red-600' : ''}`}>
                          <option value="">Select time zone</option>
                          {TIMEZONE_OPTIONS.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                        {errors.timezone && <p className="mt-1 text-xs text-red-600">{errors.timezone}</p>}
                      </div>

                      {/* ── Separator ────────────────────────────── */}
                      <hr className="border-t border-gray-200" />

                      {/* ── Contact Information ──────────────────── */}
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Contact Information</p>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.primaryContact = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Primary Contact Name <span className="text-red-600">*</span></label>
                          <Input value={formData.primaryContact} onChange={(event) => updateField('primaryContact', event.target.value)} placeholder="Full name" className={errors.primaryContact ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.primaryContact && <p className="mt-1 text-xs text-red-600">{errors.primaryContact}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Designation</label>
                          <Input value={formData.designation} onChange={(event) => updateField('designation', event.target.value)} placeholder="e.g. CTO, Admin Manager" />
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.primaryEmail = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Primary Email <span className="text-red-600">*</span></label>
                          <Input type="email" value={formData.primaryEmail} onChange={(event) => updateField('primaryEmail', event.target.value)} placeholder="admin@company.com" className={errors.primaryEmail ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.primaryEmail && <p className="mt-1 text-xs text-red-600">{errors.primaryEmail}</p>}
                        </div>
                        <div ref={(el) => { fieldRefs.current.primaryPhone = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Primary Phone <span className="text-red-600">*</span></label>
                          <Input type="tel" value={formData.primaryPhone} onChange={(event) => updateField('primaryPhone', event.target.value)} placeholder="+91-120-0000000" className={errors.primaryPhone ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.primaryPhone && <p className="mt-1 text-xs text-red-600">{errors.primaryPhone}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">Company Admin User</div>
                      <p className="text-xs text-muted-foreground">This creates the first administrator account for this company. They will have full access to manage this tenant.</p>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.adminFirstName = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">First Name <span className="text-red-600">*</span></label>
                          <Input value={formData.adminFirstName} onChange={(event) => updateField('adminFirstName', event.target.value)} className={errors.adminFirstName ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.adminFirstName && <p className="mt-1 text-xs text-red-600">{errors.adminFirstName}</p>}
                        </div>
                        <div ref={(el) => { fieldRefs.current.adminLastName = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Last Name <span className="text-red-600">*</span></label>
                          <Input value={formData.adminLastName} onChange={(event) => updateField('adminLastName', event.target.value)} className={errors.adminLastName ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.adminLastName && <p className="mt-1 text-xs text-red-600">{errors.adminLastName}</p>}
                        </div>
                      </div>

                      <div ref={(el) => { fieldRefs.current.adminEmail = el; }}>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Admin Email <span className="text-red-600">*</span></label>
                        <Input type="email" value={formData.adminEmail} onChange={(event) => updateField('adminEmail', event.target.value)} placeholder="admin@company.com" className={errors.adminEmail ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                        <p className="mt-1 text-xs text-gray-500">This will be the login email for the company administrator.</p>
                        {errors.adminEmail && <p className="mt-1 text-xs text-red-600">{errors.adminEmail}</p>}
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div ref={(el) => { fieldRefs.current.adminPassword = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Temporary Password <span className="text-red-600">*</span></label>
                          <Input type={showGeneratedPassword ? 'text' : 'password'} value={formData.adminPassword} onChange={(event) => updateField('adminPassword', event.target.value)} placeholder="Min 8 characters" className={errors.adminPassword ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          <div className="mt-2">
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div className={`h-2 rounded ${passwordStrength.barClass} ${PASSWORD_WIDTH_CLASS[passwordStrength.level]}`} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Strength: {passwordStrength.label}</p>
                          </div>
                          {errors.adminPassword && <p className="mt-1 text-xs text-red-600">{errors.adminPassword}</p>}
                        </div>
                        <div ref={(el) => { fieldRefs.current.confirmPassword = el; }}>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-600">*</span></label>
                          <Input type={showGeneratedPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} className={errors.confirmPassword ? 'border-red-600 focus-visible:ring-red-600' : ''} />
                          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                        </div>
                      </div>

                      <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword} className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Password
                      </Button>

                      <div>
                        <button
                          type="button"
                          onClick={() => updateField('sendWelcomeEmail', !formData.sendWelcomeEmail)}
                          className="flex items-center gap-3"
                        >
                          <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.sendWelcomeEmail ? 'bg-vendor-600' : 'bg-gray-400'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.sendWelcomeEmail ? 'translate-x-5' : 'translate-x-1'}`} />
                          </span>
                          <span className="text-sm font-medium text-gray-700">Send welcome email with login credentials</span>
                        </button>
                        <p className="mt-1 text-xs text-gray-500">An email with login details will be sent to the admin.</p>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">Review & Confirm</div>
                      <p className="text-xs text-muted-foreground">Please review all details before creating the company account.</p>

                      {[
                        {
                          title: 'Company Information',
                          step: 1,
                          lines: [
                            `Name: ${formData.name || '-'}`,
                            `Code: ${formData.code || '-'}`,
                            `Industry: ${formData.industry || '-'}`,
                            `GST: ${formData.gst || '-'}`,
                          ],
                        },
                        {
                          title: 'Address & Contact',
                          step: 2,
                          lines: [
                            `Address: ${formData.address || '-'}`,
                            `${formData.region || '-'} · ${formData.state || '-'}`,
                            `${formData.city || '-'} — ${formData.pinCode || '-'}`,
                            `Time Zone: ${formData.timezone || '-'}`,
                            `Contact: ${formData.primaryContact || '-'} · ${formData.primaryPhone || '-'}`,
                            `Email: ${formData.primaryEmail || '-'}`,
                          ],
                        },
                        {
                          title: 'Admin User',
                          step: 3,
                          lines: [
                            `Name: ${(formData.adminFirstName + ' ' + formData.adminLastName).trim() || '-'}`,
                            `Email: ${formData.adminEmail || '-'}`,
                            `Welcome email: ${formData.sendWelcomeEmail ? 'Yes' : 'No'}`,
                          ],
                        },
                      ].map((section) => (
                        <Card key={section.title} className="border border-gray-200 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleEditStep(section.step)} className="gap-1 text-xs">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Button>
                            </div>
                            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                              {section.lines.map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div ref={(el) => { fieldRefs.current.termsAccepted = el; }}>
                        <label className="flex items-start gap-2 text-sm">
                          <input type="checkbox" checked={formData.termsAccepted} onChange={(event) => updateField('termsAccepted', event.target.checked)} className="mt-1" />
                          <span>I confirm that the details above are accurate and authorise the creation of this company account.</span>
                        </label>
                        {errors.termsAccepted && <p className="mt-1 text-xs text-red-600">{errors.termsAccepted}</p>}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-end gap-3">
                    {currentStep === 1 ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => router.push('/super-admin/companies')}>Cancel</Button>
                        <Button
                          type="button"
                          variant="default"
                          size="default"
                          className="min-w-[220px] gap-1.5 border border-vendor-600 font-medium shadow-sm"
                          style={{ backgroundColor: '#0152ef', color: '#ffffff' }}
                          onClick={handleNext}
                        >
                          Next: Address & Contact
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </>
                    ) : currentStep < 4 ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
                        <Button
                          type="button"
                          variant="default"
                          size="default"
                          className="min-w-[220px] gap-1.5 border border-vendor-600 font-medium shadow-sm"
                          style={{ backgroundColor: '#0152ef', color: '#ffffff' }}
                          onClick={handleNext}
                        >
                          {currentStep === 2 ? 'Next: Admin User' : 'Next: Review'}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
                        <Button
                          type="button"
                          variant="default"
                          size="default"
                          className="min-w-[220px] gap-1.5 border border-vendor-600 font-medium shadow-sm"
                          style={{ backgroundColor: '#0152ef', color: '#ffffff' }}
                          onClick={handleCreateCompany}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Create Company Account
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
