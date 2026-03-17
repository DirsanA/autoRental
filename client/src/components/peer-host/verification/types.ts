export type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";

export type VerificationSubmission = {
  status: VerificationStatus;
  fullName: string;
  dateOfBirth: string; // ISO date string
  address: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string; // ISO date string
  // Store filenames/URLs in real app; for mock UI we just store labels.
  documents: {
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    selfie?: string;
    proofOfAddress?: string;
  };
  lastUpdatedAt?: string; // ISO date string
  rejectionReason?: string;
};

