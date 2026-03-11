"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchInvoices } from "@/lib/mock-api";
import { Invoice } from "@/lib/mock-data";
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
import { Search, FileText } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data = await fetchInvoices({
          status: selectedStatus === "all" ? undefined : selectedStatus,
          search: searchTerm,
        });
        setInvoices(data);
      } catch (error) {
        console.error("Failed to load invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
          <p className="text-muted-foreground">
            Track all invoices and payments
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, customers..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card className="border-border">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground">
                      Invoice #
                    </TableHead>
                    <TableHead className="text-foreground">
                      Ticket
                    </TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="border-border hover:bg-muted/50 transition"
                    >
                      <TableCell className="font-medium text-primary">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {invoice.ticketId || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.createdDate)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        ${invoice.amount}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          <Link href={`/invoices/${invoice.id}`}>
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
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No invoices found matching your search
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
