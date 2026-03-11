"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[v0] Profile saved");
    setIsSaving(false);
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to reset all demo data? This cannot be undone.")) {
      setIsResetting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("[v0] Demo data reset");
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your shop settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 border-b border-border bg-transparent">
            <TabsTrigger
              value="profile"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6 border-border max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Shop Profile
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName" className="text-foreground">
                    Shop Name
                  </Label>
                  <Input
                    id="shopName"
                    defaultValue="Inferno Repair"
                    className="border-border"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">
                    Address
                  </Label>
                  <Input
                    id="address"
                    defaultValue="123 Main Street, New York, NY 10001"
                    className="border-border"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    defaultValue="+1 (555) 000-0000"
                    className="border-border"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="support@infernorepair.com"
                    className="border-border"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Shop Description
                  </Label>
                  <Textarea
                    id="description"
                    defaultValue="Professional electronics repair shop specializing in phones, tablets, and laptops."
                    className="border-border min-h-24"
                    disabled={isSaving}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-6">
            <Card className="p-6 border-border max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Team Members
              </h2>

              <div className="space-y-4">
                {[
                  { name: "Alex Johnson", role: "Senior Technician", email: "alex@infernorepair.com" },
                  { name: "Maria Garcia", role: "Technician", email: "maria@infernorepair.com" },
                  { name: "James Lee", role: "Technician", email: "james@infernorepair.com" },
                ].map((member, index) => (
                  <Card key={index} className="p-4 bg-muted/50 border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border"
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}

                <Button className="w-full bg-primary hover:bg-primary/90">
                  + Add Team Member
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-6">
            <Card className="p-6 border-border max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Plan & Billing
              </h2>

              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-foreground">
                    Professional Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    $79/month • Billed monthly
                  </p>
                  <p className="text-sm text-foreground mt-2">
                    Next billing date: <strong>April 1, 2025</strong>
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">
                    Plan Features
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Unlimited tickets</li>
                    <li>✓ 20 team members</li>
                    <li>✓ Advanced analytics</li>
                    <li>✓ Priority support</li>
                    <li>✓ Inventory management</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="bg-primary hover:bg-primary/90">
                    Update Payment Method
                  </Button>
                  <Button variant="outline" className="border-border">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="mt-6">
            <Card className="p-6 border-border max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Data Management
              </h2>

              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">
                    Export Your Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your shop data in CSV format
                  </p>
                  <Button variant="outline" className="border-border">
                    Export as CSV
                  </Button>
                </div>

                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h3 className="font-medium text-foreground mb-2">
                    Reset Demo Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Clear all sample data and start fresh. This action cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleResetData}
                    disabled={isResetting}
                  >
                    {isResetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isResetting ? "Resetting..." : <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset Data
                    </>}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
