"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchDashboardData,
  fetchTicketStats,
  fetchRecentTickets,
} from "@/lib/mock-api";
import { Ticket } from "@/lib/mock-data";
import { StatsCard } from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Ticket as TicketIcon } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    openTickets: 0,
    waitingParts: 0,
    readyForPickup: 0,
    overdue: 0,
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        setStats(dashboardData.stats);
        setRecentTickets(dashboardData.recentTickets);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your repair shop operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                label="Open Tickets"
                value={stats.openTickets}
                icon={<TicketIcon className="h-6 w-6" />}
              />
              <StatsCard
                label="Waiting for Parts"
                value={stats.waitingParts}
                icon={<TicketIcon className="h-6 w-6" />}
              />
              <StatsCard
                label="Ready for Pickup"
                value={stats.readyForPickup}
                icon={<TicketIcon className="h-6 w-6" />}
                variant="accent"
              />
              <StatsCard
                label="Overdue"
                value={stats.overdue}
                icon={<TicketIcon className="h-6 w-6" />}
              />
            </>
          )}
        </div>

        {/* Recent Tickets Table */}
        <Card className="border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Tickets
            </h2>
            <Button asChild variant="outline" size="sm" className="border-border">
              <Link href="/tickets" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : recentTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground">Ticket</TableHead>
                    <TableHead className="text-foreground">Device</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-border hover:bg-muted/50 cursor-pointer transition"
                      onClick={() => {
                        window.location.href = `/tickets/${ticket.id}`;
                      }}
                    >
                      <TableCell className="font-medium text-primary">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(ticket.createdDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ${ticket.finalCost || ticket.estimatedCost}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No tickets yet</p>
              <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                <Link href="/tickets">Create your first ticket</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
