import type {
  Dispute,
  DisputeMessage,
  DisputeEvent,
} from "./types";

export const mockDisputes: Dispute[] = [
  {
    id: "dsp_001",
    caseNumber: "DSP-2026-0041",
    title: "Unauthorized charge after vehicle return",
    category: "billing",
    status: "open",
    priority: "high",
    createdAt: "2026-03-14T09:22:00Z",
    updatedAt: "2026-03-14T09:22:00Z",
    claimant: {
      id: "rnt_91",
      name: "Lena Hoffman",
      email: "lena.hoffman@mail.com",
      role: "renter",
      avatarInitials: "LH",
    },
    respondent: {
      id: "cmp_03",
      name: "AutoElite Ltd.",
      email: "support@autoelite.com",
      role: "company",
      avatarInitials: "AE",
    },
    bookingRef: "BKG-88721",
    amountClaimed: 320,
    currency: "USD",
    assignedTo: "Sofia Alvarez",
    shortDescription:
      "Renter claims a $320 charge was applied 3 days after vehicle was returned in good condition.",
  },
  {
    id: "dsp_002",
    caseNumber: "DSP-2026-0040",
    title: "Vehicle delivered with pre-existing damage",
    category: "vehicle_condition",
    status: "under_review",
    priority: "critical",
    createdAt: "2026-03-12T14:05:00Z",
    updatedAt: "2026-03-16T11:00:00Z",
    claimant: {
      id: "rnt_44",
      name: "James Orikwa",
      email: "j.orikwa@gmail.com",
      role: "renter",
      avatarInitials: "JO",
    },
    respondent: {
      id: "p2p_07",
      name: "TuneTrek Hosts",
      email: "hosts@tunetrek.io",
      role: "p2p_host",
      avatarInitials: "TT",
    },
    bookingRef: "BKG-88601",
    amountClaimed: 1850,
    currency: "USD",
    assignedTo: "Marcus Lee",
    shortDescription:
      "P2P host is claiming damage that was documented as pre-existing at pickup. Renter has photos.",
  },
  {
    id: "dsp_003",
    caseNumber: "DSP-2026-0039",
    title: "Refund not issued 14 days after cancellation",
    category: "cancellation",
    status: "escalated",
    priority: "high",
    createdAt: "2026-03-01T08:30:00Z",
    updatedAt: "2026-03-15T17:20:00Z",
    claimant: {
      id: "rnt_22",
      name: "Priya Kapoor",
      email: "priya.k@webmail.in",
      role: "renter",
      avatarInitials: "PK",
    },
    respondent: {
      id: "cmp_01",
      name: "DriveNow Corp.",
      email: "billing@drivenow.com",
      role: "company",
      avatarInitials: "DN",
    },
    bookingRef: "BKG-88200",
    amountClaimed: 580,
    currency: "USD",
    assignedTo: "Amina Noor",
    shortDescription:
      "Renter cancelled within the free cancellation window, but refund was never processed by the company.",
  },
  {
    id: "dsp_004",
    caseNumber: "DSP-2026-0038",
    title: "No-show — vehicle was unavailable at pickup",
    category: "no_show",
    status: "resolved",
    priority: "medium",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-02-27T09:45:00Z",
    resolvedAt: "2026-02-27T09:45:00Z",
    claimant: {
      id: "rnt_55",
      name: "Carlos Mendes",
      email: "carlos.m@proton.me",
      role: "renter",
      avatarInitials: "CM",
    },
    respondent: {
      id: "cmp_05",
      name: "FleetFirst Kenya",
      email: "ops@fleetfirst.ke",
      role: "company",
      avatarInitials: "FF",
    },
    bookingRef: "BKG-87990",
    amountClaimed: 200,
    currency: "USD",
    assignedTo: "Sofia Alvarez",
    shortDescription:
      "Company failed to deliver the rented SUV at agreed time. Renter is requesting full refund + compensation.",
  },
  {
    id: "dsp_005",
    caseNumber: "DSP-2026-0037",
    title: "Fraudulent booking using stolen payment info",
    category: "fraud",
    status: "under_review",
    priority: "critical",
    createdAt: "2026-03-10T21:15:00Z",
    updatedAt: "2026-03-13T08:00:00Z",
    claimant: {
      id: "platform",
      name: "Platform (Auto-flagged)",
      email: "fraud@platform.internal",
      role: "platform",
      avatarInitials: "PL",
    },
    respondent: {
      id: "rnt_88",
      name: "Unknown Actor",
      email: "temp99@disposable.xyz",
      role: "renter",
      avatarInitials: "UA",
    },
    bookingRef: "BKG-88650",
    amountClaimed: 4200,
    currency: "USD",
    assignedTo: "Amina Noor",
    shortDescription:
      "System flagged this booking as potentially fraudulent. The card used was reported stolen.",
  },
  {
    id: "dsp_006",
    caseNumber: "DSP-2026-0036",
    title: "Vehicle interior cleanliness below standard",
    category: "service_quality",
    status: "closed",
    priority: "low",
    createdAt: "2026-02-08T13:00:00Z",
    updatedAt: "2026-02-14T11:30:00Z",
    resolvedAt: "2026-02-14T11:30:00Z",
    claimant: {
      id: "rnt_31",
      name: "Zoe Yamamoto",
      email: "zoe.y@jpmail.jp",
      role: "renter",
      avatarInitials: "ZY",
    },
    respondent: {
      id: "cmp_03",
      name: "AutoElite Ltd.",
      email: "support@autoelite.com",
      role: "company",
      avatarInitials: "AE",
    },
    bookingRef: "BKG-87100",
    amountClaimed: 50,
    currency: "USD",
    shortDescription:
      "Minor cleanliness complaint. Company offered a $50 credit voucher which was accepted.",
  },
  {
    id: "dsp_007",
    caseNumber: "DSP-2026-0035",
    title: "Damage claim disputed — renter denies responsibility",
    category: "damage_claim",
    status: "open",
    priority: "medium",
    createdAt: "2026-03-16T07:50:00Z",
    updatedAt: "2026-03-16T07:50:00Z",
    claimant: {
      id: "p2p_12",
      name: "Bashir Fadel",
      email: "bashir.fadel@hostmail.com",
      role: "p2p_host",
      avatarInitials: "BF",
    },
    respondent: {
      id: "rnt_70",
      name: "Nadia Petrov",
      email: "nadia.p@euromail.eu",
      role: "renter",
      avatarInitials: "NP",
    },
    bookingRef: "BKG-88780",
    amountClaimed: 900,
    currency: "USD",
    assignedTo: undefined,
    shortDescription:
      "P2P host claims rear bumper damage. Renter denies causing it and requires third-party inspection.",
  },
];

