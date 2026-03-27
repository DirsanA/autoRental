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
  FileBadge2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
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
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon className="h-5 w-5 text-primary" />
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {hint}
      </CardContent>
    </Card>
  );
}

/**
 * Shows live account, portfolio, and linked-company context for admins.
 */
export function OverviewTab({ user }: OverviewTabProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
  const primaryRole = user.roles[0] || user.role;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Account Type"
          value={formatLabel(user.accountType)}
          hint="Primary account classification used across the platform."
          icon={BriefcaseBusiness}
        />
        <MetricCard
          label="Verification Requests"
          value={user.metrics.verificationRequests}
          hint="Total verification submissions found for this account."
          icon={ShieldCheck}
        />
        <MetricCard
          label="Active Bookings"
          value={user.metrics.activeBookingsAsRenter}
          hint="Current renter-side bookings in pending, confirmed, or active states."
          icon={BadgeCheck}
        />
        <MetricCard
          label="Wallet Balance"
          value={formatMoney(user.walletBalance)}
          hint="Current wallet balance stored on the user record."
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Identity And Contact</CardTitle>
            <CardDescription>
              Core profile fields currently available on the user record.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Full name</div>
              <div className="font-medium">{fullName}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Username</div>
              <div className="font-medium">@{user.username}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Primary role</div>
              <div className="font-medium">{formatLabel(primaryRole)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{user.status}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Phone number</div>
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.phoneNumber || "Not provided"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {user.address || "Not provided"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Identity number</div>
              <div className="flex items-center gap-2 font-medium">
                <FileBadge2 className="h-4 w-4 text-muted-foreground" />
                {maskIdentity(user.idNumber)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Verification level</div>
              <div className="font-medium">
                {formatLabel(user.verificationLevel)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email verified</div>
              <div className="font-medium">
                {user.emailVerified ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Snapshot</CardTitle>
            <CardDescription>
              Useful timestamps and access-related account markers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Created at</div>
              <div className="font-medium">{formatDateTime(user.createdAt)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Updated at</div>
              <div className="font-medium">{formatDateTime(user.updatedAt)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Last login</div>
              <div className="font-medium">{formatDateTime(user.lastLogin)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Assigned roles</div>
              <div className="flex flex-wrap gap-2">
                {(user.roles.length > 0 ? user.roles : [user.role]).map((role) => (
                  <Badge key={role} variant="outline" className="font-normal">
                    {formatLabel(role)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Linked Company</CardTitle>
            <CardDescription>
              Company information derived from the user&apos;s linked business record.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {user.company ? (
              <>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Company name</div>
                  <div className="font-medium">{user.company.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {formatLabel(user.company.status)}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {user.company.isVerified ? "Verified" : "Not verified"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Contact email</div>
                  <div className="font-medium">
                    {user.company.contactEmail || "Not provided"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Contact phone</div>
                  <div className="font-medium">
                    {user.company.contactPhone || "Not provided"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">TIN number</div>
                  <div className="font-medium">
                    {user.company.tinNumber || "Not provided"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Website</div>
                  <div className="font-medium">
                    {user.company.website || "Not provided"}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                No linked company record was found for this user.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Footprint</CardTitle>
            <CardDescription>
              Aggregate counts calculated from bookings, reviews, disputes, vehicles, and transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Bookings as renter</div>
              <div className="text-2xl font-semibold">
                {user.metrics.bookingsAsRenter}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Bookings on owned vehicles
              </div>
              <div className="text-2xl font-semibold">
                {user.metrics.bookingsOnOwnedVehicles}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Vehicles owned</div>
              <div className="text-2xl font-semibold">
                {user.metrics.vehiclesOwned}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Reviews written</div>
              <div className="text-2xl font-semibold">
                {user.metrics.reviewsWritten}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Reviews received</div>
              <div className="text-2xl font-semibold">
                {user.metrics.reviewsReceived}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Disputes raised</div>
              <div className="text-2xl font-semibold">
                {user.metrics.disputesRaised}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Disputes against</div>
              <div className="text-2xl font-semibold">
                {user.metrics.disputesAgainst}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total received</div>
              <div className="text-2xl font-semibold">
                {formatMoney(user.metrics.totalReceived)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
