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

export const KNOWLEDGE_SECTIONS: KnowledgeSection[] = [
  {
    id: "overview",
    title: "Platform Overview",
    keywords: [
      "overview",
      "platform",
      "system",
      "autorent",
      "about autorent",
      "what is autorent",
      "roles",
      "dashboard",
    ],
    content: [
      "AutoRent is a car rental marketplace supporting four user roles: Renter, Peer Host, Company, and Admin.",
      "Renter is the default customer role to search, book, and rent vehicles.",
      "Peer Host access allows individuals to list personal cars and earn rental income after identity verification.",
      "Company access allows registered vehicle rental businesses to manage commercial fleets across supported cities.",
      "Admin manages approvals, platform moderation, revenue tracking, and commission payouts.",
    ].join("\n"),
  },
  {
    id: "renter",
    title: "How To Become A Renter & Book a Trip",
    keywords: [
      "renter",
      "signup",
      "sign up",
      "register",
      "account",
      "book",
      "booking",
      "rent",
      "how to rent",
      "how to book",
      "trip",
    ],
    content: [
      "1. Sign up on AutoRent with first name, last name, phone number, email, and password.",
      "2. Verify your email address via the confirmation link sent to your inbox before logging in.",
      "3. Complete identity or driver's license verification under your account profile.",
      "4. Browse available cars, select pickup and return dates (minimum 3 days), and complete checkout via Chapa.",
      "5. Manage upcoming, active, completed, or cancelled trips directly from your Renter Dashboard.",
    ].join("\n"),
  },
  {
    id: "renter-verification",
    title: "Identity & Driver's License Verification",
    keywords: [
      "verification",
      "verify",
      "id",
      "license",
      "self drive",
      "with driver",
      "national id",
      "driver license",
      "documents",
      "driver's license",
    ],
    content: [
      "AutoRent provides two verification modes based on how you plan to travel:",
      "• With-Driver Mode: Requires National ID verification (Date of Birth, National ID Number, front & back ID photos).",
      "• Self-Drive Mode: Requires Driver's License verification (Date of Birth, License Number, Expiry Date, front & back license photos).",
      "Supported file formats are JPG, PNG, or PDF with a maximum size of 5MB per document.",
      "Submissions are reviewed by administrators within 24-48 hours. If rejected, you can review feedback and resubmit anytime.",
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
      "become a host",
      "p2p",
      "upgrade peerhost",
      "listing",
      "vehicle onboarding",
      "list my car",
      "add vehicle",
    ],
    content: [
      "Becoming a Peer Host allows you to rent out your personal vehicle safely:",
      "1. Upgrade to Peer Host: Submit driver's license and identity details at /auth/upgrade/peerhost.",
      "2. 4-Step Vehicle Onboarding (/peerhost/add-vehicle or /renter/become-host):",
      "   • Step 1 - Car Details: Make, model, year, seat count, features, and 4 exterior/interior photos (front, back, side, interior).",
      "   • Step 2 - Documents: Upload vehicle ownership document (Libre) and active insurance policy.",
      "   • Step 3 - Pricing & Location: Set daily rental price, pickup location, and return address.",
      "   • Step 4 - Submit: Review details and submit for admin verification.",
      "3. Approval: Listings are reviewed within 24-48 hours. You will receive an email once approved and active.",
    ].join("\n"),
  },
  {
    id: "company",
    title: "Company Fleet Onboarding",
    keywords: [
      "company",
      "fleet",
      "business",
      "commercial",
      "tin",
      "registration",
      "company signup",
      "company onboarding",
      "register company",
    ],
    content: [
      "Rental companies can onboard their commercial vehicle fleet across Ethiopia:",
      "• Supported Cities: Addis Ababa, Adama, Hawassa, Bahir Dar, Mekelle, Dire Dawa, Bishoftu, Jimma, Gondar, and Dessie.",
      "• 5-Stage Onboarding Process:",
      "   1. Operating Location: Region, city, sub-city/woreda, and street address.",
      "   2. Company Identity: Legal registered business name, 10-digit TIN number, and registration number.",
      "   3. Primary Contact: Authorized representative name, verified business email, and Ethiopian phone number.",
      "   4. Fleet & Documentation: Commercial trade license and TIN certificate upload.",
      "   5. Final Review: Submit for administrative compliance check.",
      "• Approval: The company dashboard activates upon approval (typically within 24-48 hours with email notification).",
    ].join("\n"),
  },
  {
    id: "bookings-payments",
    title: "Bookings, Payments, and Commissions",
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
      "cost",
      "how to pay",
    ],
    content: [
      "• Checkout & Payment: Payments are securely processed online using Chapa.",
      "• Booking Rules: Minimum rental duration is 3 days. Pickup must be in the future and return must be within 30 days.",
      "• Platform Fee: AutoRent applies a standard 8% system commission / trip fee calculated on the rental subtotal.",
      "• Pricing Transparency: Total price = (Daily rate × days) + 8% platform fee.",
      "• Availability: Vehicles under maintenance, retired, or with overlapping booking schedules are automatically blocked.",
    ].join("\n"),
  },
  {
    id: "wallet",
    title: "Wallets, Balances, and Payouts",
    keywords: [
      "wallet",
      "payout",
      "withdraw",
      "balance",
      "ledger",
      "escrow",
      "funds",
      "earnings",
    ],
    content: [
      "Hosts and companies track earnings and request payouts from their dedicated Wallet:",
      "• Pending Balance: Escrow funds held securely until the trip completes successfully.",
      "• Available Balance: Funds eligible for immediate withdrawal.",
      "• Withdrawal Method: Direct payout through Chapa.",
      "• Minimum Withdrawal: 500 ETB minimum per payout request.",
      "• Payout Tracking: Statuses are tracked in real time: PENDING, PROCESSING, PAID, FAILED, or CANCELLED.",
    ].join("\n"),
  },
  {
    id: "email-notifications",
    title: "Email Notifications & Password Recovery",
    keywords: [
      "email",
      "emails",
      "notification",
      "notifications",
      "verify email",
      "reset password",
      "forgot password",
      "approval email",
      "inbox",
    ],
    content: [
      "AutoRent communicates key account events via automated email notifications:",
      "• Account Verification: Confirmation links sent after renter or company registration.",
      "• Password Reset: Secure one-time reset link sent to your registered email address.",
      "• Onboarding Approval: Email notifications sent when host vehicle or company accounts are approved or require updates.",
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

function isGreeting(text: string): boolean {
  const clean = text.trim().toLowerCase().replace(/[!?.,;]/g, "");
  const greetings = [
    "hi",
    "hello",
    "hey",
    "hiya",
    "howdy",
    "yo",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "hi there",
    "hello there",
    "hey there",
    "sup",
    "what's up",
    "whats up",
  ];
  return greetings.includes(clean);
}

function isCarRecommendationRequest(text: string): {
  isMatch: boolean;
  category?: "suv" | "budget" | "airport" | "luxury" | "van" | "general";
} {
  const lower = text.toLowerCase();

  if (
    lower.includes("suv") ||
    lower.includes("family") ||
    lower.includes("child") ||
    lower.includes("kids") ||
    lower.includes("luggage") ||
    lower.includes("spacious") ||
    lower.includes("road trip")
  ) {
    return { isMatch: true, category: "suv" };
  }

  if (
    lower.includes("budget") ||
    lower.includes("cheap") ||
    lower.includes("affordable") ||
    lower.includes("economy") ||
    lower.includes("low cost") ||
    lower.includes("saving")
  ) {
    return { isMatch: true, category: "budget" };
  }

  if (
    lower.includes("airport") ||
    lower.includes("flight") ||
    lower.includes("terminal") ||
    lower.includes("arrival")
  ) {
    return { isMatch: true, category: "airport" };
  }

  if (
    lower.includes("luxury") ||
    lower.includes("vip") ||
    lower.includes("premium") ||
    lower.includes("executive") ||
    lower.includes("wedding") ||
    lower.includes("mercedes") ||
    lower.includes("bmw")
  ) {
    return { isMatch: true, category: "luxury" };
  }

  if (
    lower.includes("van") ||
    lower.includes("minivan") ||
    lower.includes("group") ||
    lower.includes("bus") ||
    lower.includes("passenger")
  ) {
    return { isMatch: true, category: "van" };
  }

  if (
    lower.includes("car") ||
    lower.includes("cars") ||
    lower.includes("vehicle") ||
    lower.includes("rent") ||
    lower.includes("recommend") ||
    lower.includes("drive")
  ) {
    return { isMatch: true, category: "general" };
  }

  return { isMatch: false };
}

function isOffTopic(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Common off-topic patterns
  const offTopicPatterns = [
    /\bwhat is (atom|physics|chemistry|quantum|gravity|dna|photosynthesis|math|biology)\b/i,
    /\bwho (is|was) (elon|napoleon|einstein|newton|shakespeare|president|biden|trump)\b/i,
    /\b(write|create) (code|python|javascript|script|essay|poem|story)\b/i,
    /\b(tell me a joke|solve|weather today|recipe for)\b/i,
  ];

  for (const pattern of offTopicPatterns) {
    if (pattern.test(lower)) return true;
  }

  // If query is a general question and has no rental/car/autorent keywords
  const relevantKeywords = [
    "car", "auto", "rent", "vehicle", "trip", "drive", "host", "company",
    "fleet", "book", "chapa", "payment", "price", "tin", "license",
    "verification", "wallet", "payout", "pickup", "dropoff", "return",
    "suv", "sedan", "van", "model", "toyota", "hyundai", "suzuki", "ethiopia",
    "addis", "hi", "hello", "help", "support",
  ];

  const hasRelevantKeyword = relevantKeywords.some((kw) => lower.includes(kw));

  if (!hasRelevantKeyword && (lower.startsWith("what is") || lower.startsWith("who is") || lower.startsWith("how to make") || lower.startsWith("explain"))) {
    return true;
  }

  return false;
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

function selectKnowledgeSections(query: string, limit = 3) {
  const ranked = KNOWLEDGE_SECTIONS.filter(
    (section) => section.id !== "overview",
  )
    .map((section) => ({
      section,
      score: scoreSection(query, section),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return ranked.slice(0, limit).map((item) => item.section);
}

function formatSection(section: KnowledgeSection) {
  return `[${section.title}]\n${section.content}`;
}

export function buildProjectKnowledgeContext(messages: ChatLikeMessage[]) {
  const latestUserMessage = getLatestUserMessage(messages);
  const sections = selectKnowledgeSections(latestUserMessage, 4);

  const contextSections =
    sections.length > 0
      ? sections
      : [
          KNOWLEDGE_SECTIONS.find((s) => s.id === "overview")!,
          KNOWLEDGE_SECTIONS.find((s) => s.id === "renter")!,
          KNOWLEDGE_SECTIONS.find((s) => s.id === "bookings-payments")!,
        ];

  return [
    "Use the following AutoRent project knowledge as the source of truth for platform-specific answers.",
    "If a detail is not confirmed below, say it is not confirmed in the current codebase.",
    "When suggesting vehicles, suggest common categories available in Ethiopia (SUVs, compact sedans, vans).",
    "Keep answers friendly, conversational, concise, and formatted clearly.",
    "",
    ...contextSections.map(formatSection),
  ].join("\n");
}

export function buildProjectFallbackReply(messages: ChatLikeMessage[]) {
  const latestUserMessage = getLatestUserMessage(messages).trim();

  // 1. Casual Greetings
  if (isGreeting(latestUserMessage) || !latestUserMessage) {
    return [
      "Hello! Welcome to AutoRent. I'm your virtual rental assistant.",
      "",
      "How can I help you today?",
      "• Recommend the right car for your trip (SUVs, budget sedans, airport pickups)",
      "• Guide you through renting and booking a car",
      "• Explain driver's license and identity verification",
      "• Help you become a Peer Host and earn with your vehicle",
      "• Guide company fleet registration and payouts",
      "",
      "Feel free to ask a question or select one of the suggested prompts below!",
    ].join("\n");
  }

  // 2. Off-topic questions
  if (isOffTopic(latestUserMessage)) {
    return [
      "I am AutoRent Assistant, dedicated to helping with vehicle rentals, bookings, and host onboarding on the AutoRent platform.",
      "",
      `I can't answer general knowledge questions like "${latestUserMessage}".`,
      "",
      "However, I would be delighted to help you find a rental car, guide you through booking a trip, or help you list your vehicle as a host. What kind of car or trip do you have in mind?",
    ].join("\n");
  }

  // 3. Car Recommendations & Categories
  const carCheck = isCarRecommendationRequest(latestUserMessage);
  if (carCheck.isMatch) {
    if (carCheck.category === "suv") {
      return [
        "Looking for family-friendly SUVs? Here are top options on AutoRent:",
        "",
        "• Toyota RAV4 & Hyundai Tucson: Great fuel economy, high ride height, and comfortable 5-passenger seating with generous luggage space.",
        "• Toyota Land Cruiser / Prado: Ideal for rough roads, country trips, or larger families needing robust 4WD capability.",
        "",
        "Tip: Check the 'Features' tag on listings for AWD, child seat support, and Bluetooth. You can filter and book available SUVs on our Explore Cars page!",
      ].join("\n");
    }

    if (carCheck.category === "budget") {
      return [
        "Looking for the best budget-friendly options? Here is what we recommend:",
        "",
        "• Compact Sedans (Toyota Corolla, Suzuki Dzire, Hyundai Elantra): Excellent fuel efficiency, easy city parking, and the most affordable daily rental rates.",
        "• Cost-Saving Tip: Book for 3+ days to optimize the daily rate, and choose self-drive if you have a verified driver's license.",
        "",
        "Visit our Explore Cars page and sort by price to discover the lowest rates available in your city!",
      ].join("\n");
    }

    if (carCheck.category === "airport") {
      return [
        "Need a reliable airport pickup car?",
        "",
        "• Comfort & Luggage: We recommend mid-size sedans (Toyota Camry, Corolla) or compact SUVs with ample trunk space for your suitcases.",
        "• Flexible Pickup: You can set the airport or your hotel as the pickup address during booking.",
        "• Chauffeur / With-Driver Option: If you prefer not to drive after your flight, choose a listing that includes driver service.",
        "",
        "Browse available vehicles now to schedule your pickup time in advance!",
      ].join("\n");
    }

    if (carCheck.category === "luxury") {
      return [
        "Looking for premium or executive luxury cars?",
        "",
        "• Executive Sedans (Mercedes-Benz C/E Class, BMW, Audi): Perfect for business meetings, diplomatic transport, or VIP events.",
        "• Luxury SUVs (Land Cruiser V8, Range Rover): Exceptional road presence and premium interior comfort.",
        "",
        "All luxury bookings include full verification and dedicated host communication.",
      ].join("\n");
    }

    if (carCheck.category === "van") {
      return [
        "Traveling with a group or large family? Here are your best options:",
        "",
        "• Passenger Vans (Toyota HiAce, Hyundai H-1): Seats 7 to 12 passengers comfortably with dedicated luggage space.",
        "• Minivans & MPVs: Versatile folding seats suitable for airport group transfers and road trips.",
        "",
        "Filter by seat count on the Explore Cars page to find the right capacity for your party!",
      ].join("\n");
    }

    if (carCheck.category === "general") {
      return [
        "AutoRent features a wide range of verified vehicles to suit any trip:",
        "",
        "• Family & Group: Spacious SUVs and passenger vans with generous luggage room.",
        "• City & Budget: Economical sedans (Toyota Corolla, Suzuki Dzire) with high fuel efficiency.",
        "• Business & Luxury: Premium executive sedans and luxury SUVs.",
        "",
        "Browse all active listings with real-time availability and prices on our Explore Cars page!",
      ].join("\n");
    }
  }

  // 4. Specific Platform Knowledge Matches
  const matchedSections = selectKnowledgeSections(latestUserMessage, 2);

  if (matchedSections.length > 0) {
    const formatted = matchedSections.map((s) => s.content).join("\n\n");
    return [
      `Here is the relevant information for your question:`,
      "",
      formatted,
      "",
      "Need more details on bookings, verification, hosting, or payments? Just let me know!",
    ].join("\n");
  }

  // 5. General Fallback
  return [
    "I'm here to help you get the most out of AutoRent!",
    "",
    "You can ask me about:",
    "• Finding and booking cars (SUVs, budget cars, airport pickups)",
    "• Driver's license & identity verification (Self-drive vs. with-driver)",
    "• Becoming a Peer Host and listing your car",
    "• Registering a commercial Company fleet",
    "• Payments via Chapa and wallet withdrawals",
    "",
    "Tell me what kind of vehicle or trip you are planning, and I'll guide you!",
  ].join("\n");
}
