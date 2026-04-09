# ARCHITECTURE REPORT

Project: VMS P2P Prototype (Next.js + React)
Date: 2026-03-21
Scope: Read-only architecture analysis of current codebase state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Complete recursive tree under src/ (every folder and file):

```text
[D] src
[D] src/app
[F] src/app/page.tsx
[F] src/app/layout.tsx
[F] src/app/favicon.ico
[F] src/app/globals.css
[D] src/app/__tests__
[F] src/app/__tests__/page.test.tsx
[F] src/app/__tests__/page-isTesting.test.tsx
[F] src/app/__tests__/layout.test.tsx
[D] src/app/api
[D] src/app/api/invoices
[F] src/app/api/invoices/route.ts
[D] src/app/api/invoices/__tests__
[F] src/app/api/invoices/__tests__/route.test.ts
[D] src/app/api/requests
[D] src/app/api/requests/editor-context
[F] src/app/api/requests/editor-context/route.ts
[D] src/app/api/requests/project-proposals
[F] src/app/api/requests/project-proposals/route.ts
[D] src/app/api/soap
[D] src/app/api/soap/project-proposals
[F] src/app/api/soap/project-proposals/route.ts
[D] src/app/api/soap/project-proposals/__tests__
[F] src/app/api/soap/project-proposals/__tests__/route.test.ts
[D] src/app/api-test
[F] src/app/api-test/page.tsx
[D] src/app/api-test/__tests__
[F] src/app/api-test/__tests__/page.test.tsx
[D] src/app/approvals
[F] src/app/approvals/page.tsx
[D] src/app/approvals/__tests__
[F] src/app/approvals/__tests__/page.test.tsx
[F] src/app/approvals/__tests__/page-isTesting.test.tsx
[D] src/app/auth-debug
[F] src/app/auth-debug/page.tsx
[D] src/app/auth-debug/__tests__
[F] src/app/auth-debug/__tests__/page.test.tsx
[F] src/app/auth-debug/__tests__/page-isTesting.test.tsx
[D] src/app/auth-test
[F] src/app/auth-test/page.tsx
[D] src/app/auth-test/__tests__
[F] src/app/auth-test/__tests__/page.test.tsx
[F] src/app/auth-test/__tests__/page-isTesting.test.tsx
[D] src/app/create-po
[F] src/app/create-po/page.tsx
[D] src/app/dashboard
[F] src/app/dashboard/page.tsx
[D] src/app/dashboard/__tests__
[F] src/app/dashboard/__tests__/page.test.tsx
[F] src/app/dashboard/__tests__/page-isTesting.test.tsx
[D] src/app/debug-groups
[F] src/app/debug-groups/page.tsx
[D] src/app/debug-groups/__tests__
[F] src/app/debug-groups/__tests__/page.test.tsx
[F] src/app/debug-groups/__tests__/page-isTesting.test.tsx
[D] src/app/edit-quotation
[F] src/app/edit-quotation/page.tsx
[D] src/app/faq
[F] src/app/faq/page.tsx
[D] src/app/groups
[F] src/app/groups/page.tsx
[D] src/app/groups/__tests__
[F] src/app/groups/__tests__/page.test.tsx
[F] src/app/groups/__tests__/page-isTesting.test.tsx
[D] src/app/groups/new
[F] src/app/groups/new/page.tsx
[D] src/app/groups/new/__tests__
[F] src/app/groups/new/__tests__/page.test.tsx
[F] src/app/groups/new/__tests__/page-isTesting.test.tsx
[D] src/app/groups/[id]
[D] src/app/groups/[id]/edit
[F] src/app/groups/[id]/edit/page.tsx
[D] src/app/groups/[id]/edit/__tests__
[F] src/app/groups/[id]/edit/__tests__/page.test.tsx
[F] src/app/groups/[id]/edit/__tests__/page-isTesting.test.tsx
[D] src/app/invoice-approvals
[F] src/app/invoice-approvals/page.tsx
[D] src/app/invoice-approvals/__tests__
[F] src/app/invoice-approvals/__tests__/page.test.tsx
[D] src/app/invoice-approvals/[id]
[F] src/app/invoice-approvals/[id]/page.tsx
[D] src/app/invoice-approvals/[id]/__tests__
[F] src/app/invoice-approvals/[id]/__tests__/page.test.tsx
[D] src/app/invoice-approvals/[id]/edit
[F] src/app/invoice-approvals/[id]/edit/page.tsx
[D] src/app/invoice-approvals/[id]/edit/__tests__
[F] src/app/invoice-approvals/[id]/edit/__tests__/page.test.tsx
[D] src/app/invoices
[F] src/app/invoices/page.tsx
[D] src/app/invoices/__tests__
[F] src/app/invoices/__tests__/page.test.tsx
[F] src/app/invoices/__tests__/page-isTesting.test.tsx
[D] src/app/invoices/[id]
[F] src/app/invoices/[id]/page.tsx
[D] src/app/invoices/[id]/__tests__
[F] src/app/invoices/[id]/__tests__/page.test.tsx
[D] src/app/invoices/[id]/edit
[F] src/app/invoices/[id]/edit/page.tsx
[D] src/app/invoices/[id]/edit/__tests__
[F] src/app/invoices/[id]/edit/__tests__/page.test.tsx
[D] src/app/invoices/[id]/view
[F] src/app/invoices/[id]/view/page.tsx
[D] src/app/invoices/[id]/view/__tests__
[F] src/app/invoices/[id]/view/__tests__/page.test.tsx
[D] src/app/login
[F] src/app/login/page.tsx
[D] src/app/login/__tests__
[F] src/app/login/__tests__/page.test.tsx
[F] src/app/login/__tests__/page-isTesting.test.tsx
[D] src/app/manage-payments
[F] src/app/manage-payments/page.tsx
[D] src/app/manage-payments/__tests__
[F] src/app/manage-payments/__tests__/page.test.tsx
[D] src/app/manage-quotations
[F] src/app/manage-quotations/page.tsx
[D] src/app/manage-quotations/__tests__
[F] src/app/manage-quotations/__tests__/page.test.tsx
[D] src/app/network-test
[F] src/app/network-test/page.tsx
[D] src/app/network-test/__tests__
[F] src/app/network-test/__tests__/page.test.tsx
[F] src/app/network-test/__tests__/page-isTesting.test.tsx
[D] src/app/outsourcing-report
[F] src/app/outsourcing-report/page.tsx
[D] src/app/outsourcing-report/__tests__
[F] src/app/outsourcing-report/__tests__/page.test.tsx
[D] src/app/pagination-test
[F] src/app/pagination-test/page.tsx
[D] src/app/pagination-test/__tests__
[F] src/app/pagination-test/__tests__/page.test.tsx
[F] src/app/pagination-test/__tests__/page-isTesting.test.tsx
[D] src/app/payment-cycle-report
[F] src/app/payment-cycle-report/page.tsx
[D] src/app/payment-cycle-report/__tests__
[F] src/app/payment-cycle-report/__tests__/page.test.tsx
[D] src/app/payments
[D] src/app/payments/add-payment
[F] src/app/payments/add-payment/page.tsx
[D] src/app/payments/view-payment
[F] src/app/payments/view-payment/page.tsx
[D] src/app/po-forecast-report
[F] src/app/po-forecast-report/page.tsx
[D] src/app/po-list
[F] src/app/po-list/page.tsx
[D] src/app/po-list/__tests__
[F] src/app/po-list/__tests__/page.test.tsx
[D] src/app/po-report
[F] src/app/po-report/page.tsx
[D] src/app/po-report/__tests__
[F] src/app/po-report/__tests__/page.test.tsx
[D] src/app/po-verification
[D] src/app/po-verification/[requestId]
[F] src/app/po-verification/[requestId]/page.tsx
[D] src/app/profile
[F] src/app/profile/page.tsx
[D] src/app/profile/__tests__
[F] src/app/profile/__tests__/page.test.tsx
[F] src/app/profile/__tests__/page-isTesting.test.tsx
[D] src/app/requests
[F] src/app/requests/page.tsx
[D] src/app/requests/__tests__
[F] src/app/requests/__tests__/page.test.tsx
[F] src/app/requests/__tests__/page-isTesting.test.tsx
[D] src/app/requests/new
[F] src/app/requests/new/page.tsx
[D] src/app/requests/new/__tests__
[F] src/app/requests/new/__tests__/page.test.tsx
[F] src/app/requests/new/__tests__/page-isTesting.test.tsx
[D] src/app/requests/view-edit
[D] src/app/requests/view-edit/[requestId]
[F] src/app/requests/view-edit/[requestId]/page.tsx
[D] src/app/requests/view-edit/[requestId]/__tests__
[F] src/app/requests/view-edit/[requestId]/__tests__/page.test.tsx
[D] src/app/requests/[id]
[F] src/app/requests/[id]/page.tsx
[D] src/app/requests/[id]/__tests__
[F] src/app/requests/[id]/__tests__/page.test.tsx
[F] src/app/requests/[id]/__tests__/page-isTesting.test.tsx
[D] src/app/requests/[id]/edit
[F] src/app/requests/[id]/edit/page.tsx
[D] src/app/requests/[id]/edit/__tests__
[F] src/app/requests/[id]/edit/__tests__/page.test.tsx
[F] src/app/requests/[id]/edit/__tests__/page-isTesting.test.tsx
[D] src/app/service-details
[F] src/app/service-details/page.tsx
[D] src/app/service-details/__tests__
[F] src/app/service-details/__tests__/page.test.tsx
[F] src/app/service-details/__tests__/page-isTesting.test.tsx
[D] src/app/service-details/new
[F] src/app/service-details/new/page.tsx
[D] src/app/service-details/new/__tests__
[F] src/app/service-details/new/__tests__/page.test.tsx
[F] src/app/service-details/new/__tests__/page-isTesting.test.tsx
[D] src/app/service-details/[id]
[D] src/app/service-details/[id]/edit
[F] src/app/service-details/[id]/edit/page.tsx
[D] src/app/service-details/[id]/edit/__tests__
[F] src/app/service-details/[id]/edit/__tests__/page.test.tsx
[F] src/app/service-details/[id]/edit/__tests__/page-isTesting.test.tsx
[D] src/app/service-details/mapping
[F] src/app/service-details/mapping/page.tsx
[D] src/app/service-details/mapping/__tests__
[F] src/app/service-details/mapping/__tests__/page.test.tsx
[F] src/app/service-details/mapping/__tests__/page-additional-coverage.test.tsx
[D] src/app/services
[F] src/app/services/page.tsx
[D] src/app/services/__tests__
[F] src/app/services/__tests__/page.test.tsx
[F] src/app/services/__tests__/page-additional.test.tsx
[D] src/app/services/new
[F] src/app/services/new/page.tsx
[D] src/app/services/new/__tests__
[F] src/app/services/new/__tests__/page.test.tsx
[F] src/app/services/new/__tests__/page-isTesting.test.tsx
[D] src/app/services/[id]
[D] src/app/services/[id]/edit
[F] src/app/services/[id]/edit/page.tsx
[D] src/app/services/mapping
[F] src/app/services/mapping/page.tsx
[D] src/app/services/mapping/__tests__
[F] src/app/services/mapping/__tests__/page.test.tsx
[F] src/app/services/mapping/__tests__/page-isTesting.test.tsx
[F] src/app/services/mapping/__tests__/page-additional.test.tsx
[D] src/app/subgroups
[F] src/app/subgroups/page.tsx
[D] src/app/subgroups/__tests__
[F] src/app/subgroups/__tests__/page.test.tsx
[D] src/app/subgroups/new
[F] src/app/subgroups/new/page.tsx
[D] src/app/subgroups/new/__tests__
[F] src/app/subgroups/new/__tests__/page.test.tsx
[F] src/app/subgroups/new/__tests__/page-isTesting.test.tsx
[D] src/app/subgroups/[id]
[D] src/app/subgroups/[id]/edit
[F] src/app/subgroups/[id]/edit/page.tsx
[D] src/app/subgroups/[id]/edit/__tests__
[F] src/app/subgroups/[id]/edit/__tests__/page.test.tsx
[F] src/app/subgroups/[id]/edit/__tests__/page-isTesting.test.tsx
[D] src/app/subgroups/mapping
[F] src/app/subgroups/mapping/page.tsx
[D] src/app/subgroups/mapping/__tests__
[F] src/app/subgroups/mapping/__tests__/page.test.tsx
[F] src/app/subgroups/mapping/__tests__/page-isTesting.test.tsx
[D] src/app/super-admin
[D] src/app/super-admin/companies
[F] src/app/super-admin/companies/page.tsx
[D] src/app/super-admin/companies/[id]
[F] src/app/super-admin/companies/[id]/page.tsx
[D] src/app/super-admin/companies/create
[F] src/app/super-admin/companies/create/page.tsx
[D] src/app/test-api
[F] src/app/test-api/page.tsx
[D] src/app/test-api/__tests__
[F] src/app/test-api/__tests__/page.test.tsx
[D] src/app/toast-demo
[F] src/app/toast-demo/page.tsx
[D] src/app/toast-demo/__tests__
[F] src/app/toast-demo/__tests__/page.test.tsx
[F] src/app/toast-demo/__tests__/page-isTesting.test.tsx
[D] src/app/users
[F] src/app/users/page.tsx
[D] src/app/users/__tests__
[F] src/app/users/__tests__/page.test.tsx
[D] src/app/users/new
[F] src/app/users/new/page.tsx
[D] src/app/users/new/__tests__
[F] src/app/users/new/__tests__/page.test.tsx
[F] src/app/users/new/__tests__/page-comprehensive.test.tsx
[F] src/app/users/new/__tests__/TEST_SUITE_SUMMARY.md
[D] src/app/users/[id]
[D] src/app/users/[id]/edit
[F] src/app/users/[id]/edit/page.tsx
[D] src/app/users/[id]/edit/__tests__
[F] src/app/users/[id]/edit/__tests__/page.test.tsx
[F] src/app/users/[id]/edit/__tests__/page-additional-coverage.test.tsx
[D] src/app/vendors
[F] src/app/vendors/page.tsx
[D] src/app/vendors/__tests__
[F] src/app/vendors/__tests__/page.test.tsx
[F] src/app/vendors/__tests__/page-isTesting.test.tsx
[D] src/app/vendors/new
[F] src/app/vendors/new/page.tsx
[D] src/app/vendors/new/__tests__
[F] src/app/vendors/new/__tests__/page.test.tsx
[D] src/app/vendors/[id]
[D] src/app/vendors/[id]/edit
[F] src/app/vendors/[id]/edit/page.tsx
[D] src/app/vendors/[id]/edit/__tests__
[F] src/app/vendors/[id]/edit/__tests__/page.test.tsx
[D] src/app/view-po
[F] src/app/view-po/page.tsx
[D] src/app/view-quotation
[F] src/app/view-quotation/page.tsx
[D] src/app/workflows
[F] src/app/workflows/page.tsx
[D] src/app/workflows/__tests__
[F] src/app/workflows/__tests__/page.test.tsx
[D] src/app/workflows/new
[F] src/app/workflows/new/page.tsx
[D] src/app/workflows/new/__tests__
[F] src/app/workflows/new/__tests__/page.test.tsx
[D] src/app/workflows/[id]
[F] src/app/workflows/[id]/page.tsx
[D] src/app/workflows/[id]/__tests__
[F] src/app/workflows/[id]/__tests__/page.test.tsx
[F] src/app/workflows/[id]/__tests__/page-additional-coverage.test.tsx
[D] src/components
[F] src/components/error-boundary.tsx
[D] src/components/__tests__
[F] src/components/__tests__/error-boundary.test.tsx
[D] src/components/approvals
[F] src/components/approvals/index.ts
[F] src/components/approvals/approvals-content.tsx
[F] src/components/approvals/view-edit-approval-form.tsx
[F] src/components/approvals/view-edit-invoice-approval.tsx
[F] src/components/approvals/invoice-approvals-content.tsx
[D] src/components/approvals/__tests__
[F] src/components/approvals/__tests__/approvals-content.test.tsx
[F] src/components/approvals/__tests__/approvals-content-isTesting.test.tsx
[F] src/components/approvals/__tests__/view-edit-approval-form.test.tsx
[F] src/components/approvals/__tests__/view-edit-invoice-approval.test.tsx
[F] src/components/approvals/__tests__/invoice-approvals-content.test.tsx
[D] src/components/auth
[F] src/components/auth/auth-guard.tsx
[F] src/components/auth/login-page.tsx
[F] src/components/auth/logout-button.tsx
[F] src/components/auth/protected-route.tsx
[F] src/components/auth/user-info.tsx
[D] src/components/auth/__tests__
[F] src/components/auth/__tests__/auth-guard.test.tsx
[F] src/components/auth/__tests__/auth-guard-isTesting.test.tsx
[F] src/components/auth/__tests__/login-page.test.tsx
[F] src/components/auth/__tests__/login-page-isTesting.test.tsx
[F] src/components/auth/__tests__/logout-button.test.tsx
[F] src/components/auth/__tests__/logout-button-isTesting.test.tsx
[F] src/components/auth/__tests__/user-info.test.tsx
[F] src/components/auth/__tests__/user-info-isTesting.test.tsx
[D] src/components/common
[F] src/components/common/welcome-popup.tsx
[D] src/components/common/__tests__
[F] src/components/common/__tests__/welcome-popup.test.tsx
[F] src/components/common/__tests__/welcome-popup-isTesting.test.tsx
[D] src/components/company
[F] src/components/company/company-readonly-field.tsx
[F] src/components/company/company-context-tag.tsx
[D] src/components/forms
[D] src/components/groups
[F] src/components/groups/groups-content.tsx
[D] src/components/groups/__tests__
[F] src/components/groups/__tests__/groups-content.test.tsx
[F] src/components/groups/__tests__/groups-content-isTesting.test.tsx
[D] src/components/import
[F] src/components/import/import-button.tsx
[F] src/components/import/import-modal.tsx
[D] src/components/invoices
[F] src/components/invoices/invoices-content.tsx
[D] src/components/invoices/__tests__
[F] src/components/invoices/__tests__/invoices-content.test.tsx
[D] src/components/layout
[F] src/components/layout/company-selector.tsx
[F] src/components/layout/header.tsx
[F] src/components/layout/main-layout.tsx
[F] src/components/layout/sidebar-context.tsx
[F] src/components/layout/sidebar.tsx
[F] src/components/layout/super-admin-layout.tsx
[F] src/components/layout/super-admin-sidebar.tsx
[D] src/components/layout/__tests__
[F] src/components/layout/__tests__/header.test.tsx
[F] src/components/layout/__tests__/main-layout.test.tsx
[D] src/components/payments
[F] src/components/payments/add-payment-content.tsx
[F] src/components/payments/manage-payments-content.tsx
[F] src/components/payments/view-payment-content.tsx
[D] src/components/payments/__tests__
[F] src/components/payments/__tests__/manage-payments-content.test.tsx
[D] src/components/providers
[F] src/components/providers/auth-provider.tsx
[F] src/components/providers/fetch-interceptor.tsx
[F] src/components/providers/studios-provider.tsx
[F] src/components/providers/toast-provider.tsx
[D] src/components/providers/__tests__
[F] src/components/providers/__tests__/auth-provider.test.tsx
[D] src/components/quotations
[F] src/components/quotations/index.ts
[F] src/components/quotations/quotations-content.tsx
[D] src/components/quotations/__tests__
[F] src/components/quotations/__tests__/quotations-content.test.tsx
[D] src/components/reports
[F] src/components/reports/outsourcing-report-content.tsx
[D] src/components/reports/__tests__
[F] src/components/reports/__tests__/outsourcing-report-content.test.tsx
[D] src/components/requests
[F] src/components/requests/add-new-request-content.tsx
[F] src/components/requests/advanced-request-filters.tsx
[F] src/components/requests/request-form.tsx
[F] src/components/requests/requests-content.tsx
[D] src/components/requests/__tests__
[F] src/components/requests/__tests__/add-new-request-content.test.tsx
[F] src/components/requests/__tests__/advanced-request-filters.test.tsx
[F] src/components/requests/__tests__/advanced-request-filters-additional.test.tsx
[F] src/components/requests/__tests__/request-form.test.tsx
[F] src/components/requests/__tests__/requests-content.test.tsx
[D] src/components/ui
[F] src/components/ui/button.tsx
[F] src/components/ui/card.tsx
[F] src/components/ui/confirmation-dialog.tsx
[F] src/components/ui/export-confirmation-dialog.tsx
[F] src/components/ui/input.tsx
[F] src/components/ui/invoice-details-dialog.tsx
[F] src/components/ui/invoice-request-details-dialog.tsx
[F] src/components/ui/label.tsx
[F] src/components/ui/multi-line-tooltip.tsx
[F] src/components/ui/pagination.tsx
[F] src/components/ui/printable-po-dialog.tsx
[F] src/components/ui/request-details-dialog.tsx
[F] src/components/ui/separator.tsx
[F] src/components/ui/table.tsx
[F] src/components/ui/textarea.tsx
[F] src/components/ui/toast.tsx
[F] src/components/ui/toaster.tsx
[F] src/components/ui/tooltip.tsx
[D] src/components/ui/__tests__
[F] src/components/ui/__tests__/button.test.tsx
[F] src/components/ui/__tests__/card.test.tsx
[F] src/components/ui/__tests__/confirmation-dialog.test.tsx
[F] src/components/ui/__tests__/input.test.tsx
[F] src/components/ui/__tests__/label.test.tsx
[F] src/components/ui/__tests__/multi-line-tooltip.test.tsx
[F] src/components/ui/__tests__/pagination.test.tsx
[F] src/components/ui/__tests__/separator.test.tsx
[F] src/components/ui/__tests__/table.test.tsx
[F] src/components/ui/__tests__/textarea.test.tsx
[F] src/components/ui/__tests__/tooltip.test.tsx
[D] src/components/vendors
[F] src/components/vendors/vendors-content.tsx
[D] src/components/vendors/__tests__
[F] src/components/vendors/__tests__/vendors-content.test.tsx
[F] src/components/vendors/__tests__/vendors-content-isTesting.test.tsx
[F] src/components/vendors/__tests__/vendors-content-additional.test.tsx
[D] src/config
[F] src/config/env-validation.ts
[F] src/config/item-import-config.ts
[F] src/config/vendor-import-config.ts
[D] src/config/__tests__
[F] src/config/__tests__/env-validation.test.ts
[D] src/context
[F] src/context/CompanyContext.jsx
[D] src/data
[D] src/data/seedData
[F] src/data/seedData/businessUnits.js
[F] src/data/seedData/companies.js
[D] src/hooks
[F] src/hooks/use-groups.ts
[F] src/hooks/use-request-dropdowns.ts
[F] src/hooks/use-studios.ts
[F] src/hooks/use-toast.ts
[F] src/hooks/use-users.ts
[D] src/hooks/__tests__
[F] src/hooks/__tests__/use-groups.test.ts
[F] src/hooks/__tests__/use-request-dropdowns.test.ts
[F] src/hooks/__tests__/use-studios.test.ts
[F] src/hooks/__tests__/use-toast.test.ts
[F] src/hooks/__tests__/use-users.test.ts
[D] src/mocks
[F] src/mocks/fetch-mock.ts
[D] src/mocks/__tests__
[F] src/mocks/__tests__/fetch-mock.test.ts
[D] src/services
[F] src/services/add-request-service.ts
[F] src/services/api-client.ts
[F] src/services/approvals-service.ts
[F] src/services/auth-service.ts
[F] src/services/enhanced-api-client.ts
[F] src/services/groups-service.ts
[F] src/services/invoices-service.ts
[F] src/services/panther-soap-service.ts
[F] src/services/purchase-orders-service.ts
[F] src/services/quotations-service.ts
[F] src/services/requests-service.ts
[F] src/services/service-details-service.ts
[F] src/services/services-mapping-service.ts
[F] src/services/services-service.ts
[F] src/services/studios-service.ts
[F] src/services/subgroups-mapping-service.ts
[F] src/services/subgroups-service.ts
[F] src/services/users-service.ts
[F] src/services/vendors-service.ts
[F] src/services/workflow-service.ts
[F] src/services/workflow-service.ts.bak
[D] src/services/__tests__
[F] src/services/__tests__/add-request-service.test.ts
[F] src/services/__tests__/api-client.test.ts
[F] src/services/__tests__/approvals-service.test.ts
[F] src/services/__tests__/auth-service.test.ts
[F] src/services/__tests__/enhanced-api-client.test.ts
[F] src/services/__tests__/groups-service.test.ts
[F] src/services/__tests__/invoices-service.test.ts
[F] src/services/__tests__/panther-soap-service.test.ts
[F] src/services/__tests__/quotations-service.test.ts
[F] src/services/__tests__/requests-service.test.ts
[F] src/services/__tests__/service-details-service.test.ts
[F] src/services/__tests__/services-mapping-service.test.ts
[F] src/services/__tests__/services-service.test.ts
[F] src/services/__tests__/studios-service.test.ts
[F] src/services/__tests__/subgroups-mapping-service.test.ts
[F] src/services/__tests__/subgroups-service.test.ts
[F] src/services/__tests__/users-service.test.ts
[F] src/services/__tests__/vendors-service.test.ts
[F] src/services/__tests__/workflow-service.test.ts
[D] src/types
[F] src/types/approvals.ts
[F] src/types/auth.ts
[F] src/types/common.ts
[F] src/types/companies.ts
[F] src/types/groups.ts
[F] src/types/index.ts
[F] src/types/invoices.ts
[F] src/types/jest-dom.d.ts
[F] src/types/quotations.ts
[F] src/types/requests.ts
[F] src/types/service-details.ts
[F] src/types/service-mappings.ts
[F] src/types/services.ts
[F] src/types/studios.ts
[F] src/types/subgroup-mappings.ts
[F] src/types/subgroups.ts
[F] src/types/users.ts
[F] src/types/vendors.ts
[D] src/types/__tests__
[F] src/types/__tests__/auth.test.ts
[F] src/types/__tests__/index.test.ts
[D] src/utils
[F] src/utils/cn.ts
[F] src/utils/csv-export.ts
[F] src/utils/design-system.ts
[F] src/utils/dropdown-validator.ts
[F] src/utils/error-handler.ts
[F] src/utils/images.ts
[F] src/utils/import-utils.ts
[F] src/utils/logger.ts
[F] src/utils/login-validator.ts
[F] src/utils/response-transformer.ts
[F] src/utils/transformation-tester.ts
[D] src/utils/__tests__
[F] src/utils/__tests__/cn.test.ts
[F] src/utils/__tests__/csv-export.test.ts
[F] src/utils/__tests__/design-system.test.ts
[F] src/utils/__tests__/dropdown-validator.test.ts
[F] src/utils/__tests__/error-handler.test.ts
[F] src/utils/__tests__/images.test.ts
[F] src/utils/__tests__/logger.test.ts
[F] src/utils/__tests__/login-validator.test.ts
[F] src/utils/__tests__/response-transformer.test.ts
[F] src/utils/__tests__/transformation-tester.test.ts
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — ROUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Path | Component | Page Title | Notes |
|------|-----------|------------|-------|
| / | src/app/page.tsx | Loading VMS... | Auth redirect page |
| /api-test | src/app/api-test/page.tsx | VMS Groups API Integration Test | Debug page |
| /approvals | src/app/approvals/page.tsx | N/A (layout title not set) | Uses ApprovalsContent |
| /auth-debug | src/app/auth-debug/page.tsx | VMS Auth API Test | Debug page |
| /auth-test | src/app/auth-test/page.tsx | Authentication Status Test | Debug page |
| /create-po | src/app/create-po/page.tsx | N/A | Large PO create form |
| /dashboard | src/app/dashboard/page.tsx | Dashboard | Primary dashboard |
| /debug-groups | src/app/debug-groups/page.tsx | Groups API Debug | Debug page |
| /edit-quotation | src/app/edit-quotation/page.tsx | N/A | Internal quotation flow |
| /faq | src/app/faq/page.tsx | FAQ | Static FAQ page |
| /groups | src/app/groups/page.tsx | N/A | Uses GroupsContent |
| /groups/new | src/app/groups/new/page.tsx | N/A | Create Group |
| /groups/[id]/edit | src/app/groups/[id]/edit/page.tsx | N/A | Edit Group |
| /invoice-approvals | src/app/invoice-approvals/page.tsx | N/A | Uses InvoiceApprovalsContent |
| /invoice-approvals/[id] | src/app/invoice-approvals/[id]/page.tsx | N/A | View approval |
| /invoice-approvals/[id]/edit | src/app/invoice-approvals/[id]/edit/page.tsx | N/A | Edit approval |
| /invoices | src/app/invoices/page.tsx | N/A | Uses InvoicesContent |
| /invoices/[id] | src/app/invoices/[id]/page.tsx | N/A | Invoice detail |
| /invoices/[id]/edit | src/app/invoices/[id]/edit/page.tsx | N/A | Invoice edit mode |
| /invoices/[id]/view | src/app/invoices/[id]/view/page.tsx | N/A | Invoice view mode |
| /login | src/app/login/page.tsx | N/A (delegated) | LoginPage component |
| /manage-payments | src/app/manage-payments/page.tsx | N/A | Uses ManagePaymentsContent |
| /manage-quotations | src/app/manage-quotations/page.tsx | N/A | Uses QuotationsContent |
| /network-test | src/app/network-test/page.tsx | Network API Test | Debug page |
| /outsourcing-report | src/app/outsourcing-report/page.tsx | N/A | Uses OutsourcingReportContent |
| /pagination-test | src/app/pagination-test/page.tsx | Pagination Test | Debug page |
| /payment-cycle-report | src/app/payment-cycle-report/page.tsx | N/A | Report page |
| /payments/add-payment | src/app/payments/add-payment/page.tsx | N/A | Add payment |
| /payments/view-payment | src/app/payments/view-payment/page.tsx | N/A | View payment |
| /po-forecast-report | src/app/po-forecast-report/page.tsx | N/A | Report page |
| /po-list | src/app/po-list/page.tsx | N/A | Purchase order list |
| /po-report | src/app/po-report/page.tsx | N/A | PO report |
| /po-verification/[requestId] | src/app/po-verification/[requestId]/page.tsx | N/A | Approval flow |
| /profile | src/app/profile/page.tsx | N/A | User profile |
| /requests | src/app/requests/page.tsx | N/A | Uses RequestsContent |
| /requests/new | src/app/requests/new/page.tsx | N/A | RequestForm add mode |
| /requests/[id] | src/app/requests/[id]/page.tsx | N/A | RequestForm view mode |
| /requests/[id]/edit | src/app/requests/[id]/edit/page.tsx | N/A | RequestForm edit mode |
| /requests/view-edit/[requestId] | src/app/requests/view-edit/[requestId]/page.tsx | N/A | Approval-request hybrid page |
| /service-details | src/app/service-details/page.tsx | N/A | Items master list |
| /service-details/new | src/app/service-details/new/page.tsx | N/A | Create item |
| /service-details/[id]/edit | src/app/service-details/[id]/edit/page.tsx | N/A | Edit item |
| /service-details/mapping | src/app/service-details/mapping/page.tsx | N/A | Mapping page |
| /services | src/app/services/page.tsx | N/A | Category master list |
| /services/new | src/app/services/new/page.tsx | N/A | Create category |
| /services/[id]/edit | src/app/services/[id]/edit/page.tsx | N/A | Edit category |
| /services/mapping | src/app/services/mapping/page.tsx | N/A | Category mapping |
| /subgroups | src/app/subgroups/page.tsx | N/A | Subgroup list |
| /subgroups/new | src/app/subgroups/new/page.tsx | N/A | Create subgroup |
| /subgroups/[id]/edit | src/app/subgroups/[id]/edit/page.tsx | N/A | Edit subgroup |
| /subgroups/mapping | src/app/subgroups/mapping/page.tsx | N/A | Subgroup mapping |
| /super-admin/companies | src/app/super-admin/companies/page.tsx | N/A | Company accounts |
| /super-admin/companies/[id] | src/app/super-admin/companies/[id]/page.tsx | Company Details | Company detail |
| /super-admin/companies/create | src/app/super-admin/companies/create/page.tsx | N/A | 5-step onboarding |
| /test-api | src/app/test-api/page.tsx | API Test - Service Detail ID 4 | Debug page |
| /toast-demo | src/app/toast-demo/page.tsx | Toast UI Demo | Component demo |
| /users | src/app/users/page.tsx | N/A | User list |
| /users/new | src/app/users/new/page.tsx | N/A | Create user |
| /users/[id]/edit | src/app/users/[id]/edit/page.tsx | N/A | Edit user |
| /vendors | src/app/vendors/page.tsx | N/A | Vendor list |
| /vendors/new | src/app/vendors/new/page.tsx | N/A | Create vendor |
| /vendors/[id]/edit | src/app/vendors/[id]/edit/page.tsx | N/A | Edit vendor |
| /view-po | src/app/view-po/page.tsx | N/A | PO detail/view |
| /view-quotation | src/app/view-quotation/page.tsx | N/A | Quotation detail/view |
| /workflows | src/app/workflows/page.tsx | N/A | Workflow list |
| /workflows/new | src/app/workflows/new/page.tsx | N/A | Create workflow |
| /workflows/[id] | src/app/workflows/[id]/page.tsx | N/A | Edit/view workflow |

API routes:

| Path | Component | Page Title | Notes |
|------|-----------|------------|-------|
| POST /api/invoices | src/app/api/invoices/route.ts | N/A | Proxy export endpoint |
| POST /api/requests/editor-context | src/app/api/requests/editor-context/route.ts | N/A | Context proxy |
| POST /api/requests/project-proposals | src/app/api/requests/project-proposals/route.ts | N/A | Proposals proxy |
| POST /api/soap/project-proposals | src/app/api/soap/project-proposals/route.ts | N/A | SOAP transform route |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — SIDEBAR NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Source: src/components/layout/sidebar.tsx

SECTION: Primary Navigation
  Dashboard -> /dashboard (LayoutDashboard)

SECTION: Groups
  Groups -> (parent) (UsersRound)
    ↳ View Groups -> /groups (UsersRound)
    ↳ Add New Group -> /groups/new (UserPlus)

SECTION: Subgroups
  Subgroups -> (parent) (FolderTree)
    ↳ View Subgroups -> /subgroups (Eye)
    ↳ Add New Subgroups -> /subgroups/new (Plus)
    ↳ Mapping Subgroups -> /subgroups/mapping (Share2)

SECTION: Category Master
  Category Master -> (parent) (Settings)
    ↳ Manage Categories -> /services (Eye)
    ↳ Create Category -> /services/new (Plus)
    ↳ Category Mapping -> /services/mapping (Share2)

SECTION: Items Master
  Items Master -> (parent) (ListTree)
    ↳ View Items -> /service-details (Eye)
    ↳ Add New Item -> /service-details/new (Plus)
    ↳ Mapping Items -> /service-details/mapping (Share2)

SECTION: Users
  Users -> (parent) (Users)
    ↳ View Users -> /users (Users)
    ↳ Add New User -> /users/new (UserPlus)

SECTION: Workflows
  Workflows -> (parent) (Workflow)
    ↳ View Workflows -> /workflows (Workflow)
    ↳ Add New Workflow -> /workflows/new (Plus)

SECTION: Vendor Master
  Vendor Master -> (parent) (Building2)
    ↳ Manage Vendors -> /vendors (Eye)
    ↳ Add New Vendor -> /vendors/new (Plus)

SECTION: Purchase Request
  Purchase Request -> (parent) (FileText)
    ↳ View Purchase Request -> /requests (Eye)
    ↳ Add Purchase Request -> /requests/new (Plus)

SECTION: Quotations
  Quotations -> /manage-quotations (FileSpreadsheet)

SECTION: Request Approvals
  Request Approvals -> /approvals (CheckSquare)

SECTION: Purchase Orders
  Purchase Orders -> (parent) (ClipboardList)
    ↳ View Purchase Orders -> /po-list (Eye)
    ↳ Add Purchase Order -> /po-list/new (Plus)

SECTION: Invoices
  Invoices -> /invoices (Receipt)

SECTION: Invoice Approvals
  Invoice Approvals -> /invoice-approvals (FileCheck)

SECTION: Payments
  Payments -> /manage-payments (DollarSign)

SECTION: PO Report
  PO Report -> /po-report (BarChart)

SECTION: Company Master (superAdminOnly)
  Company Master -> (parent) (ShieldCheck)
    ↳ Company Accounts -> /super-admin/companies (Building2)
    ↳ System Users -> /super-admin/system-users (Users)
    ↳ Global Settings -> /super-admin/global-settings (Settings)
    ↳ Audit Logs -> /super-admin/audit-logs (ScrollText)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — PAGES INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note: The app contains 67 page.tsx routes. For dynamically imported pages, title/subtitle are delegated to child content components. Where exact visible header text is not hardcoded in page.tsx, value is marked N/A.

1)
Page file:      src/app/page.tsx
Route:          /
Page title:     Loading VMS...
Page subtitle:  Checking authentication status
Data source:    authService local session/auth check
API calls:      None
State vars:     None
Key components: Loading spinner
Form fields:    None found
Submit button:  None found
Other buttons:  None found
Table columns:  None found
Notes:          Redirects to /dashboard or /login

2)
Page file:      src/app/login/page.tsx
Route:          /login
Page title:     N/A
Page subtitle:  N/A
Data source:    Delegated to LoginPage component
API calls:      Via auth-service in child component
State vars:     None in wrapper
Key components: LoginPage
Form fields:    In child component
Submit button:  In child component
Other buttons:  In child component
Table columns:  None found
Notes:          Suspense wrapper page

3)
Page file:      src/app/dashboard/page.tsx
Route:          /dashboard
Page title:     Dashboard
Page subtitle:  N/A
Data source:    Dashboard metrics + invoice summary + activities
API calls:      Dashboard/summary endpoint calls in component logic
State vars:     dashboardMetrics, dashboardMetricsLoading, invoiceSummary, invoiceSummaryLoading, recentActivities, recentActivitiesLoading
Key components: MainLayout, Card blocks
Form fields:    None found
Submit button:  None found
Other buttons:  Navigation links/cards
Table columns:  Activities columns
Notes:          Main landing data page

4)
Page file:      src/app/groups/page.tsx
Route:          /groups
Page title:     N/A
Page subtitle:  N/A
Data source:    Delegated to GroupsContent
API calls:      groups-service (in child)
State vars:     Wrapper only
Key components: MainLayout, GroupsContent
Form fields:    In child component
Submit button:  In child component
Other buttons:  In child component
Table columns:  In child component
Notes:          Dynamic import usage

5)
Page file:      src/app/groups/new/page.tsx
Route:          /groups/new
Page title:     N/A
Page subtitle:  N/A
Data source:    Form state + studios lookup + groups add API
API calls:      GET studios (hook), POST groups
State vars:     isSubmitting, formData
Key components: MainLayout, Card, Input, Tooltip
Form fields:    studioName (dropdown, required), name (text, required), description (textarea, optional), status (radio)
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Validation and trim normalization

6)
Page file:      src/app/groups/[id]/edit/page.tsx
Route:          /groups/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    group by id + update API
API calls:      GET /groups/{id}, PUT /groups/{id}
State vars:     formData, originalData, isSubmitting, isLoading
Key components: MainLayout, form card
Form fields:    studioId/studioName, name, description, status
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Unsaved-change detection

7)
Page file:      src/app/subgroups/page.tsx
Route:          /subgroups
Page title:     N/A
Page subtitle:  N/A
Data source:    subgroups-service + pagination
API calls:      list, delete, status change
State vars:     subgroups, allSubgroups, loading, searchTerm, pagination, deleteDialog
Key components: MainLayout, Table, Pagination
Form fields:    Search input
Submit button:  None found
Other buttons:  Add Subgroup, Edit, Delete, Change Status
Table columns:  Subgroup Name, Description, Status, Created Date, Actions
Notes:          Full CRUD list screen

8)
Page file:      src/app/subgroups/new/page.tsx
Route:          /subgroups/new
Page title:     N/A
Page subtitle:  N/A
Data source:    local form + add API
API calls:      POST subgroup
State vars:     isSubmitting, formData, touched, submitAttempted
Key components: MainLayout, Card, Input, Textarea
Form fields:    subgroupName (required), subgroupDescription (optional), status
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Form validation with touched state

9)
Page file:      src/app/subgroups/[id]/edit/page.tsx
Route:          /subgroups/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    subgroup by id + update API
API calls:      GET subgroup, PUT subgroup
State vars:     formData, originalData, isLoading, isSubmitting, error
Key components: MainLayout
Form fields:    subgroupName, subgroupDescription, status
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Change detection logic

10)
Page file:      src/app/subgroups/mapping/page.tsx
Route:          /subgroups/mapping
Page title:     N/A
Page subtitle:  N/A
Data source:    groups + mapped subgroups APIs
API calls:      groups lookup, mapped subgroups get/save
State vars:     groups, availableSubgroups, mappedSubgroups, selectedAvailable, selectedMapped, saving
Key components: MainLayout, dual-list UI
Form fields:    Group selector
Submit button:  Save
Other buttons:  Move ->, Move <-, Move All ->, Move All <-, Reset
Table columns:  None found
Notes:          Mapping transfer screen

11)
Page file:      src/app/services/page.tsx
Route:          /services
Page title:     N/A
Page subtitle:  N/A
Data source:    services-service list + import APIs
API calls:      list, delete, import
State vars:     services, loading, pagination, searchTerm, deleteDialog, importModal
Key components: MainLayout, ImportModal, Pagination
Form fields:    Search
Submit button:  None found
Other buttons:  Add Service, Import, Edit, Delete, Export Template, Download Template
Table columns:  Service Name, Description, Max Amount, Status, Created Date, Actions
Notes:          Category master list

12)
Page file:      src/app/services/new/page.tsx
Route:          /services/new
Page title:     N/A
Page subtitle:  N/A
Data source:    local form + create service API
API calls:      POST service
State vars:     isSubmitting, formData, touched, submitAttempted, majorType, categoryCode, isActive
Key components: MainLayout, Input, Textarea
Form fields:    serviceName (required), description, maxAmount
Submit button:  Save
Other buttons:  Cancel
Table columns:  None found
Notes:          Numeric validation on amount

13)
Page file:      src/app/services/[id]/edit/page.tsx
Route:          /services/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    service by id + update API
API calls:      GET service, PUT service
State vars:     service, formData, originalData, loading, isSubmitting, touched
Key components: MainLayout
Form fields:    serviceName, description, maxAmount
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Edit form with dirty-check

14)
Page file:      src/app/services/mapping/page.tsx
Route:          /services/mapping
Page title:     N/A
Page subtitle:  N/A
Data source:    groups + services mapping APIs
API calls:      groups lookup, mapped services get/save
State vars:     groups, selectedGroup, availableServices, mappedServices, selectedAvailable, selectedMapped
Key components: MainLayout, dual-list UI
Form fields:    Group selector
Submit button:  Save
Other buttons:  Move ->, Move <-, Move All ->, Move All <-, Reset
Table columns:  None found
Notes:          Mapping transfer screen

15)
Page file:      src/app/service-details/page.tsx
Route:          /service-details
Page title:     N/A
Page subtitle:  N/A
Data source:    service-details list APIs
API calls:      list, delete
State vars:     serviceDetails, loading, pagination, searchParams, deleteDialog
Key components: MainLayout, Pagination, Table
Form fields:    Search/filter
Submit button:  None found
Other buttons:  Add Service Detail, Edit, Delete
Table columns:  Service Detail Name, Description, Status, Created Date, Actions
Notes:          Items master list

16)
Page file:      src/app/service-details/new/page.tsx
Route:          /service-details/new
Page title:     N/A
Page subtitle:  N/A
Data source:    local form + create item API
API calls:      POST service detail
State vars:     isSubmitting, formData, majorType, isActive
Key components: MainLayout, Input, Textarea
Form fields:    serviceDetailName (required), serviceDetailDescription
Submit button:  Save
Other buttons:  Cancel
Table columns:  None found
Notes:          Create item screen

17)
Page file:      src/app/service-details/[id]/edit/page.tsx
Route:          /service-details/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    service-detail by id + update
API calls:      GET by id, PUT update
State vars:     originalData, formData, isLoading, isSubmitting
Key components: MainLayout
Form fields:    serviceDetailName, serviceDetailDescription
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Handles varied response shapes

18)
Page file:      src/app/service-details/mapping/page.tsx
Route:          /service-details/mapping
Page title:     N/A
Page subtitle:  N/A
Data source:    groups + service + service detail mapping
API calls:      groups lookup + mapping endpoints
State vars:     groups, selectedGroup, services, selectedService, availableServiceDetails, mappedServiceDetails
Key components: MainLayout, mapping UI
Form fields:    Group dropdown, Service dropdown
Submit button:  Save
Other buttons:  Move ->, Move <-, Move All ->, Move All <-, Reset
Table columns:  None found
Notes:          Three-level mapping flow

19)
Page file:      src/app/users/page.tsx
Route:          /users
Page title:     N/A
Page subtitle:  N/A
Data source:    useUsers hook + users service
API calls:      list, delete, bulk delete, status change, export
State vars:     selectedUsers, showActionMenu, pagination, filter, sortBy, sortDescending
Key components: MainLayout, Pagination
Form fields:    Search/filter
Submit button:  None found
Other buttons:  Add User, Edit, Delete, Change Status, Export, Bulk Delete
Table columns:  Name, Email, Group, Role, Status, Actions
Notes:          Multi-select batch operations

20)
Page file:      src/app/users/new/page.tsx
Route:          /users/new
Page title:     N/A
Page subtitle:  N/A
Data source:    groups/roles/modules APIs + create user
API calls:      groups lookup, roles lookup, modules by role, POST create
State vars:     isSubmitting, formData, groups, roles, modules, showModulesDropdown
Key components: MainLayout, form controls
Form fields:    firstName, middleName, lastName, userName, emailAddress, password, phoneNumber, groupName, role, assignModule
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Role-based module assignment

21)
Page file:      src/app/users/[id]/edit/page.tsx
Route:          /users/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    user by id + role/module lookups + update API
API calls:      GET user, role/module lookups, PUT update
State vars:     loading, formData, originalData, isSubmitting, groups, roles, modules
Key components: MainLayout
Form fields:    same as create user
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Edit profile and modules

22)
Page file:      src/app/vendors/page.tsx
Route:          /vendors
Page title:     N/A
Page subtitle:  N/A
Data source:    VendorsContent child
API calls:      via vendors service in child
State vars:     wrapper only
Key components: MainLayout, VendorsContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

23)
Page file:      src/app/vendors/new/page.tsx
Route:          /vendors/new
Page title:     N/A
Page subtitle:  N/A
Data source:    vendor lookups + add vendor API
API calls:      vendor types, countries, payment modes, service details, payment cycles, add vendor
State vars:     formData, countries, states, vendorTypes, paymentModes, paymentCycles, hasMSA, hasPaymentMapping, hasServiceMapping
Key components: MainLayout, file upload controls
Form fields:    extensive vendor profile fields (identity, contact, tax, agreement, mapping)
Submit button:  Save
Other buttons:  Cancel, Reset, Add MSA, Add Payment Mapping, Add Service Mapping
Table columns:  None found
Notes:          Multi-column complex onboarding form

24)
Page file:      src/app/vendors/[id]/edit/page.tsx
Route:          /vendors/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    vendor by id + update + lookups
API calls:      GET vendor, PUT vendor, lookup APIs
State vars:     create-page state plus hasUnsavedChanges, loading
Key components: MainLayout
Form fields:    same as create vendor
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Complex edit form

25)
Page file:      src/app/workflows/page.tsx
Route:          /workflows
Page title:     N/A
Page subtitle:  N/A
Data source:    workflow list APIs (new + old tabs)
API calls:      list, export, change status
State vars:     activeTab, selectedWorkflows, workflows, loading, currentPage, totalPages, pageSize, sortColumn, sortType
Key components: MainLayout, ConfirmationDialog
Form fields:    filter/sort controls
Submit button:  None found
Other buttons:  Add New Workflow, Export, Edit, Delete, Change Status, Bulk Delete
Table columns:  Workflow Name, Group, Service, Status, Created Date, Actions
Notes:          Tabbed workflow management

26)
Page file:      src/app/workflows/new/page.tsx
Route:          /workflows/new
Page title:     N/A
Page subtitle:  N/A
Data source:    lookups + create workflow API
API calls:      payment modes, purchasing groups, finance heads, services, approvers, create workflow
State vars:     formData, isLoading, error, paymentOptions, purchasingGroups, financeHeads, services, approvers
Key components: MainLayout
Form fields:    purchasingGroup, serviceName, paymentMode, vendorManager, conditionalWorkflow, approvers, financeHead, poGenerator, poVerification, poDispatch
Submit button:  Save
Other buttons:  Cancel, Next, Previous
Table columns:  None found
Notes:          Multi-step conditional workflow form

27)
Page file:      src/app/workflows/[id]/page.tsx
Route:          /workflows/[id]
Page title:     N/A
Page subtitle:  N/A
Data source:    workflow by id + update API
API calls:      getWorkflowById, updateWorkflow
State vars:     formData, originalFormData, isLoading, isEditMode, isFromOldWorkflow
Key components: MainLayout
Form fields:    same workflow fields
Submit button:  Save
Other buttons:  Cancel, Reset
Table columns:  None found
Notes:          Edit/view by workflow ID

28)
Page file:      src/app/requests/page.tsx
Route:          /requests
Page title:     N/A
Page subtitle:  N/A
Data source:    RequestsContent child
API calls:      in child via requests/approvals/quotations services
State vars:     wrapper only
Key components: MainLayout, RequestsContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

29)
Page file:      src/app/requests/new/page.tsx
Route:          /requests/new
Page title:     N/A
Page subtitle:  N/A
Data source:    RequestForm child (add mode)
API calls:      editor context + create request (in child)
State vars:     wrapper only
Key components: MainLayout, RequestForm
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Protected route wrapper

30)
Page file:      src/app/requests/[id]/page.tsx
Route:          /requests/[id]
Page title:     N/A
Page subtitle:  N/A
Data source:    request by id API
API calls:      getRequestById
State vars:     requestData, isLoading, error
Key components: MainLayout, RequestForm(view)
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Detail view mode

31)
Page file:      src/app/requests/[id]/edit/page.tsx
Route:          /requests/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    request by id API
API calls:      getRequestById
State vars:     requestData, isLoading, error
Key components: MainLayout, RequestForm(edit)
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Edit mode wrapper

32)
Page file:      src/app/requests/view-edit/[requestId]/page.tsx
Route:          /requests/view-edit/[requestId]
Page title:     N/A
Page subtitle:  N/A
Data source:    approvals context APIs
API calls:      getPoApproval OR getApprovalContext
State vars:     approvalData, isLoading, error, isPoApproval
Key components: MainLayout, ViewEditApprovalForm
Form fields:    approval context fields
Submit button:  context-dependent
Other buttons:  context-dependent
Table columns:  context-dependent
Notes:          Branches based on hasPoGenerated flag

33)
Page file:      src/app/manage-quotations/page.tsx
Route:          /manage-quotations
Page title:     N/A
Page subtitle:  N/A
Data source:    QuotationsContent child
API calls:      in child (quotations service)
State vars:     wrapper only
Key components: MainLayout, QuotationsContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import, SSR off

34)
Page file:      src/app/view-quotation/page.tsx
Route:          /view-quotation
Page title:     N/A
Page subtitle:  N/A
Data source:    quotation context APIs
API calls:      getBillingTypes, getQuotationData
State vars:     loadingData, showViewSpecificationModal, billingTypes, formData, specificationsTableData
Key components: MainLayout, table/modal
Form fields:    requestNumber, requestGroup, billingType, paymentMode, startDate, endDate
Submit button:  None found
Other buttons:  View Specification, Back, Download PO
Table columns:  Specification + dynamic vendor columns
Notes:          Read-only quotation display

35)
Page file:      src/app/edit-quotation/page.tsx
Route:          /edit-quotation
Page title:     N/A
Page subtitle:  N/A
Data source:    quotation APIs + vendor eligibility APIs
API calls:      getQuotationData, getEligibleVendors
State vars:     loading, loadingData, showSpecificationModal, formData, eligibleVendors, selectedVendors
Key components: MainLayout, modal
Form fields:    requestNumber, requestGroup, paymentMode, billingType, noOfQuotations + specification fields
Submit button:  Save
Other buttons:  Add Specification, Cancel
Table columns:  specification comparison columns
Notes:          Large monolithic page (~1800+ lines)

36)
Page file:      src/app/invoices/page.tsx
Route:          /invoices
Page title:     N/A
Page subtitle:  N/A
Data source:    InvoicesContent child
API calls:      in child via invoices service
State vars:     wrapper only
Key components: MainLayout, InvoicesContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

37)
Page file:      src/app/invoices/[id]/page.tsx
Route:          /invoices/[id]
Page title:     N/A
Page subtitle:  N/A
Data source:    invoice context + PDF endpoints
API calls:      getInvoiceContext, getInvoicePDF
State vars:     invoiceContext, loading, error, formData, isSubmitting, hasUnsavedChanges
Key components: MainLayout, card/form/dialog
Form fields:    transactionType, invoiceNo, invoice period, amount fields, tax fields, attachments, payment fields, comments
Submit button:  Save
Other buttons:  Cancel, View PDF, Download, Add Payment
Table columns:  payment detail rows (if visible)
Notes:          Complex invoice form flow

38)
Page file:      src/app/invoices/[id]/edit/page.tsx
Route:          /invoices/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    Delegates to shared [id] page
API calls:      same as invoice detail page
State vars:     delegated
Key components: delegated
Form fields:    delegated
Submit button:  delegated
Other buttons:  delegated
Table columns:  delegated
Notes:          Reuse wrapper

39)
Page file:      src/app/invoices/[id]/view/page.tsx
Route:          /invoices/[id]/view
Page title:     N/A
Page subtitle:  N/A
Data source:    Delegates to shared [id] page
API calls:      same as invoice detail page
State vars:     delegated
Key components: delegated
Form fields:    delegated
Submit button:  delegated
Other buttons:  delegated
Table columns:  delegated
Notes:          Reuse wrapper

40)
Page file:      src/app/approvals/page.tsx
Route:          /approvals
Page title:     N/A
Page subtitle:  N/A
Data source:    ApprovalsContent child
API calls:      in child via approvals service
State vars:     wrapper only
Key components: MainLayout, ApprovalsContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

41)
Page file:      src/app/invoice-approvals/page.tsx
Route:          /invoice-approvals
Page title:     N/A
Page subtitle:  N/A
Data source:    InvoiceApprovalsContent child
API calls:      in child
State vars:     wrapper only
Key components: MainLayout, InvoiceApprovalsContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

42)
Page file:      src/app/invoice-approvals/[id]/page.tsx
Route:          /invoice-approvals/[id]
Page title:     N/A
Page subtitle:  N/A
Data source:    ViewEditInvoiceApproval child
API calls:      in child
State vars:     wrapper only
Key components: MainLayout, ViewEditInvoiceApproval(mode=view)
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Approval detail wrapper

43)
Page file:      src/app/invoice-approvals/[id]/edit/page.tsx
Route:          /invoice-approvals/[id]/edit
Page title:     N/A
Page subtitle:  N/A
Data source:    ViewEditInvoiceApproval child
API calls:      in child
State vars:     wrapper only
Key components: MainLayout, ViewEditInvoiceApproval(mode=edit)
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Approval edit wrapper

44)
Page file:      src/app/po-list/page.tsx
Route:          /po-list
Page title:     N/A
Page subtitle:  N/A
Data source:    PO list APIs + lookup APIs
API calls:      groups lookup, subgroups mapping, PO listing
State vars:     showFilters, filters, groups, subgroups, services, poList, pagination
Key components: MainLayout, RequestDetailsDialog, InvoiceDetailsDialog, PrintablePODialog, Pagination
Form fields:    group/date/subgroup/service/status/project/vendor/number filters
Submit button:  None found
Other buttons:  Filter, View, Edit, Print, Export, Download
Table columns:  PO Number, Request Number, Status, Created Date, Amount, Vendor
Notes:          Multi-filter, multi-dialog page

45)
Page file:      src/app/create-po/page.tsx
Route:          /create-po
Page title:     N/A
Page subtitle:  N/A
Data source:    PO create APIs + query context
API calls:      purchase order create/fetch helpers
State vars:     loading, purchaseOrderId, poNumberFromAPI, items, editingItemId, showDeleteConfirmation, formData
Key components: MainLayout, ConfirmationDialog
Form fields:    request, quotation, PO metadata, payment terms, line-item fields
Submit button:  Save
Other buttons:  Cancel, Add Item, Edit Item, Delete Item, Reset
Table columns:  Quantity, Unit Cost, Description, Total Cost
Notes:          Very large page (~2500+ lines)

46)
Page file:      src/app/view-po/page.tsx
Route:          /view-po
Page title:     N/A
Page subtitle:  N/A
Data source:    PO by query id API
API calls:      getPurchaseOrder
State vars:     loading, isSettled, purchaseOrderId, items, editingItemId, formData
Key components: MainLayout
Form fields:    same as create-po fields
Submit button:  Save (edit mode)
Other buttons:  Back, Edit, Cancel
Table columns:  line item columns
Notes:          Read/edit PO detail screen

47)
Page file:      src/app/po-verification/[requestId]/page.tsx
Route:          /po-verification/[requestId]
Page title:     N/A
Page subtitle:  N/A
Data source:    approvals verification APIs
API calls:      getPOVerification
State vars:     loading, submitting, items, comments, showRejectDialog, showApproveDialog, formData
Key components: MainLayout
Form fields:    request/PO identifiers + vendor tax fields + comments
Submit button:  Approve
Other buttons:  Reject, Comment, Back
Table columns:  checklist/line item columns
Notes:          Approval checkpoint page

48)
Page file:      src/app/manage-payments/page.tsx
Route:          /manage-payments
Page title:     N/A
Page subtitle:  N/A
Data source:    ManagePaymentsContent child
API calls:      in child
State vars:     wrapper only
Key components: MainLayout, ManagePaymentsContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

49)
Page file:      src/app/payments/add-payment/page.tsx
Route:          /payments/add-payment
Page title:     N/A
Page subtitle:  N/A
Data source:    query params + child content
API calls:      in AddPaymentContent
State vars:     wrapper only
Key components: MainLayout, AddPaymentContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          invoiceId-driven page

50)
Page file:      src/app/payments/view-payment/page.tsx
Route:          /payments/view-payment
Page title:     N/A
Page subtitle:  N/A
Data source:    query params + child content
API calls:      in ViewPaymentContent
State vars:     wrapper only
Key components: MainLayout, ViewPaymentContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          invoiceId-driven page

51)
Page file:      src/app/po-report/page.tsx
Route:          /po-report
Page title:     N/A
Page subtitle:  N/A
Data source:    report APIs + filter lookups
API calls:      fetchFilterLookups, fetchPoReportData
State vars:     showFilters, poReportList, pagination, filters, loading
Key components: MainLayout, RequestDetailsDialog, Pagination
Form fields:    brigade/date/studio/services/status/vendor/po-request filters
Submit button:  None found
Other buttons:  Filter, Clear Filters, Download, View Details
Table columns:  Request Number, Request Desc, PO Number, PO Raised Date, Released Date, Brigade, Status, Total Amount
Notes:          Advanced report

52)
Page file:      src/app/po-forecast-report/page.tsx
Route:          /po-forecast-report
Page title:     N/A
Page subtitle:  N/A
Data source:    quotations/invoices services
API calls:      billing types + invoice/forecast calls
State vars:     loading, allData, isFiltersVisible, exporting, pagination, showDetailsModal
Key components: MainLayout
Form fields:    forecast filters
Submit button:  None found
Other buttons:  Filter toggle, Export
Table columns:  Vendor, Project Code, Client Name, Request No, Studio, Start Date, End Date, Year, Jan-Dec
Notes:          Forecast matrix report

53)
Page file:      src/app/payment-cycle-report/page.tsx
Route:          /payment-cycle-report
Page title:     N/A
Page subtitle:  N/A
Data source:    multiple lookup APIs + report data API
API calls:      fetchVendors, fetchPaymentCycles, fetchStudios, fetchPaymentCycleData
State vars:     showFilters, filters, appliedFilters, vendors, paymentCycles, studios, paymentCycleData, pagination, currentPage, pageSize, totalRecords
Key components: MainLayout, RequestDetailsDialog, ExportConfirmationDialog, Pagination
Form fields:    dateFrom, dateTo, paymentCycle, studio, vendorName, poOrRequestOrInvoice
Submit button:  Apply Filters
Other buttons:  Filter, Clear Filters, Export CSV, Export Excel, Request Details
Table columns:  Studio, Brigade, Payment Cycle Name, PO Date, PO Amount, Invoice Amount
Notes:          Export and drill-down support

54)
Page file:      src/app/outsourcing-report/page.tsx
Route:          /outsourcing-report
Page title:     N/A
Page subtitle:  N/A
Data source:    OutsourcingReportContent child
API calls:      in child
State vars:     wrapper only
Key components: MainLayout, OutsourcingReportContent
Form fields:    in child
Submit button:  in child
Other buttons:  in child
Table columns:  in child
Notes:          Dynamic import wrapper

55)
Page file:      src/app/profile/page.tsx
Route:          /profile
Page title:     N/A
Page subtitle:  N/A
Data source:    authService.getUser + changePassword API
API calls:      changePassword
State vars:     user, isChangingPassword, showPasswordConfirmation, personalForm, passwordForm
Key components: MainLayout, Card, ConfirmationDialog
Form fields:    personal display fields + currentPassword/newPassword/confirmPassword
Submit button:  Save Password
Other buttons:  Edit Password, Cancel
Table columns:  None found
Notes:          Profile + password update

56)
Page file:      src/app/super-admin/companies/page.tsx
Route:          /super-admin/companies
Page title:     N/A
Page subtitle:  N/A
Data source:    useCompany context + memoized filters
API calls:      None (local/context)
State vars:     searchTerm, showFilters, filters
Key components: MainLayout, badges, table UI
Form fields:    search + account/subscription/setup filters
Submit button:  None found
Other buttons:  View, Edit, Login as, Toggle Active, Create Company
Table columns:  Company Name, Code, Account Type, Primary Contact, Users, Subscription Status, Setup Status, Actions
Notes:          Super admin tenant listing

57)
Page file:      src/app/super-admin/companies/[id]/page.tsx
Route:          /super-admin/companies/[id]
Page title:     Company Details
Page subtitle:  N/A
Data source:    useCompanyContext lookup
API calls:      None
State vars:     None significant
Key components: MainLayout, Card
Form fields:    read-only display
Submit button:  None found
Other buttons:  Back
Table columns:  None found
Notes:          TODO to replace with backend GET

58)
Page file:      src/app/super-admin/companies/create/page.tsx
Route:          /super-admin/companies/create
Page title:     N/A
Page subtitle:  N/A
Data source:    local 5-step wizard + company context mutation
API calls:      None (local creation flow currently)
State vars:     currentStep, formData, passwordStrength, isSubmitting, errors, returnToReview, showSuccessState, createdCompany, etc.
Key components: MainLayout, Card, Input, Textarea, Button, Label
Form fields:    Company info, Address/contact, Subscription/access, Admin user, Review/terms (23+ fields)
Submit button:  Create Company
Other buttons:  Next, Previous, Reset, Generate Password, Edit (review), Add Another, View Company
Table columns:  None found
Notes:          5-step tenant onboarding with validations

59)
Page file:      src/app/auth-test/page.tsx
Route:          /auth-test
Page title:     Authentication Status Test
Page subtitle:  N/A
Data source:    authService local checks
API calls:      None
State vars:     None significant
Key components: Card
Form fields:    None found
Submit button:  None found
Other buttons:  Logout
Table columns:  None found
Notes:          Debug utility

60)
Page file:      src/app/auth-debug/page.tsx
Route:          /auth-debug
Page title:     VMS Auth API Test
Page subtitle:  N/A
Data source:    manual fetch to auth API
API calls:      POST /auth/login
State vars:     email, password, result, isLoading
Key components: Card, Input, Button
Form fields:    Email, Password
Submit button:  Test Login API
Other buttons:  None found
Table columns:  None found
Notes:          Debug utility

61)
Page file:      src/app/api-test/page.tsx
Route:          /api-test
Page title:     VMS Groups API Integration Test
Page subtitle:  N/A
Data source:    groupsService test call
API calls:      groupsService.getGroups
State vars:     status, groups, error, apiResponse
Key components: debug display blocks
Form fields:    None found
Submit button:  None found
Other buttons:  None found
Table columns:  None found
Notes:          Debug utility

62)
Page file:      src/app/network-test/page.tsx
Route:          /network-test
Page title:     Network API Test
Page subtitle:  N/A
Data source:    manual fetch call
API calls:      POST groups/getgroups
State vars:     networkInfo, testStatus
Key components: debug display
Form fields:    None found
Submit button:  None found
Other buttons:  Test API Call
Table columns:  None found
Notes:          Debug utility

63)
Page file:      src/app/pagination-test/page.tsx
Route:          /pagination-test
Page title:     Pagination Test
Page subtitle:  N/A
Data source:    useGroups hook
API calls:      groups list via hook
State vars:     hook-managed pagination state
Key components: Pagination
Form fields:    page size/current page
Submit button:  None found
Other buttons:  pagination controls
Table columns:  None found
Notes:          Component test harness

64)
Page file:      src/app/test-api/page.tsx
Route:          /test-api
Page title:     API Test - Service Detail ID 4
Page subtitle:  N/A
Data source:    service-details API for hardcoded id
API calls:      getServiceDetail(4)
State vars:     result, loading, error
Key components: debug display
Form fields:    None found
Submit button:  None found
Other buttons:  Test API
Table columns:  None found
Notes:          Debug utility

65)
Page file:      src/app/debug-groups/page.tsx
Route:          /debug-groups
Page title:     Groups API Debug
Page subtitle:  N/A
Data source:    groupsService test call
API calls:      groupsService.getGroups
State vars:     loading, response, error, callCount
Key components: debug panel
Form fields:    None found
Submit button:  None found
Other buttons:  Test API Call
Table columns:  None found
Notes:          Debug utility

66)
Page file:      src/app/toast-demo/page.tsx
Route:          /toast-demo
Page title:     Toast UI Demo
Page subtitle:  N/A
Data source:    useToast hook
API calls:      None
State vars:     None
Key components: Card, Button
Form fields:    None found
Submit button:  None found
Other buttons:  Show Success Toast, Show Error Toast, Show Warning Toast, Show Info Toast
Table columns:  None found
Notes:          UI demo page

67)
Page file:      src/app/faq/page.tsx
Route:          /faq
Page title:     FAQ
Page subtitle:  N/A
Data source:    static faq data array
API calls:      None
State vars:     expandedFaqId
Key components: accordion-like FAQ layout
Form fields:    None found
Submit button:  None found
Other buttons:  accordion toggles
Table columns:  None found
Notes:          Static content page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — SHARED COMPONENTS INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── FORM COMPONENTS ─────────────────────────

Component:   Button (src/components/ui/button.tsx)
Props:       variant, size, className, button HTML props
Usage:       Used across virtually all pages/forms/dialogs
Description: Reusable style-variant button component

Component:   Input (src/components/ui/input.tsx)
Props:       standard input HTML props
Usage:       Login/forms/create-edit screens across modules
Description: Reusable text/date/number input

Component:   Textarea (src/components/ui/textarea.tsx)
Props:       standard textarea HTML props
Usage:       Create/Edit forms
Description: Multi-line text field

Component:   Label (src/components/ui/label.tsx)
Props:       standard label HTML props
Usage:       Form labeling
Description: Accessible label wrapper

── LAYOUT COMPONENTS ───────────────────────

Component:   Card family (src/components/ui/card.tsx)
Props:       className + HTML div props on each subcomponent
Usage:       All major pages
Description: Container primitives (Card, CardHeader, CardTitle, CardContent)

Component:   MainLayout (src/components/layout/main-layout.tsx)
Props:       children, title?, breadcrumbs?
Usage:       Most protected pages
Description: Top-level app chrome with sidebar/header

Component:   SuperAdminLayout (src/components/layout/super-admin-layout.tsx)
Props:       children, title?
Usage:       Super admin pages
Description: Dedicated super-admin shell

Component:   Separator (src/components/ui/separator.tsx)
Props:       orientation, className
Usage:       UI structuring
Description: Horizontal/vertical divider

── DATA DISPLAY COMPONENTS ─────────────────

Component:   Table family (src/components/ui/table.tsx)
Props:       standard table element props
Usage:       List/index pages
Description: Table primitives for consistent grids

Component:   Pagination (src/components/ui/pagination.tsx)
Props:       pagination, onPageChange, onPageSizeChange, loading?
Usage:       Users/vendors/services/reports/PO/workflows etc.
Description: Generic paging controls

Component:   CompanyContextTag (src/components/company/company-context-tag.tsx)
Props:       display props
Usage:       Company-aware pages
Description: Shows active company context tag

── FEEDBACK COMPONENTS ─────────────────────

Component:   Toast primitives (src/components/ui/toast.tsx)
Props:       variant and radix toast props
Usage:       via Toaster + useToast hook
Description: Notification primitive

Component:   Toaster (src/components/ui/toaster.tsx)
Props:       none
Usage:       Root layout/provider
Description: Toast renderer outlet

Component:   ConfirmationDialog (src/components/ui/confirmation-dialog.tsx)
Props:       isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, variant, styling options
Usage:       Delete/status/approval confirmations
Description: Generic confirm modal

Component:   ExportConfirmationDialog (src/components/ui/export-confirmation-dialog.tsx)
Props:       isOpen, onConfirm, onCancel, recordCount?
Usage:       Export flows
Description: Export mode choice dialog

Component:   RequestDetailsDialog (src/components/ui/request-details-dialog.tsx)
Props:       isOpen, onClose, requestData
Usage:       Reports/PO flows
Description: Request detail modal

Component:   InvoiceDetailsDialog (src/components/ui/invoice-details-dialog.tsx)
Props:       isOpen, onClose, invoiceData
Usage:       Invoice/PO flows
Description: Invoice detail modal

Component:   InvoiceRequestDetailsDialog (src/components/ui/invoice-request-details-dialog.tsx)
Props:       isOpen, onClose, requestData
Usage:       Invoice approvals
Description: Combined invoice/request detail modal

Component:   PrintablePODialog (src/components/ui/printable-po-dialog.tsx)
Props:       isOpen, onClose, poData
Usage:       PO flows
Description: Print-friendly PO modal

Component:   ErrorBoundary (src/components/error-boundary.tsx)
Props:       children
Usage:       Root app layout
Description: Catches rendering exceptions

── NAVIGATION COMPONENTS ───────────────────

Component:   Sidebar (src/components/layout/sidebar.tsx)
Props:       className?
Usage:       MainLayout
Description: Module-based nav with nested dropdowns

Component:   Header (src/components/layout/header.tsx)
Props:       title?, breadcrumbs?, onFlowDiagramClick?
Usage:       MainLayout
Description: Top bar with user and company controls

Component:   CompanySelector (src/components/layout/company-selector.tsx)
Props:       variant, isSuperAdmin
Usage:       Header
Description: Company account switcher dropdown

Component:   SuperAdminSidebar (src/components/layout/super-admin-sidebar.tsx)
Props:       none
Usage:       SuperAdminLayout
Description: Admin navigation

Component:   Tooltip (src/components/ui/tooltip.tsx)
Props:       content, children, position?, className?, delay?
Usage:       Across UI actions
Description: Hover helper tooltip

Component:   MultiLineTooltip (src/components/ui/multi-line-tooltip.tsx)
Props:       content, children, position?, className?, maxWidth?
Usage:       Rich tooltip contexts
Description: Multi-line tooltip helper

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — CONTEXT & STATE MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context:      CompanyContext (src/context/CompanyContext.jsx)
Provides:     companies, activeCompany, setActiveCompany, setCompanies
Consumed by:  src/components/layout/company-selector.tsx, src/components/layout/sidebar.tsx, src/components/layout/main-layout.tsx, src/components/company/company-readonly-field.tsx, src/components/company/company-context-tag.tsx, src/app/groups/new/page.tsx, src/app/super-admin/companies/page.tsx, src/app/super-admin/companies/[id]/page.tsx, src/app/super-admin/companies/create/page.tsx, src/app/layout.tsx
Storage:      localStorage key: vms_active_company_id
Initial data: src/data/seedData/companies.js

Context:      SidebarContext (src/components/layout/sidebar-context.tsx)
Provides:     isCollapsed, toggleCollapse, setCollapsed
Consumed by:  src/components/layout/sidebar.tsx, src/components/layout/main-layout.tsx
Storage:      localStorage key: vms-sidebar-collapsed
Initial data: localStorage/default false

Context:      Toast state via useToast hook (src/hooks/use-toast.ts) + ToastProvider
Provides:     toast queue, dismiss/update operations
Consumed by:  many pages and components (notifications)
Storage:      None
Initial data: hook internal state

Provider:     FetchInterceptorProvider (src/components/providers/fetch-interceptor.tsx)
Provides:     global fetch interception with auth injection
Consumed by:  app root (wrapper)
Storage:      reads localStorage vms_auth_token
Initial data: browser runtime token

Provider:     AuthProvider (src/components/providers/auth-provider.tsx)
Provides:     auth wrapper composition
Consumed by:  app root
Storage:      via auth-service keys
Initial data: auth service

Also list:
- Redux store: None found
- Zustand store: None found
- React Query setup: None found

Additional auth/local storage keys observed:
- vms_auth_token
- vms_user_data
- vms_user_modules
- rememberedEmail
- rememberMe
- vendor_import_audit_log
- justLoggedIn (sessionStorage)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — DATA FILES & SEED DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File:         src/data/seedData/companies.js
Exports:      COMPANIES, getCompanyById, getActiveCompanies, getCompaniesByType
Data shape:   {
                id: string,
                name: string,
                shortName: string,
                code: string,
                type: string,
                industry: string,
                country: string,
                city: string,
                state: string,
                gst: string|null,
                pan: string|null,
                website: string,
                primaryContact: string,
                primaryEmail: string,
                primaryPhone: string,
                subscriptionPlan: string,
                subscriptionStatus: string,
                setupStatus: string,
                maxUsers: number,
                maxPRsPerMonth: number,
                startDate: string,
                endDate: string,
                isActive: boolean,
                isSuperAdmin: boolean
              }
Record count: 3
Used by:      src/context/CompanyContext.jsx, src/components/layout/company-selector.tsx, super-admin company pages

File:         src/data/seedData/businessUnits.js
Exports:      BUSINESS_UNITS, getBusinessUnitsByCompany, getBusinessUnitById, getActiveBusinessUnits, getLocalBusinessUnits, getLocalBusinessUnitsByCompany, addLocalBusinessUnit
Data shape:   {
                id: string,
                companyId: string,
                code: string,
                name: string,
                description: string,
                isActive: boolean
              }
Record count: 29
Used by:      groups/business-unit related flows and company-scoped group context (direct + helper-based use)

File:         src/config/item-import-config.ts
Exports:      item import config constants/helpers
Data shape:   config objects/arrays
Record count: N/A
Used by:      items import flows

File:         src/config/vendor-import-config.ts
Exports:      vendor import config constants/helpers
Data shape:   config objects/arrays
Record count: N/A
Used by:      vendor import flows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — API INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Module | Method | Endpoint | Called From | Purpose |
|--------|--------|----------|-------------|---------|
| Auth | POST | /auth/login | src/services/auth-service.ts | Login |
| Auth | POST | /auth/forgot-password | src/services/auth-service.ts | Password recovery |
| Auth | POST | /auth/change-password | src/services/auth-service.ts | Password change |
| Auth | POST | /auth/microsoft-sso | src/services/auth-service.ts | SSO login |
| Groups | POST | /groups/getgroups | src/services/groups-service.ts | List groups |
| Groups | GET | /groups/{id} | src/services/groups-service.ts | Group detail |
| Groups | POST | /groups | src/services/groups-service.ts | Create group |
| Groups | PUT | /groups/{id} | src/services/groups-service.ts | Update group |
| Groups | DELETE | /groups/{id} | src/services/groups-service.ts | Delete group |
| Groups | POST | /groups/delete-multiple | src/services/groups-service.ts | Bulk delete |
| Groups | POST | /groups/change-status | src/services/groups-service.ts | Status toggle |
| Groups | GET | /groups/lookup | src/services/groups-service.ts | Lookup |
| Groups | GET | /roles/lookup | src/services/groups-service.ts | Role lookup |
| Groups | GET | /modules/lookup | src/services/groups-service.ts | Module lookup |
| Users | POST | users/getUsers | src/services/users-service.ts | List users |
| Users | POST | users or users/create | src/services/users-service.ts | Create user |
| Users | PUT | users/{userId} | src/services/users-service.ts | Update user |
| Users | DELETE | users/{userId} | src/services/users-service.ts | Delete user |
| Users | POST | users/delete-multiple | src/services/users-service.ts | Bulk delete |
| Users | POST | users/change-status | src/services/users-service.ts | Status toggle |
| Users | POST | users/export | src/services/users-service.ts | Export |
| Vendors | POST | vendors/GetAllVendors | src/services/vendors-service.ts | List vendors |
| Vendors | POST | vendors | src/services/vendors-service.ts | Create vendor |
| Vendors | GET | vendors/{vendorId} | src/services/vendors-service.ts | Vendor detail |
| Vendors | PUT | vendors | src/services/vendors-service.ts | Update vendor |
| Vendors | POST | vendors/change-status | src/services/vendors-service.ts | Status toggle |
| Vendors | POST | vendors/export | src/services/vendors-service.ts | Export |
| Quotations | POST | quotations/list | src/services/quotations-service.ts | List quotations |
| Quotations | POST | requests/export | src/services/quotations-service.ts | Export |
| Quotations | POST | requests/change-status | src/services/quotations-service.ts | Status change |
| Quotations | GET | quotations/{requestId}/context | src/services/quotations-service.ts | Quotation context |
| Quotations | GET | quotations/payment-modes | src/services/quotations-service.ts | Lookup |
| Quotations | GET | quotations/billing-types | src/services/quotations-service.ts | Lookup |
| Quotations | GET | quotations/specification-masters | src/services/quotations-service.ts | Lookup |
| Quotations | POST | quotations/{requestId}/add-specifications | src/services/quotations-service.ts | Add specs |
| Approvals | POST | approvals/list | src/services/approvals-service.ts | List approvals |
| Approvals | POST | approvals/export | src/services/approvals-service.ts | Export |
| Approvals | POST | requests/change-status | src/services/approvals-service.ts | Status change |
| Approvals | GET | approvals/{requestId}/context | src/services/approvals-service.ts | Approval context |
| Approvals | GET | approvals/{requestId}/po-approval | src/services/approvals-service.ts | PO approval context |
| Invoices | GET | invoices | src/services/invoices-service.ts | List invoices |
| Invoices | GET | invoices/{invoiceId}/context | src/services/invoices-service.ts | Invoice context |
| Invoices | POST | invoices/export | src/services/invoices-service.ts | Export |
| Requests | GET | /requests/editor-context (+query params) | src/services/requests-service.ts | Editor context |
| Requests | POST | /requests | src/services/requests-service.ts | Save request |
| Requests | POST | /requests/export | src/services/requests-service.ts | Export |
| Purchase Orders | GET | purchase-orders/po-types | src/services/purchase-orders-service.ts | PO type lookup |
| Purchase Orders | GET | purchase-orders/{poId}/context | src/services/purchase-orders-service.ts | PO context |
| Purchase Orders | POST | purchase-orders | src/services/purchase-orders-service.ts | Create PO |
| Workflows | POST | workflows/list | src/services/workflow-service.ts | List workflows |
| Workflows | POST | workflows/export | src/services/workflow-service.ts | Export |
| Workflows | POST | workflows/change-status | src/services/workflow-service.ts | Status change |
| Subgroups | POST/GET/PUT/DELETE | /subgroups* | src/services/subgroups-service.ts | Subgroup CRUD |
| Services | POST/GET/PUT/DELETE | /services* | src/services/services-service.ts | Category CRUD |
| Service Details | POST/GET/PUT/DELETE | /service-details* | src/services/service-details-service.ts | Item CRUD |
| Studios | GET | /groups/getstudio | src/services/studios-service.ts | Studio lookup |
| SOAP | POST | external SOAP endpoints | src/services/panther-soap-service.ts | Panther integration |

Direct component fetch examples:
- src/components/approvals/approvals-content.tsx (POST approvals endpoint with filters)
- src/components/vendors/vendors-content.tsx (vendor types/filter criteria/payment cycles lookups)

Base URL / API config:
- Base URL source: process.env.NEXT_PUBLIC_API_BASE_URL
- Config file: src/services/api-client.ts
- Default URL observed: https://vmsqa-ver2.compunnel.com/api

Axios instance setup:
- apiClient singleton in src/services/api-client.ts
- request interceptor injects bearer token
- response interceptor applies response-transformer and handles auth errors

Auth headers / token handling:
- createAuthHeaders() helper in api-client
- token key: vms_auth_token (localStorage)
- fetch-interceptor provider also injects Authorization for global fetch

Error handling pattern:
- try/catch in services and components
- centralized error handling helper in src/utils/error-handler.ts
- fallbacks for inconsistent backend payloads (camelCase/PascalCase)
- 401 handling clears token and redirects to /login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — NAMING INCONSISTENCIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Location | Current Text | Issue |
|----------|-------------|-------|
| Sidebar | Category Master | Route is /services; naming mismatch between category/services terms |
| Sidebar | Items Master | Route is /service-details; naming mismatch between items/service-detail terms |
| Sidebar | Quotations | Route is /manage-quotations (manage prefix inconsistency) |
| Sidebar submenu | Add New Subgroups | Plural while parallel labels use singular form pattern |
| Sidebar submenu | View Purchase Request | Verb/object style differs from several other menu items |
| Multiple pages | No explicit MainLayout title | Inconsistent page title strategy (some set title, many do not) |
| Routes | /create-po and /po-list/new | Two creation-entry patterns for PO with naming overlap |
| Routes | /requests/[id] and /requests/view-edit/[requestId] | Overlapping semantics for request detail/edit |
| Routes | /invoices/[id] and /invoices/[id]/view | Duplicate view semantics |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10 — DEPENDENCIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── DEPENDENCIES (production) ────────────────
- @azure/msal-browser ^4.23.0 - Microsoft authentication (MSAL browser)
- @azure/msal-react ^3.0.19 - React bindings for MSAL
- @hookform/resolvers ^5.2.2 - Zod/validator resolvers for react-hook-form
- @radix-ui/react-alert-dialog ^1.1.15 - Alert dialog primitive
- @radix-ui/react-dialog ^1.1.15 - Dialog primitive
- @radix-ui/react-dropdown-menu ^2.1.16 - Dropdown primitive
- @radix-ui/react-select ^2.2.6 - Select primitive
- @radix-ui/react-toast ^1.2.15 - Toast primitive
- autoprefixer ^10.4.21 - CSS vendor prefixing
- axios ^1.12.2 - HTTP client
- class-variance-authority ^0.7.1 - Variant-based class composition
- clsx ^2.1.1 - Conditional class helper
- date-fns ^4.1.0 - Date formatting/utilities
- lucide-react ^0.544.0 - Icon library
- next 16.2.0 - Framework/router/runtime
- postcss ^8.5.6 - CSS build tooling
- react 19.2.4 - UI runtime
- react-dom 19.2.4 - DOM renderer
- react-hook-form ^7.63.0 - Form state/validation library
- tailwind-merge ^3.3.1 - Tailwind class conflict resolution
- xlsx ^0.18.5 - Excel import/export handling
- zod ^4.1.11 - Schema validation

── DEV DEPENDENCIES ─────────────────────────
- @eslint/eslintrc ^3 - ESLint config compatibility
- @tailwindcss/postcss ^4.1.13 - Tailwind/PostCSS integration
- @testing-library/jest-dom ^6.9.1 - DOM matchers for Jest
- @testing-library/react ^16.3.0 - React component testing
- @testing-library/user-event ^14.6.1 - User interaction simulation
- @types/jest ^30.0.0 - Jest TS typings
- @types/mocha ^10.0.10 - Mocha TS typings
- @types/node ^20 - Node TS typings
- @types/react ^19 - React TS typings
- @types/react-dom ^19 - React DOM TS typings
- eslint ^9 - Linting
- eslint-config-next 16.2.0 - Next.js lint rules
- identity-obj-proxy ^3.0.0 - CSS module testing mock
- jest ^30.2.0 - Unit test runner
- jest-environment-jsdom ^30.2.0 - Browser-like test env
- msw ^2.12.4 - API mocking in tests
- tailwindcss ^4 - CSS utility framework
- typescript ^5 - Type system/compiler
- undici ^7.16.0 - Fetch implementation for tests/runtime utilities
- whatwg-fetch ^3.6.20 - Fetch polyfill

Highlights:
- UI library approach: Custom UI layer built on Radix primitives + Tailwind + CVA
- Icon library: lucide-react
- HTTP client: axios + native fetch
- Router: Next.js App Router (no react-router-dom)
- State management: React Context + custom hooks
- Form libraries: react-hook-form + zod (and some custom local state forms)
- CSS approach: Tailwind CSS 4 + global CSS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11 — ISSUES & OBSERVATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── BUGS OR BROKEN THINGS ───────────────────
- Super-admin sidebar exposes routes without pages: /super-admin/system-users, /super-admin/global-settings, /super-admin/audit-logs
- businessUnits seed data contains orphaned companyId references (comp-006..comp-010) and duplicate id bu-023, while companies seed currently has only 3 companies
- Inconsistent response payload shapes force fallback parsing in services (camelCase/PascalCase)

── DUPLICATE CODE ───────────────────────────
- Similar list/filter/pagination boilerplate repeated across modules (users/vendors/services/workflows/reports)
- Similar export handlers repeated (PO report / payment cycle / others)
- Multiple route wrappers for same content mode (invoice/view/edit wrappers)
- Repeated confirm-dialog and detail-dialog patterns with near-identical control flow

── MISSING THINGS ───────────────────────────
- Sidebar items with no page implementation (super-admin children above)
- Several pages lack explicit layout title string, reducing consistency
- Many TODOs indicate pending backend integration for company/business-unit bootstrap

── INCONSISTENCIES ──────────────────────────
- Category vs Services, Items vs Service Details naming mismatch
- Add New Subgroups pluralization mismatch
- Multiple overlapping route conventions (create-po vs po-list/new)

── UNUSED FILES ─────────────────────────────
- src/services/workflow-service.ts.bak (backup file likely unused)
- Multiple debug/test pages appear non-production and are not linked from sidebar
- Empty folder: src/components/forms (no file content currently)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 12 — CURRENT HIERARCHY MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Current Module | Current Route | Intended Level | Intended Name |
|---------------|--------------|----------------|---------------|
| Groups | /groups | Level 1 | Verticals / Business Units Root |
| Subgroups | /subgroups | Level 2 | Business Units / Sub-Verticals |
| Category Master | /services | Level 3 | Departments / Service Categories |
| Items Master | /service-details | Level 4 | Items / Service Details |
| Services Mapping | /services/mapping | Mapping | Group-to-Category Mapping |
| Subgroups Mapping | /subgroups/mapping | Mapping | Group-to-Subgroup Mapping |
| Service Details Mapping | /service-details/mapping | Mapping | Group/Category-to-Item Mapping |
| Company Accounts | /super-admin/companies | Tenant | Company (Top Level Tenant) |
| Company Create | /super-admin/companies/create | Tenant Setup | Add New Company (Master Onboarding) |

Needs by change type:

Only renaming (no structural change):
- Category Master label <-> Services naming harmonization
- Items Master label <-> Service Details naming harmonization
- Submenu text normalization (Add New Subgroup singular form)

Field changes in existing forms:
- Keep subgroup/service/service-detail forms aligned with intended hierarchy terms
- Normalize common labels (View/Manage/Create naming pattern)

New fields to add:
- None mandatory from current architecture scan; depends on target taxonomy model

Fields to remove:
- None mandatory from current scan

New pages to create from scratch:
- /super-admin/system-users
- /super-admin/global-settings
- /super-admin/audit-logs

Additional hierarchy observation:
- Current tenant and business-unit seeding is partially migrated: COMPANIES now parent-focused while BUSINESS_UNITS still includes orphan references and duplicate IDs requiring data model cleanup in future iteration.

---
End of report.
