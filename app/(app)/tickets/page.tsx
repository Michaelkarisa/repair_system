"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTickets } from "@/lib/mock-api";
import { Ticket } from "@/lib/mock-data";
import { NewTicketModal } from "@/components/modals/new-ticket-modal";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "received", label: "Received" },
  { value: "diagnosing", label: "Diagnosing" },
  { value: "waiting-parts", label: "Waiting for Parts" },
  { value: "repairing", label: "Repairing" },
  { value: "ready", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchTickets({
          status: selectedStatus === "all" ? undefined : selectedStatus,
          search: searchTerm,
        });
        setTickets(data);
        setFilteredTickets(data);
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, [selectedStatus, searchTerm]);

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tickets</h1>
            <p className="text-muted-foreground">
              Manage all repair tickets in one place
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets, customers, devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tickets Table */}
        <Card className="border-border">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground">Ticket #</TableHead>
                    <TableHead className="text-foreground">Device</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Est. Cost</TableHead>
                    <TableHead className="text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-border hover:bg-muted/50 transition"
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
                      <TableCell className="font-medium text-foreground">
                        ${ticket.estimatedCost}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          <Link href={`/tickets/${ticket.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No tickets found matching your criteria
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Ticket
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* New Ticket Modal */}
      <NewTicketModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
