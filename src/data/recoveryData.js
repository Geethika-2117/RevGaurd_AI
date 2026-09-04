// RevGuard AI — Simple Plain-Language Data Layer
// Core concept: "RevGuard finds money that is at risk of being lost, explains why, and helps recover it."

export const leakageCategories = [
  {
    id: "failed_payments",
    name: "FAILED PAYMENTS",
    casesCount: 438,
    amount: "₹12.4L",
    amountNumeric: 1240000,
    description: "Card declines and bank processing errors."
  },
  {
    id: "unpaid_invoices",
    name: "UNPAID INVOICES",
    casesCount: 86,
    amount: "₹15.4L",
    amountNumeric: 1540000,
    description: "Overdue B2B invoices that haven't been paid."
  },
  {
    id: "abandoned_checkouts",
    name: "ABANDONED CHECKOUTS",
    casesCount: 217,
    amount: "₹8.7L",
    amountNumeric: 870000,
    description: "Customers who left before finishing their order."
  },
  {
    id: "failed_subscriptions",
    name: "FAILED SUBSCRIPTIONS",
    casesCount: 142,
    amount: "₹6.3L",
    amountNumeric: 630000,
    description: "Automatic renewal payments that didn't go through."
  }
];

export const aiFindings = [
  {
    id: "FIND-01",
    title: "Payment failures increased from 4% to 17%.",
    subtitle: "₹4.2L may be at risk.",
    buttonLabel: "INVESTIGATE",
    caseId: "REC-10483"
  },
  {
    id: "FIND-02",
    title: "28 invoices are overdue.",
    subtitle: "₹8.4L may be at risk.",
    buttonLabel: "VIEW CASES",
    caseId: "REC-10486"
  }
];

export const initialCases = [
  {
    id: "REC-10482",
    customer: "Rahul Enterprises",
    problem: "The customer's payment failed.",
    why: "The payment method appears to have expired.",
    category: "FAILED PAYMENTS",
    categoryId: "failed_payments",
    amountAtRisk: 48000,
    recoveryChance: 82,
    recommendedAction: "Ask the customer to update their payment method.",
    actionLabel: "RECOVER ₹48,000",
    status: "RECOVERING",
    whyAiChoseThis: [
      "Payment method expired",
      "Customer has paid successfully before",
      "High recovery probability",
      "Action is within policy"
    ]
  },
  {
    id: "REC-10483",
    customer: "Apex MegaRetail",
    problem: "Bank payment gateway timed out.",
    why: "Primary bank gateway had a temporary network delay.",
    category: "FAILED PAYMENTS",
    categoryId: "failed_payments",
    amountAtRisk: 500000,
    recoveryChance: 90,
    recommendedAction: "Retry payment automatically through backup gateway.",
    actionLabel: "RETRY PAYMENT",
    status: "FOUND",
    whyAiChoseThis: [
      "Temporary bank delay identified",
      "Backup gateway working normally",
      "High recovery probability (90%)",
      "Zero customer effort needed"
    ]
  },
  {
    id: "REC-10484",
    customer: "Nexus Retail Ltd",
    problem: "Customer left checkout before completing OTP.",
    why: "SMS verification took too long to arrive.",
    category: "ABANDONED CHECKOUTS",
    categoryId: "abandoned_checkouts",
    amountAtRisk: 12500,
    recoveryChance: 71,
    recommendedAction: "Send a 1-click WhatsApp payment link.",
    actionLabel: "SEND PAYMENT LINK",
    status: "RECOVERED",
    whyAiChoseThis: [
      "Customer spent time building their cart",
      "Customer has WhatsApp notifications enabled",
      "Fastest way for customer to finish purchase",
      "Link expires in 2 hours for security"
    ]
  },
  {
    id: "REC-10485",
    customer: "CloudScale India",
    problem: "Monthly subscription renewal failed.",
    why: "Credit card on file expired at month-end.",
    category: "FAILED SUBSCRIPTIONS",
    categoryId: "failed_subscriptions",
    amountAtRisk: 34200,
    recoveryChance: 79,
    recommendedAction: "Ask the customer to update their payment method.",
    actionLabel: "SEND CARD UPDATE LINK",
    status: "RECOVERING",
    whyAiChoseThis: [
      "Customer has been subscribed for 2 years",
      "Service remains active during grace period",
      "Card update links recover 79% of subscriptions",
      "Safe and simple for customer"
    ]
  },
  {
    id: "REC-10486",
    customer: "Tata B2B Distribution",
    problem: "Invoice is 18 days past due date.",
    why: "Customer waiting on month-end internal accounting approval.",
    category: "UNPAID INVOICES",
    categoryId: "unpaid_invoices",
    amountAtRisk: 300000,
    recoveryChance: 82,
    recommendedAction: "Offer a split 2-part payment plan.",
    actionLabel: "OFFER PAYMENT PLAN",
    status: "RECOVERING",
    whyAiChoseThis: [
      "Customer confirmed invoice is accurate",
      "Split payments are approved by customer",
      "Keeps good customer relationship intact",
      "Avoids legal or collections fees"
    ]
  },
  {
    id: "REC-10487",
    customer: "Mahindra Heavy Ind",
    problem: "Large invoice is 31 days overdue.",
    why: "Invoice exceeds ₹5,00,000 limit for automated actions.",
    category: "UNPAID INVOICES",
    categoryId: "unpaid_invoices",
    amountAtRisk: 850000,
    recoveryChance: 42,
    recommendedAction: "Ask human finance team to review.",
    actionLabel: "ESCALATE TO FINANCE",
    status: "ESCALATED",
    whyAiChoseThis: [
      "Amount is over ₹5,00,000 limit",
      "AI is not allowed to act automatically",
      "Customer requested custom payment schedule",
      "Human relationship manager required"
    ]
  },
  {
    id: "REC-10488",
    customer: "QuickCommerce Hub",
    problem: "Cart abandoned during checkout.",
    why: "Shipping address verification had an error.",
    category: "ABANDONED CHECKOUTS",
    categoryId: "abandoned_checkouts",
    amountAtRisk: 95000,
    recoveryChance: 74,
    recommendedAction: "Send pre-filled checkout link.",
    actionLabel: "SEND LINK",
    status: "FOUND",
    whyAiChoseThis: [
      "Customer is a verified repeat buyer",
      "Cart contents are saved safely",
      "Quickest way to help customer finish",
      "Approved under contact rules"
    ]
  },
  {
    id: "REC-10489",
    customer: "Horizon Health",
    problem: "Card payment failed at checkout.",
    why: "Bank network connection timed out.",
    category: "FAILED PAYMENTS",
    categoryId: "failed_payments",
    amountAtRisk: 18500,
    recoveryChance: 76,
    recommendedAction: "Retry payment silently through secondary route.",
    actionLabel: "RETRY PAYMENT",
    status: "FOUND",
    whyAiChoseThis: [
      "First retry attempt",
      "Network timeout is temporary",
      "Zero hassle for the customer",
      "Standard safe retry rule"
    ]
  }
];

