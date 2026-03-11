"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

export function NewTicketModal({
  open,
  onOpenChange,
  onSubmit,
}: NewTicketModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    deviceType: "iPhone",
    deviceBrand: "",
    deviceModel: "",
    imeiSerial: "",
    issueDescription: "",
    conditionNotes: "",
    depositAmount: "0",
    estimatedCost: "0",
    technician: "tech-001",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const ticketCode = `TK-${Math.random().toString().slice(2, 6).padStart(3, "0")}`;
    console.log("[v0] New ticket created:", { ...formData, ticketCode });

    setIsLoading(false);
    setFormData({
      customerName: "",
      phone: "",
      deviceType: "iPhone",
      deviceBrand: "",
      deviceModel: "",
      imeiSerial: "",
      issueDescription: "",
      conditionNotes: "",
      depositAmount: "0",
      estimatedCost: "0",
      technician: "tech-001",
    });
    onOpenChange(false);

    // Show success toast
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Ticket</DialogTitle>
          <DialogDescription>
            Enter repair details to create a new ticket
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName" className="text-foreground">
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Device Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deviceType" className="text-foreground">
                  Device Type
                </Label>
                <Select
                  value={formData.deviceType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, deviceType: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iPhone">iPhone</SelectItem>
                    <SelectItem value="iPad">iPad</SelectItem>
                    <SelectItem value="MacBook">MacBook</SelectItem>
                    <SelectItem value="Samsung Galaxy">Samsung Galaxy</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deviceBrand" className="text-foreground">
                  Brand
                </Label>
                <Input
                  id="deviceBrand"
                  placeholder="Apple"
                  value={formData.deviceBrand}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceBrand: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="deviceModel" className="text-foreground">
                  Model
                </Label>
                <Input
                  id="deviceModel"
                  placeholder="iPhone 15 Pro"
                  value={formData.deviceModel}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceModel: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="imeiSerial" className="text-foreground">
                  IMEI / Serial
                </Label>
                <Input
                  id="imeiSerial"
                  placeholder="123456789"
                  value={formData.imeiSerial}
                  onChange={(e) =>
                    setFormData({ ...formData, imeiSerial: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Repair Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Repair Details</h3>
            <div>
              <Label htmlFor="issueDescription" className="text-foreground">
                Issue Description
              </Label>
              <Textarea
                id="issueDescription"
                placeholder="Describe the issue with the device"
                value={formData.issueDescription}
                onChange={(e) =>
                  setFormData({ ...formData, issueDescription: e.target.value })
                }
                className="border-border min-h-20"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="conditionNotes" className="text-foreground">
                Condition Notes
              </Label>
              <Textarea
                id="conditionNotes"
                placeholder="Any notes about the device condition"
                value={formData.conditionNotes}
                onChange={(e) =>
                  setFormData({ ...formData, conditionNotes: e.target.value })
                }
                className="border-border min-h-20"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Cost & Assignment */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Cost & Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="depositAmount" className="text-foreground">
                  Deposit Amount
                </Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, depositAmount: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="estimatedCost" className="text-foreground">
                  Estimated Cost
                </Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="0"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedCost: e.target.value })
                  }
                  className="border-border"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="technician" className="text-foreground">
                  Assign To
                </Label>
                <Select
                  value={formData.technician}
                  onValueChange={(value) =>
                    setFormData({ ...formData, technician: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech-001">Alex Johnson</SelectItem>
                    <SelectItem value="tech-002">Maria Garcia</SelectItem>
                    <SelectItem value="tech-003">James Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
