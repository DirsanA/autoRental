"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ban, Eye, CarFront } from "lucide-react";
import type { HostListing } from "./types";
import { cn } from "@/lib/utils";

export function ListingsTab({
  listings,
  onDelist,
}: {
  listings: HostListing[];
  onDelist: (id: string) => void;
}) {
  const router = useRouter();

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-xl border flex flex-col items-center">
        <CarFront className="h-10 w-10 text-muted-foreground/30 mb-2" />
        <h3 className="text-lg font-medium text-foreground">
          No active listings
        </h3>
        <p className="text-sm text-muted-foreground">
          This host has not published any vehicles.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead>Vehicle Details</TableHead>
            <TableHead>Plate</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Trips</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((l) => (
            <TableRow key={l.id} className="hover:bg-muted/50 group">
              <TableCell>
                <div className="font-semibold text-sm">{l.title}</div>
                <div className="text-xs text-muted-foreground">
                  {l.category}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="font-mono text-xs bg-muted/50"
                >
                  {l.plate}
                </Badge>
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                ${l.dailyRate}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {l.totalTrips} completed
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize border-0 font-normal",
                    l.status === "active"
                      ? "bg-green-100 text-green-800"
                      : l.status === "unlisted"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-orange-100 text-orange-800",
                  )}
                >
                  {l.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/sysadmin/p2p/vehicles/${l.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" /> View full listing
                    </DropdownMenuItem>
                    {l.status === "active" && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelist(l.id)}
                      >
                        <Ban className="mr-2 h-4 w-4" /> Force Delist
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