export const initialRecentRecoveries = [
  {
    id: "REC-10482",
    amount: "₹48,000",
    customer: "Rahul Enterprises",
    type: "Failed Payment",
    time: "Today, 11:02 AM"
  },
  {
    id: "REC-10481",
    amount: "₹1,25,000",
    customer: "ABC Corporation",
    type: "Overdue Invoice",
    time: "Today, 09:30 AM"
  },
  {
    id: "REC-10480",
    amount: "₹18,500",
    customer: "Customer #3821",
    type: "Subscription",
    time: "Yesterday, 04:15 PM"
  },
  {
    id: "REC-10484",
    amount: "₹12,500",
    customer: "Nexus Retail Ltd",
    type: "Abandoned Checkout",
    time: "Yesterday, 01:53 PM"
  }
];

export const initialAiActivity = [
  {
    time: "11:02 AM",
    description: "₹48,000 recovered.",
    status: "RECOVERED",
    customer: "Rahul Enterprises"
  },
  {
    time: "10:44 AM",
    description: "Recovery action started.",
    status: "RECOVERING",
    customer: "Rahul Enterprises"
  },
  {
    time: "10:43 AM",
    description: "Identified expired payment method.",
    status: "ANALYZING",
    customer: "Rahul Enterprises"
  },
  {
    time: "10:42 AM",
    description: "Found ₹48,000 payment at risk.",
    status: "FOUND",
    customer: "Rahul Enterprises"
  },
  {
    time: "09:15 AM",
    description: "Invoice escalated to finance team.",
    status: "ESCALATED",
    customer: "Mahindra Heavy Ind"
  },
  {
    time: "08:30 AM",
    description: "Scanned 5,000 revenue events.",
    status: "ANALYZING",
    customer: "System"
  }
];

export const safetyRules = [
  {
    name: "Maximum payment retries",
    value: "2 attempts",
    description: "AI will stop after 2 failed retries to avoid annoying customers or banks."
  },
  {
    name: "Maximum customer reminders",
    value: "2 messages",
    description: "Limits automated messages so customers are never spammed."
  },
  {
    name: "When AI needs a person",
    value: "Invoices over ₹5,00,000",
    description: "High-value cases are always sent to your finance team for personal review."
  },
  {
    name: "Stop when paid",
    value: "Immediate stop",
    description: "All recovery actions stop immediately the second payment is received."
  },
  {
    name: "Stop when customer opts out",
    value: "Immediate stop",
    description: "If a customer asks to stop or disputes an invoice, AI stops immediately."
  }
];
