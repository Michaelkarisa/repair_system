"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTicketByCode } from "@/lib/mock-api";
import { Ticket } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TicketStatusTimeline } from "@/components/ticket-status-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Smartphone, User, Phone, Mail, Clock } from "lucide-react";

interface TrackingPageProps {
  params: {
    code: string;
  };
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        const data = await fetchTicketByCode(params.code);
        setTicket(data);
      } catch (err) {
        setError("Ticket not found. Please check the ticket number and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [params.code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/track">Try Again</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        <Link href="/track" className="flex items-center gap-2 text-primary hover:opacity-80 transition mb-8">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back to Search</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {ticket.ticketNumber}
              </h1>
              <p className="text-muted-foreground">
                {ticket.deviceBrand} {ticket.deviceModel}
              </p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-8 border-border">
          <h2 className="text-sm font-semibold text-foreground mb-4">Repair Status</h2>
          <TicketStatusTimeline currentStatus={ticket.status} completedDate={ticket.completedDate} />
        </Card>

        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Device Information */}
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Device Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Device</dt>
                <dd className="text-foreground">{ticket.deviceBrand} {ticket.deviceModel}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Type</dt>
                <dd className="text-foreground">{ticket.deviceType}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">IMEI / Serial</dt>
                <dd className="font-mono text-sm text-foreground">{ticket.imeiSerial}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Issue</dt>
                <dd className="text-foreground">{ticket.issueDescription}</dd>
              </div>
            </dl>
          </Card>

          {/* Timeline & Dates */}
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Timeline
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Received Date</dt>
                <dd className="text-foreground">{formatDate(ticket.createdDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Estimated Completion</dt>
                <dd className="text-foreground">{formatDate(ticket.estimatedDate)}</dd>
              </div>
              {ticket.completedDate && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Completed Date</dt>
                  <dd className="text-foreground">{formatDate(ticket.completedDate)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Status Update</dt>
                <dd className="text-foreground capitalize">{ticket.status.replace("-", " ")}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Warranty Information */}
        {ticket.warranty?.enabled && (
          <Card className="p-6 mb-8 bg-green-50 border-green-200 border">
            <h3 className="font-semibold text-green-900 mb-2">Warranty Coverage</h3>
            <p className="text-sm text-green-700">
              Your repair is covered by our warranty until {formatDate(ticket.warranty.expiryDate)}.
            </p>
          </Card>
        )}

        {/* Cost Summary */}
        <Card className="p-6 border-border">
          <h3 className="font-semibold text-foreground mb-4">Cost Breakdown</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-foreground">Labor</dt>
              <dd className="text-foreground font-medium">${ticket.labor}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground">Parts</dt>
              <dd className="text-foreground font-medium">${ticket.parts}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground">Deposit Paid</dt>
              <dd className="text-foreground font-medium">-${ticket.depositAmount}</dd>
            </div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between">
              <dt className="font-semibold text-foreground">Balance Due</dt>
              <dd className="font-bold text-primary text-lg">${ticket.balance}</dd>
            </div>
          </dl>
        </Card>

        {/* Contact CTA */}
        <Card className="p-6 mt-8 border-primary bg-primary/5">
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">Questions About Your Repair?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact us directly for more information about your repair status.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="tel:+15550000000" className="flex items-center justify-center gap-2 text-primary hover:opacity-80 transition">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+1 (555) 000-0000</span>
              </Link>
              <Link href="mailto:support@infernorepair.com" className="flex items-center justify-center gap-2 text-primary hover:opacity-80 transition">
                <Mail className="h-4 w-4" />
                <span className="text-sm">support@infernorepair.com</span>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