export const mockDisputeMessages: Record<string, DisputeMessage[]> = {
  dsp_001: [
    {
      id: "msg_01",
      author: "Lena Hoffman",
      authorRole: "renter",
      content:
        "I returned the car on March 11th and I have the photo evidence and signed receipt. The $320 charge appeared 3 days later with no explanation. I'm requesting an immediate refund.",
      timestamp: "2026-03-14T09:22:00Z",
    },
    {
      id: "msg_02",
      author: "AutoElite Support",
      authorRole: "company",
      content:
        "We apologize for the delay. Our team is reviewing the charge. The amount relates to a late return fee logged by our fleet system. We are checking the timestamps.",
      timestamp: "2026-03-14T11:45:00Z",
    },
    {
      id: "msg_03",
      author: "Sofia Alvarez",
      authorRole: "admin",
      content:
        "Case assigned. Requested timestamped return log from AutoElite. Evidence from both parties is being collected.",
      timestamp: "2026-03-14T14:00:00Z",
      isInternal: true,
    },
  ],
  dsp_002: [
    {
      id: "msg_04",
      author: "James Orikwa",
      authorRole: "renter",
      content:
        "I took 47 photos before I even started the engine. The scratches on the rear door and the cracked wing mirror were clearly pre-existing. I will not pay for this damage.",
      timestamp: "2026-03-12T14:05:00Z",
    },
    {
      id: "msg_05",
      author: "TuneTrek Hosts",
      authorRole: "p2p_host",
      content:
        "We have our own checkout photos showing the car was in perfect condition before the rental. Our insurance is proceeding with the claim.",
      timestamp: "2026-03-13T09:30:00Z",
    },
    {
      id: "msg_06",
      author: "Marcus Lee",
      authorRole: "admin",
      content:
        "Escalated to senior review. Both photo sets are being analyzed by our technical team. Will have a preliminary finding by March 18th.",
      timestamp: "2026-03-16T11:00:00Z",
      isInternal: true,
    },
  ],
  dsp_007: [
    {
      id: "msg_07",
      author: "Bashir Fadel",
      authorRole: "p2p_host",
      content:
        "I picked up the car and found the rear bumper had a fresh scrape. This wasn't there before. I've taken photos and submitted to insurance.",
      timestamp: "2026-03-16T07:50:00Z",
    },
    {
      id: "msg_08",
      author: "Nadia Petrov",
      authorRole: "renter",
      content:
        "I didn't cause any damage. The bumper was already damaged when I picked up the vehicle, but there was no checkbox for it in the app checkout form. I request a neutral inspector.",
      timestamp: "2026-03-16T10:10:00Z",
    },
  ],
};

