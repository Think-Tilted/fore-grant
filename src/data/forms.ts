/**
 * Form field contracts — source: figma-handoff/data/forms.json
 * Payment options updated per handoff spec: Check / Cash / Venmo only.
 * No Credit Card, no Invoice Me.
 */

export const paymentOptions = ["Check", "Cash", "Venmo"] as const;
export type PaymentOption = (typeof paymentOptions)[number];

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "url" | "select" | "textarea" | "file";
  required: boolean;
  helper?: string;
  placeholder?: string;
  accept?: string[];
  optionsFrom?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FormSpec {
  route: string;
  prefill: string;
  sections: FormSection[];
  submitLabel: string;
}

export const sponsorForm: FormSpec = {
  route: "/registration/sponsor",
  prefill: "tier id from the Register Now button on the Registration page",
  sections: [
    {
      title: "Company Information",
      fields: [
        { name: "companyName", label: "Company name", type: "text", required: true, helper: "As it should appear on signage" },
        { name: "tierId", label: "Sponsor tier", type: "select", required: true, optionsFrom: "tiers", helper: "Carried in from your selection" },
        { name: "companyWebsite", label: "Company website", type: "url", required: false, helper: "example.com" },
        { name: "paymentType", label: "Payment type", type: "select", required: true, optionsFrom: "paymentOptions" },
      ],
    },
    {
      title: "Player Information",
      fields: [
        { name: "contactName", label: "Name", type: "text", required: true, helper: "First and last · team captain and primary contact" },
        { name: "contactPhone", label: "Phone number", type: "tel", required: true, helper: "For day-of contact only" },
        { name: "contactEmail", label: "Email address", type: "email", required: true, helper: "Confirmation and day-of details go here" },
        { name: "player2", label: "Player 2 name", type: "text", required: false, helper: "First and last" },
        { name: "player3", label: "Player 3 name", type: "text", required: false, helper: "First and last" },
        { name: "player4", label: "Player 4 name", type: "text", required: false, helper: "First and last" },
      ],
    },
    {
      title: "Special Requests or Comments",
      fields: [
        { name: "comments", label: "Anything we should know?", type: "textarea", required: false },
      ],
    },
  ],
  submitLabel: "Review your registration",
};

export const golferForm: FormSpec = {
  route: "/registration/foursome",
  prefill: "foursome-entry-group-package",
  sections: [
    {
      title: "Your Information",
      fields: [
        { name: "contactName", label: "Name", type: "text", required: true, helper: "First and last · team captain and primary contact" },
        { name: "contactPhone", label: "Phone number", type: "tel", required: true, helper: "For day-of contact only" },
        { name: "contactEmail", label: "Email address", type: "email", required: true, helper: "Confirmation and day-of details go here" },
        { name: "paymentType", label: "Payment type", type: "select", required: true, optionsFrom: "paymentOptions" },
      ],
    },
    {
      title: "Team Information",
      fields: [
        { name: "player2", label: "Player 2 name", type: "text", required: false, helper: "First and last" },
        { name: "player3", label: "Player 3 name", type: "text", required: false, helper: "First and last" },
        { name: "player4", label: "Player 4 name", type: "text", required: false, helper: "First and last" },
      ],
    },
    {
      title: "Special Requests or Comments",
      fields: [
        { name: "comments", label: "Anything we should know?", type: "textarea", required: false, helper: "Dietary needs, cart preferences, accommodations, or questions" },
      ],
    },
  ],
  submitLabel: "Review your registration",
};
