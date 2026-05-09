type ChatLikeMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type KnowledgeSection = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
};

const KNOWLEDGE_SECTIONS: KnowledgeSection[] = [
  {
    id: "overview",
    title: "Platform Overview",
    keywords: [
      "overview",
      "platform",
      "system",
      "autorent",
      "roles",
      "dashboard",
    ],
    content: [
      "AutoRent supports four role states in the client: renter, peerhost, company, and admin.",
      "Renter is the default customer role. Peer host access is enabled when the session exposes verificationLevel = PEER_HOST or a peerhost role.",
      "Company access is enabled only when company status is ACTIVE. If company status is not ACTIVE, the company sees a review screen instead of the dashboard.",
      "Admin is exclusive and does not share renter or company dashboard access.",
      "The main product areas confirmed in the codebase are renter bookings, renter verification, peer-host vehicle onboarding, company onboarding, wallet payouts, booking payment tracking, and admin review flows.",
    ].join("\n"),
  },
  {
    id: "renter",
    title: "How To Become A Renter",
    keywords: [
      "renter",
      "signup",
      "sign up",
      "register",
      "account",
      "book",
      "booking",
      "rent",
    ],
    content: [
      "Renter signup collects first name, last name, phone number, email, and password.",
      "After successful signup, the UI tells the user to check email and verify the account before logging in.",
      "After signing in, renters use the renter dashboard and booking history pages to manage trips.",
      "Renter booking history supports search plus status filters including Pending, Confirmed, Completed, Cancelled, and Declined in the UI layer.",
      "If a renter wants to become a host later, the renter sidebar links to a become-host flow.",
    ].join("\n"),
  },
  {
    id: "renter-verification",
    title: "Renter Verification",
    keywords: [
      "verification",
      "verify",
      "id",
      "license",
      "self drive",
      "with driver",
      "national id",
      "driver license",
    ],
    content: [
      "The shared verification page supports two renter modes: with_driver and self_drive.",
      "With-driver mode uses National ID verification. The user submits date of birth, national ID number, and front/back ID files.",
      "Self-drive mode uses Driver's License verification. The user submits date of birth, license number, license expiry date, and front/back license files.",
      "Verification statuses in the client are not_submitted, pending, approved, and rejected.",
      "When a submission is rejected, the user can resubmit. Approved records can also be replaced and sent back for review.",
      "The UI shows last submitted time, last reviewed time, total submissions on file, and any admin comment returned by the verification record.",
      "Accepted upload types shown in the UI are JPG, PNG, or PDF. The guidance card says max file size is 5MB per document.",
    ].join("\n"),
  },
  {
    id: "peerhost-access",
    title: "How To Become A Peer Host",
    keywords: [
      "peerhost",
      "peer host",
      "host",
      "become host",
      "p2p",
      "upgrade peerhost",
      "listing",
      "vehicle onboarding",
    ],
    content: [
      "There are two peer-host related flows visible in the client codebase.",
      "First, account verification for peer-host access is submitted through the shared verification page to /auth/upgrade/peerhost using date of birth, license number, license expiry, and front/back driver's license files.",
      "Second, the actual host onboarding and first vehicle listing flow is a four-step vehicle submission flow used at /renter/become-host and /peerhost/add-vehicle.",
      "The four vehicle onboarding steps are Car Details, Documents, Pricing, and Submit.",
      "Required car details include make, model, year, seats, at least one feature, and four photos: front, back, side, and interior.",
      "Required host documents in this flow are vehicle ownership and insurance.",
      "Required pricing data includes at least a daily price. Pickup address is collected, and return address defaults to the pickup address unless changed.",
      "After submission, the success state says the application or vehicle is under review, typically within 24-48 hours, and the user will receive an email once verification is complete.",
    ].join("\n"),
  },
  {
    id: "company",
    title: "How To Become A Company",
    keywords: [
      "company",
      "fleet",
      "business",
      "commercial",
      "tin",
      "registration",
      "company signup",
      "company onboarding",
    ],
    content: [
      "The company onboarding flow starts with business eligibility checks: registered company, valid TIN number, commercial license, and operating in a supported city.",
      "The user then confirms location using geolocation or manual city selection. Supported cities in the client include Addis Ababa, Adama, Hawassa, Bahir Dar, Mekelle, Dire Dawa, Bishoftu, Jimma, Gondar, and Dessie.",
      "The company form is split into five stages: Operating Location, Company Identity, Primary Contact, Fleet and Documents, and Final Review.",
      "Confirmed location fields are region, city, sub-city or woreda, and business address.",
      "Confirmed company identity fields are legal company name, a 10-digit TIN number, registration number, and optional year founded.",
      "Confirmed contact fields are representative full name, email, and Ethiopian-format phone number.",
      "Confirmed professional fields are fleet size, vehicle types, years in business, website, commercial license upload, and TIN certificate upload in the UI.",
      "The company API helper posts company name, tinNumber, normalized email and phone, address, fullAddress, website, and a licenseDocument to /companies.",
      "Company dashboard access is gated by company status. If the status is not ACTIVE, the user sees a review screen that says approval usually takes 24-48 hours and that email notification will be sent once approved.",
    ].join("\n"),
  },
  {
    id: "bookings-payments",
    title: "Bookings, Payment, And Commission",
    keywords: [
      "booking",
      "checkout",
      "payment",
      "chapa",
      "commission",
      "trip fee",
      "system commission",
      "price",
      "pricing",
    ],
    content: [
      "Vehicle checkout uses Chapa through the /bookings/checkout/chapa endpoint.",
      "The booking card enforces these client-side rules: pickup must be in the future, return must be after pickup, booking length must be at least 3 days, and both pickup and return must stay within one month from today.",
      "Vehicles cannot be booked if they are unavailable because of maintenance, retirement, pending approval, or overlapping availability blocks such as existing bookings, maintenance, owner use, or admin hold.",
      "The booking card calculates subtotal as days multiplied by daily rate.",
      "The client-side trip fee or commission rate used in the booking card is 8% of subtotal.",
      "The booking total shown to the renter is subtotal plus commission.",
      "Detailed booking records returned by the API include pricePerHour, totalHours, systemCommission, totalAmount, currency, payment method, payment status, transaction reference, paidAt, and checkout expiry details.",
      "The renter booking detail page explicitly labels this amount as System commission in the payment breakdown.",
      "Admin revenue screens also track commission as a separate revenue type alongside other transaction categories.",
    ].join("\n"),
  },
  {
    id: "wallet",
    title: "Wallets And Payouts",
    keywords: [
      "wallet",
      "payout",
      "withdraw",
      "balance",
      "ledger",
      "escrow",
      "funds",
    ],
    content: [
      "Wallet data exists for User and Company owners.",
      "The wallet snapshot exposes pendingBalance, availableBalance, lifetimeEarned, lifetimePaidOut, and lifetimeRefunded.",
      "Pending balance is described as escrow funds locked until completion or admin release.",
      "Available balance is withdrawable balance.",
      "The current wallet UI lets the user request withdrawal via Chapa.",
      "The client enforces a minimum withdrawal amount of 500 ETB and blocks requests above the available balance.",
      "Payout statuses confirmed in the client are PENDING, PROCESSING, PAID, FAILED, and CANCELLED.",
      "Recent payout requests show amount, status, created time, payout method, and paid time when available.",
    ].join("\n"),
  },
  {
    id: "email-notifications",
    title: "Email Notifications",
    keywords: [
      "email",
      "emails",
      "notification",
      "notifications",
      "verify email",
      "reset password",
      "approval email",
      "inbox",
    ],
    content: [
      "Confirmed email-driven flows in the client are account verification, company email verification, password reset, and approval-result notifications for review-based onboarding.",
      "After normal renter signup, the success message tells the user to check email and verify the account before logging in.",
      "The /verify-email page confirms successful email verification for normal users and redirects them to sign in.",
      "The /company/verify-email page confirms company email verification and tells the user to sign in and continue to the company dashboard.",
      "Forgot-password submits to /auth/forgot-password and the success screen says a password reset link was sent to the user's email.",
      "Reset password uses a token-based flow and the app has a reset-password route that forwards the token to the auth reset page.",
      "Peer-host and company pending-review screens explicitly say the user will receive an email once verification or approval is complete.",
      "The current client codebase does not explicitly define the exact contents of booking confirmation emails, cancellation emails, payout emails, or admin moderation emails, so the assistant should describe those as not confirmed unless backend documentation is added later.",
    ].join("\n"),
  },
];

