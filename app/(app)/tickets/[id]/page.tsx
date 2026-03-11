"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTicketById } from "@/lib/mock-api";
import { Ticket } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { TicketStatusTimeline } from "@/components/ticket-status-timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Smartphone, User, FileText, DollarSign } from "lucide-react";

interface TicketDetailsPageProps {
  params: {
    id: string;
  };
}

export default function TicketDetailsPage({ params }: TicketDetailsPageProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTicketById(params.id);
        setTicket(data);
      } catch (err) {
        setError("Failed to load ticket details");
      } finally {
        setIsLoading(false);
      }
    };

    loadTicket();
  }, [params.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !ticket) return;

    setIsAddingNote(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("[v0] Note added:", noteInput);
    setTicket({
      ...ticket,
      notes: [...ticket.notes, noteInput],
    });
    setNoteInput("");
    setIsAddingNote(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="p-8 text-center border-border">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/tickets">Back to Tickets</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/tickets"
          className="flex items-center gap-2 text-primary hover:opacity-80 transition mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back to Tickets</span>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {ticket.ticketNumber}
            </h1>
            <p className="text-muted-foreground">
              {ticket.deviceBrand} {ticket.deviceModel}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Status Timeline */}
        <Card className="p-6 mb-8 border-border">
          <h2 className="text-sm font-semibold text-foreground mb-4">Repair Progress</h2>
          <TicketStatusTimeline
            currentStatus={ticket.status}
            completedDate={ticket.completedDate}
          />
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Device Information */}
          <Card className="p-6 border-border lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Device Information
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  Device Type
                </dt>
                <dd className="text-foreground font-medium">
                  {ticket.deviceType}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  Model
                </dt>
                <dd className="text-foreground font-medium">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  IMEI / Serial
                </dt>
                <dd className="font-mono text-sm text-foreground">
                  {ticket.imeiSerial}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  Issue Description
                </dt>
                <dd className="text-foreground">
                  {ticket.issueDescription}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  Condition Notes
                </dt>
                <dd className="text-foreground">
                  {ticket.conditionNotes}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Cost Summary */}
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Cost Summary
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Labor
                </dt>
                <dd className="text-lg font-semibold text-foreground">
                  ${ticket.labor}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Parts
                </dt>
                <dd className="text-lg font-semibold text-foreground">
                  ${ticket.parts}
                </dd>
              </div>
              <div className="border-t border-border pt-3">
                <dt className="text-xs font-medium text-muted-foreground">
                  Deposit Paid
                </dt>
                <dd className="text-lg font-semibold text-green-600">
                  -${ticket.depositAmount}
                </dd>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <dt className="text-xs font-medium text-muted-foreground">
                  Balance Due
                </dt>
                <dd className="text-2xl font-bold text-primary">
                  ${ticket.balance}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Warranty & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Warranty Information */}
          {ticket.warranty?.enabled && (
            <Card className="p-6 border-border bg-green-50">
              <h3 className="font-semibold text-green-900 mb-2">
                Warranty Coverage
              </h3>
              <p className="text-sm text-green-700">
                Valid until {formatDate(ticket.warranty.expiryDate)}
              </p>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Received
                </dt>
                <dd className="text-foreground">
                  {formatDate(ticket.createdDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Estimated Completion
                </dt>
                <dd className="text-foreground">
                  {formatDate(ticket.estimatedDate)}
                </dd>
              </div>
              {ticket.completedDate && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Completed
                  </dt>
                  <dd className="text-foreground">
                    {formatDate(ticket.completedDate)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        {/* Notes Section */}
        <Card className="p-6 border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Notes & Activity
          </h3>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="mb-6 pb-6 border-b border-border">
            <div className="space-y-2">
              <Label htmlFor="note" className="text-foreground">
                Add a Note
              </Label>
              <div className="flex gap-2">
                <Textarea
                  id="note"
                  placeholder="Add update about this repair..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="border-border min-h-20 flex-1"
                  disabled={isAddingNote}
                />
              </div>
              <Button
                type="submit"
                disabled={!noteInput.trim() || isAddingNote}
                className="bg-primary hover:bg-primary/90 w-full md:w-auto"
              >
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </form>

          {/* Existing Notes */}
          <div className="space-y-3">
            {ticket.notes.length > 0 ? (
              ticket.notes.map((note, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-foreground">{note}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
