"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ChevronDown, ChevronRight, HelpCircle, MailQuestionMark } from "lucide-react";
import { cn } from "@/utils/cn";
import { DESIGN_SYSTEM } from "@/utils/design-system";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQGroup {
  id: string;
  title: string;
  faqs: FAQ[];
}

const faqGroups: FAQGroup[] = [
  {
    id: "general",
    title: "General",
    faqs: [
      {
        question: "What is VMS 2.0?",
        answer:
          "VMS 2.0 is a Vendor Management System that streamlines procurement workflows including request management, quotations, purchase orders, invoices, and approvals.",
      },
      {
        question: "How do I log in to VMS 2.0?",
        answer:
          "Navigate to the login page and enter your registered email and password. Contact your administrator if you don't have credentials.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          'Click "Forgot Password" on the login page and follow the instructions sent to your registered email.',
      },
    ],
  },
  {
    id: "groups-subgroups",
    title: "Groups & Subgroups",
    faqs: [
      {
        question: "What is a Group in VMS?",
        answer:
          "A Group represents an organizational unit (e.g., department, studio) that can have users, budgets, and approval workflows assigned to it.",
      },
      {
        question: "What is the difference between Groups and Subgroups?",
        answer:
          "Groups are primary organizational units. Subgroups allow further categorization within groups for more granular management and reporting.",
      },
      {
        question: "How do I add users to a Group?",
        answer:
          "Navigate to Manage Groups → Edit the group → Add users from the available list.",
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    faqs: [
      {
        question: "What are Services and Service Details?",
        answer:
          'Services are broad categories of procurable items (e.g., "IT Equipment"). Service Details are specific items within a service (e.g., "Laptop", "Monitor").',
      },
      {
        question: "Is Max Amount mandatory when creating a Service?",
        answer:
          "No, Max Amount and Description are optional fields. Only Service Name is required.",
      },
      {
        question: "How do I map Services to Groups?",
        answer:
          "Go to Manage Services → Mapping Services to assign which services are available to specific groups.",
      },
    ],
  },
  {
    id: "requests-quotations",
    title: "Requests & Quotations",
    faqs: [
      {
        question: "How do I create a new request?",
        answer:
          "Navigate to Manage Request → Add New Request, fill in the required details, and submit for approval.",
      },
      {
        question: "What happens after I submit a request?",
        answer:
          "The request enters the approval workflow. Approvers assigned to your group will review and either approve or reject it.",
      },
      {
        question: "How do I add quotations to a request?",
        answer:
          'Open the request and use the "Add Quotation" option to attach vendor quotes with pricing details.',
      },
    ],
  },
  {
    id: "approvals-workflows",
    title: "Approvals & Workflows",
    faqs: [
      {
        question: "How do approval workflows work?",
        answer:
          "Workflows define the sequence of approvers. Requests move through each approval level until fully approved or rejected.",
      },
      {
        question: "Can I have multiple approvers at the same level?",
        answer:
          "Yes, workflows support multi-level approvers. You can configure sequential or parallel approvals based on your requirements.",
      },
      {
        question: "How do I check pending approvals?",
        answer:
          "Go to Approvals in the sidebar to view all items awaiting your approval.",
      },
    ],
  },
  {
    id: "po-invoices",
    title: "Purchase Orders & Invoices",
    faqs: [
      {
        question: "When is a Purchase Order (PO) generated?",
        answer:
          "A PO is created after a request with accepted quotation receives all required approvals.",
      },
      {
        question: "How do I submit an invoice?",
        answer:
          "Navigate to Invoices → Add New Invoice, link it to a PO, and upload the invoice details.",
      },
      {
        question: "How do I track invoice approval status?",
        answer:
          "Check Invoice Approvals in the sidebar to see the status of submitted invoices.",
      },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    faqs: [
      {
        question: "How do I collapse the sidebar?",
        answer:
          "Click the collapse button (panel icon) at the top of the sidebar. Click again to expand.",
      },
      {
        question: "How do I access submenu items when the sidebar is collapsed?",
        answer:
          "Hover over or click the parent menu icon to see a flyout menu with all child options.",
      },
    ],
  },
];

export default function FAQPage() {
  // Track which group is currently open - first group is open by default
  const [openGroupId, setOpenGroupId] = useState<string>(faqGroups[0]?.id || "");
  // Track which question is expanded within a group
  const [expandedQuestions, setExpandedQuestions] = useState<{
    [key: string]: number | null;
  }>({});

  const handleGroupClick = (groupId: string) => {
    // Toggle group - if clicking on already open group, close it; otherwise open it
    setOpenGroupId(openGroupId === groupId ? "" : groupId);
  };

  const handleQuestionClick = (groupId: string, questionIndex: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === questionIndex ? null : questionIndex,
    }));
  };

  return (
    <MainLayout title="FAQs">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-1 mb-2">           
            <h3 className="text-lg font-semibold">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-gray-600">
              Find answers to common questions about using VMS 2.0
            </p>
          </div>

        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - FAQ Groups */}
          <div className="flex-1 space-y-4">
            {faqGroups.map((group) => {
              const isGroupOpen = openGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="bg-white shadow-sm border border-gray-200 overflow-hidden mb-2"
                  style={{ borderRadius: DESIGN_SYSTEM.borderRadius.card }}
                >
                  {/* Group Header */}
                  <button
                    onClick={() => handleGroupClick(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-left transition-colors",
                      isGroupOpen
                        ? "bg-blue-50 border-b border-gray-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <h4
                      className={cn(
                        "text-sm font-semibold",
                        isGroupOpen ? "text-blue-700" : "text-gray-900"
                      )}
                    >
                      {group.title}
                    </h4>
                    <div
                      className={cn(
                        "flex items-center gap-2 transition-transform",
                        isGroupOpen ? "text-blue-700" : "text-gray-500"
                      )}
                    >
                      <span className="text-sm">
                        {group.faqs.length} question{group.faqs.length !== 1 ? "s" : ""}
                      </span>
                      {isGroupOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </button>

                  {/* Group Content - Questions */}
                  {isGroupOpen && (
                    <div className="divide-y divide-gray-100">
                      {group.faqs.map((faq, index) => {
                        const isExpanded = expandedQuestions[group.id] === index;

                        return (
                          <div key={index} className="px-6 pb-2">
                            {/* Question */}
                            <button
                              onClick={() => handleQuestionClick(group.id, index)}
                              className="w-full flex items-start justify-between py-4 pb-2 text-left hover:text-blue-600 transition-colors"
                            >
                              <span
                                className={cn(
                                  "text-sm font-normal pr-4",
                                  isExpanded ? "text-blue-600" : "text-gray-800"
                                )}
                              >
                                Q: {faq.question}
                              </span>
                              {isExpanded ? (
                                <ChevronDown
                                  className="h-4 w-4 flex-shrink-0 mt-1"
                                  style={{ color: "#0152ef" }}
                                />
                              ) : (
                                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 mt-1" />
                              )}
                            </button>

                            {/* Answer */}
                            {isExpanded && (
                              <div className="pb-0 pl-0 pr-0">
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md text-sm">
                                  <span className="font-medium text-gray-700">A: </span>
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column - Help Section */}
          <div className="lg:w-80 flex-shrink-0">
            
            <a href="mailto:support@example.com?subject=VMS - Support Request" target="_blank" rel="noopener noreferrer">
            <div className="lg:sticky lg:top-22 p-6 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <MailQuestionMark className="h-16 w-16 mb-5" style={{ color: "#0152ef" }} />
                <p className="text-gray-700 text-sm font-medium">
                  Can't find what you're looking for?
                </p>
                <p className="font-normal text-sm mt-2 mb-4">
                  Drop us an email, and our support team will get back to you.
                </p>
              </div>
            </div>
             </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