export const mockDisputeTimeline: Record<string, DisputeEvent[]> = {
  dsp_001: [
    {
      id: "ev_01",
      type: "message",
      description: "Claimant submitted dispute",
      actor: "Lena Hoffman",
      timestamp: "2026-03-14T09:22:00Z",
    },
    {
      id: "ev_02",
      type: "assignment",
      description: "Assigned to Sofia Alvarez",
      actor: "System",
      timestamp: "2026-03-14T10:05:00Z",
    },
    {
      id: "ev_03",
      type: "message",
      description: "Respondent replied",
      actor: "AutoElite Support",
      timestamp: "2026-03-14T11:45:00Z",
    },
  ],
  dsp_002: [
    {
      id: "ev_04",
      type: "message",
      description: "Claimant submitted dispute",
      actor: "James Orikwa",
      timestamp: "2026-03-12T14:05:00Z",
    },
    {
      id: "ev_05",
      type: "status_change",
      description: "Status changed → Under Review",
      actor: "Marcus Lee",
      timestamp: "2026-03-13T09:00:00Z",
    },
    {
      id: "ev_06",
      type: "document",
      description: "Photo evidence uploaded by claimant (47 files)",
      actor: "James Orikwa",
      timestamp: "2026-03-13T09:20:00Z",
    },
    {
      id: "ev_07",
      type: "document",
      description: "Counter-evidence uploaded by respondent",
      actor: "TuneTrek Hosts",
      timestamp: "2026-03-13T09:30:00Z",
    },
  ],
  dsp_004: [
    {
      id: "ev_08",
      type: "message",
      description: "Claimant submitted dispute",
      actor: "Carlos Mendes",
      timestamp: "2026-02-20T10:00:00Z",
    },
    {
      id: "ev_09",
      type: "status_change",
      description: "Status changed → Under Review",
      actor: "Sofia Alvarez",
      timestamp: "2026-02-21T08:30:00Z",
    },
    {
      id: "ev_10",
      type: "resolution",
      description: "Resolved — Full refund + $50 platform credit issued",
      actor: "Sofia Alvarez",
      timestamp: "2026-02-27T09:45:00Z",
    },
    {
      id: "ev_11",
      type: "status_change",
      description: "Status changed → Resolved",
      actor: "System",
      timestamp: "2026-02-27T09:46:00Z",
    },
  ],
};

export function getDisputeData(disputeId: string) {
  const dispute =
    mockDisputes.find((d) => d.id === disputeId) ?? mockDisputes[0];
  return {
    dispute,
    messages: mockDisputeMessages[dispute.id] ?? [],
    timeline: mockDisputeTimeline[dispute.id] ?? [],
  };
}
