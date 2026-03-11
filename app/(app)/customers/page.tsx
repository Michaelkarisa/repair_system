"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCustomers } from "@/lib/mock-api";
import { Customer } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Phone, Mail, Calendar } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers({
          search: searchTerm,
        });
        setCustomers(data);
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [searchTerm]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer information and repair history
          </p>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6 border-border">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              />
            </div>
          </div>
        </Card>

        {/* Customers Table */}
        <Card className="border-border">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground">Name</TableHead>
                    <TableHead className="text-foreground">Phone</TableHead>
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">
                      Repairs
                    </TableHead>
                    <TableHead className="text-foreground">
                      Last Repair
                    </TableHead>
                    <TableHead className="text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="border-border hover:bg-muted/50 transition"
                    >
                      <TableCell className="font-medium text-foreground">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {customer.tickets.length}
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(customer.lastRepair)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          <Link href={`/customers/${customer.id}`}>
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No customers found matching your search
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