function normalizeText(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s/-]/g, " ");
}

function getLatestUserMessage(messages: ChatLikeMessage[]) {
  return (
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? ""
  );
}

function scoreSection(query: string, section: KnowledgeSection) {
  const normalizedQuery = normalizeText(query);

  return section.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword).trim();
    if (!normalizedKeyword) return score;

    if (normalizedQuery.includes(normalizedKeyword)) {
      return score + (normalizedKeyword.includes(" ") ? 4 : 2);
    }

    return score;
  }, 0);
}

function selectKnowledgeSections(query: string, limit = 4) {
  const overview = KNOWLEDGE_SECTIONS.find((section) => section.id === "overview");
  const ranked = KNOWLEDGE_SECTIONS
    .filter((section) => section.id !== "overview")
    .map((section) => ({
      section,
      score: scoreSection(query, section),
    }))
    .sort((left, right) => right.score - left.score);

  const selected = ranked
    .filter((item) => item.score > 0)
    .slice(0, limit)
    .map((item) => item.section);

  if (selected.length === 0) {
    selected.push(
      KNOWLEDGE_SECTIONS.find((section) => section.id === "renter")!,
      KNOWLEDGE_SECTIONS.find((section) => section.id === "peerhost-access")!,
      KNOWLEDGE_SECTIONS.find((section) => section.id === "company")!,
    );
  }

  return overview ? [overview, ...selected] : selected;
}

function formatSection(section: KnowledgeSection) {
  return `[${section.title}]\n${section.content}`;
}

export function buildProjectKnowledgeContext(messages: ChatLikeMessage[]) {
  const latestUserMessage = getLatestUserMessage(messages);
  const sections = selectKnowledgeSections(latestUserMessage, 5);

  return [
    "Use the following AutoRent project knowledge as the source of truth for product-specific answers.",
    "If a detail is not confirmed below, say it is not confirmed in the current codebase.",
    "When the user asks for steps, answer in numbered steps.",
    "When the user asks about roles, separate renter, peer host, and company clearly.",
    "",
    ...sections.map(formatSection),
  ].join("\n");
}

export function buildProjectFallbackReply(messages: ChatLikeMessage[]) {
  const latestUserMessage = getLatestUserMessage(messages);
  const sections = selectKnowledgeSections(latestUserMessage, 3);

  return [
    "Here is the relevant AutoRent guidance from the current project setup:",
    "",
    ...sections.map(formatSection),
    "",
    "Ask about a specific flow like renter signup, peer-host approval, company onboarding, booking commission, wallet payout, or email notifications if you want a narrower answer.",
  ].join("\n");
}
