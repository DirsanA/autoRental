"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileBadge2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { UserFullDetail } from "./types";
import {
  formatDateTime,
  formatLabel,
  formatMoney,
  maskIdentity,
} from "./formatters";

interface OverviewTabProps {
  user: UserFullDetail;
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-muted/50 p-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

/**
 * Shows a concise admin summary of the user account.
 */
export function OverviewTab({ user }: OverviewTabProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
  const roles = user.roles.length > 0 ? user.roles : [user.role];

  return (
    <div className="grid gap-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active Bookings"
          value={user.metrics.activeBookingsAsRenter}
          icon={BadgeCheck}
        />
        <MetricCard
          label="Vehicles Owned"
          value={user.metrics.vehiclesOwned}
          icon={BriefcaseBusiness}
        />
        <MetricCard
          label="Wallet Balance"
          value={formatMoney(user.walletBalance)}
          icon={Wallet}
        />
        <MetricCard
          label="Total Reviews"
          value={user.metrics.reviewsReceived}
          icon={ShieldCheck}
        />
      </div>

      {/* Personal Information */}
      <Card className="border-none shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            User profile details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <DetailRow icon={FileBadge2} label="Full Name" value={fullName} />
          <DetailRow icon={Mail} label="Email" value={user.email} />
          <DetailRow
            icon={Phone}
            label="Phone"
            value={user.phoneNumber || "Not provided"}
          />
          <DetailRow
            icon={MapPin}
            label="Address"
            value={user.address || "Not provided"}
          />
          <DetailRow
            icon={FileBadge2}
            label="Identity Number"
            value={maskIdentity(user.idNumber)}
          />
          <DetailRow
            icon={ShieldCheck}
            label="Verification Level"
            value={formatLabel(user.verificationLevel)}
          />
        </CardContent>
      </Card>

      {/* Account Status & Access */}
      <Card className="border-none shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>Account Status & Access</CardTitle>
          <CardDescription>
            Account status, authentication details, and role assignments.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-muted/25 p-4">
              <div className="text-sm text-muted-foreground">
                Account Status
              </div>
              <div className="mt-1 font-semibold">
                {formatLabel(user.status)}
              </div>
            </div>
            <div className="rounded-2xl bg-muted/25 p-4">
              <div className="text-sm text-muted-foreground">
                Email Verified
              </div>
              <div className="mt-1 font-semibold">
                {user.emailVerified ? "Yes" : "No"}
              </div>
            </div>
            <div className="rounded-2xl bg-muted/25 p-4">
              <div className="text-sm text-muted-foreground">Account Type</div>
              <div className="mt-1 font-semibold">
                {formatLabel(user.accountType)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Member Since</div>
              <div className="mt-1 font-medium">
                {formatDateTime(user.createdAt || user.joined)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Login</div>
              <div className="mt-1 font-medium">
                {formatDateTime(user.lastLogin)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Assigned Roles</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge key={role} variant="outline" className="font-normal">
                  {formatLabel(role)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Company Information */}
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Business details for company accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.company ? (
              <div className="grid gap-4">
                <div className="flex items-start gap-3 rounded-2xl bg-muted/20 p-4">
                  <div className="rounded-xl bg-background p-2 text-primary shadow-sm">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{user.company.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {formatLabel(user.company.status)}
                      </Badge>
                      <Badge variant="outline" className="font-normal">
                        {user.company.isVerified ? "Verified" : "Not verified"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Contact Email
                    </div>
                    <div className="mt-1 font-medium">
                      {user.company.contactEmail || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Contact Phone
                    </div>
                    <div className="mt-1 font-medium">
                      {user.company.contactPhone || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">TIN</div>
                    <div className="mt-1 font-medium">
                      {user.company.tinNumber || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Website</div>
                    <div className="mt-1 font-medium">
                      {user.company.website || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                No linked company record was found for this user.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Activity */}
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <CardDescription>
              User activity summary across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">
                Total Bookings
              </div>
              <div className="mt-1 text-xl font-semibold">
                {user.metrics.bookingsAsRenter}
              </div>
            </div>
            <div className="rounded-2xl bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">
                Reviews Written
              </div>
              <div className="mt-1 text-xl font-semibold">
                {user.metrics.reviewsWritten}
              </div>
            </div>
            <div className="rounded-2xl bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">Disputes</div>
              <div className="mt-1 text-xl font-semibold">
                {user.metrics.disputesRaised + user.metrics.disputesAgainst}
              </div>
            </div>
            <div className="rounded-2xl bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">Total Paid</div>
              <div className="mt-1 text-xl font-semibold">
                {formatMoney(user.metrics.totalPaid)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
