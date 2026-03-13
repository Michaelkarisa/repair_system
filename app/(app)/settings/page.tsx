"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShop, updateShop, exportShopData } from "@/lib/actions/shop";
import { listTeamMembers, inviteTeamMember, updateTeamMember, removeTeamMember } from "@/lib/actions/team";
import { getSubscription, upsertSubscription, cancelSubscription } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, UserX, CheckCircle2, Crown, Mail, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getPlanPrice, getPlanFeatures, type PlanType } from "@/lib/billing-utils";
import {
  ROLE_LABELS, ROLE_DESCRIPTIONS, MANAGEMENT_ROLES,
  type TeamMemberRole, type TeamMember, type Shop, type Subscription,
} from "@/lib/types";

const ALL_ROLES: TeamMemberRole[] = [
  "admin", "manager", "technician", "partsspecialist", "customersupport", "frontdesk",
];

const STATUS_COLORS: Record<string, string> = {
  active:   "border-green-400 text-green-600",
  pending:  "border-amber-400 text-amber-600",
  inactive: "border-gray-300 text-gray-500",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile
  const [shop,    setShop]    = useState<Partial<Shop>>({});
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  // Team
  const [team,       setTeam]       = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [newMember,  setNewMember]  = useState({ name: "", email: "", phone: "", role: "technician" as TeamMemberRole });
  const [inviting,   setInviting]   = useState(false);

  // Billing
  const [sub,        setSub]        = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [planOp,     setPlanOp]     = useState(false);

  const isPrivileged = user?.role ? MANAGEMENT_ROLES.includes(user.role) : false;

  // Load shop
  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await getShop(user.shop_id, user.access_token);
      if (res.data) setShop(res.data as Shop);
      setLoading(false);
    })();
  }, [user]);

  // Load team
  const loadTeam = useCallback(async () => {
    if (!user) return;
    setTeamLoading(true);
    const res = await listTeamMembers(user.shop_id, user.access_token);
    setTeam(res.data as TeamMember[]);
    setTeamLoading(false);
  }, [user]);
  useEffect(() => { loadTeam(); }, [loadTeam]);

  // Load subscription (only for privileged roles)
  useEffect(() => {
    if (!user || !isPrivileged) { setSubLoading(false); return; }
    (async () => {
      const res = await getSubscription(user.shop_id, user.access_token);
      if (res.data) setSub(res.data as Subscription);
      setSubLoading(false);
    })();
  }, [user, isPrivileged]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isPrivileged) return;
    setSaving(true);
    const res = await updateShop(user.shop_id, user.access_token, {
      name: shop.name,
      support_email: shop.support_email ?? null,
      phone: shop.phone ?? null,
      country: shop.country ?? null,
      currency_code: shop.currency_code,
      timezone: shop.timezone,
    });
    setSaving(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to save profile", { description: msg });
    } else {
      toast.success("Shop profile saved");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMember.name.trim() || !newMember.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setInviting(true);
    const res = await inviteTeamMember(user.shop_id, user.access_token, {
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      role: newMember.role,
      phone: newMember.phone.trim() || undefined,
    });
    setInviting(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      const isDupe = msg.toLowerCase().includes("duplicate") || msg.includes("unique");
      toast.error(isDupe ? "A team member with this email already exists" : "Failed to invite member", { description: msg });
    } else {
      toast.success(`Invite created for ${newMember.email}`, {
        description: "They will receive access once their account is set up in Supabase Auth.",
      });
      setNewMember({ name: "", email: "", phone: "", role: "technician" });
      setShowInvite(false);
      loadTeam();
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (!user) return;
    const res = await removeTeamMember(id, user.shop_id, user.access_token);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to remove member", { description: msg });
    } else {
      toast.success(`${name} has been deactivated`);
      loadTeam();
    }
  };

  const handleChangePlan = async (plan: PlanType) => {
    if (!user) return;
    setPlanOp(true);
    const res = await upsertSubscription(user.shop_id, user.access_token, {
      plan: plan as any,
      status: "active",
      billing_cycle: "monthly",
      auto_renew: true,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    setPlanOp(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to change plan", { description: msg });
    } else {
      setSub(res.data as Subscription);
      toast.success(`Plan updated to ${plan}`);
    }
  };

  const handleCancelSub = async () => {
    if (!user) return;
    setPlanOp(true);
    const res = await cancelSubscription(user.shop_id, user.access_token);
    setPlanOp(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to cancel subscription", { description: msg });
    } else {
      setSub(res.data as Subscription);
      toast.info("Subscription cancelled. Access continues until end of billing period.");
    }
  };

  const handleExport = async () => {
    if (!user) return;
    const res = await exportShopData(user.shop_id, user.access_token);
    if (res.error) { toast.error("Export failed"); return; }
    const json = JSON.stringify(res.data, null, 2);
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    a.download = `inferno-repair-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Data exported");
  };

  const planCards: PlanType[] = ["starter", "professional", "enterprise"];
  const currentPlan = (sub?.plan ?? "starter") as PlanType;

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your shop settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full mb-6 ${isPrivileged ? "grid-cols-4" : "grid-cols-2"}`}>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            {isPrivileged && <TabsTrigger value="billing">Billing</TabsTrigger>}
            {isPrivileged && <TabsTrigger value="data">Data</TabsTrigger>}
          </TabsList>

          {/* ── Profile ── */}
          <TabsContent value="profile">
            <Card className="p-6 border-border max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-5">Shop Profile</h2>
              {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} />)}</div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Shop Name</Label>
                    <Input value={shop.name ?? ""} onChange={e => setShop(p => ({ ...p, name: e.target.value }))}
                      className="border-border" disabled={saving || !isPrivileged} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Phone</Label>
                      <Input value={shop.phone ?? ""} onChange={e => setShop(p => ({ ...p, phone: e.target.value }))}
                        className="border-border" disabled={saving || !isPrivileged} />
                    </div>
                    <div className="space-y-1">
                      <Label>Support Email</Label>
                      <Input type="email" value={shop.support_email ?? ""} onChange={e => setShop(p => ({ ...p, support_email: e.target.value }))}
                        className="border-border" disabled={saving || !isPrivileged} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Currency Code</Label>
                      <Input value={shop.currency_code ?? "KES"} onChange={e => setShop(p => ({ ...p, currency_code: e.target.value }))}
                        className="border-border" disabled={saving || !isPrivileged} />
                    </div>
                    <div className="space-y-1">
                      <Label>Timezone</Label>
                      <Input value={shop.timezone ?? "Africa/Nairobi"} onChange={e => setShop(p => ({ ...p, timezone: e.target.value }))}
                        className="border-border" disabled={saving || !isPrivileged} />
                    </div>
                  </div>
                  {isPrivileged && (
                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  )}
                </form>
              )}
            </Card>
          </TabsContent>

          {/* ── Team ── */}
          <TabsContent value="team">
            <div className="space-y-4 max-w-3xl">
              <Card className="p-6 border-border">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
                    <p className="text-sm text-muted-foreground">{team.length} member{team.length !== 1 ? "s" : ""}</p>
                  </div>
                  {isPrivileged && (
                    <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setShowInvite(v => !v)}>
                      <Plus className="h-4 w-4" /> Invite Member
                    </Button>
                  )}
                </div>

                {/* Invite form */}
                {showInvite && isPrivileged && (
                  <Card className="p-4 bg-muted/40 border border-border mb-5">
                    <h3 className="font-semibold text-sm text-foreground mb-3">New Team Member</h3>
                    <form onSubmit={handleInvite} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Full Name *</Label>
                          <Input value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                            placeholder="Jane Doe" className="border-border" disabled={inviting} />
                        </div>
                        <div className="space-y-1">
                          <Label>Email *</Label>
                          <Input type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))}
                            placeholder="jane@shop.com" className="border-border" disabled={inviting} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Phone (optional)</Label>
                          <Input value={newMember.phone} onChange={e => setNewMember(p => ({ ...p, phone: e.target.value }))}
                            placeholder="+254 700 000 000" className="border-border" disabled={inviting} />
                        </div>
                        <div className="space-y-1">
                          <Label>Role *</Label>
                          <select value={newMember.role}
                            onChange={e => setNewMember(p => ({ ...p, role: e.target.value as TeamMemberRole }))}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                            disabled={inviting}>
                            {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                        </div>
                      </div>
                      {newMember.role && (
                        <p className="text-xs text-muted-foreground bg-background rounded px-3 py-2 border border-border">
                          {ROLE_DESCRIPTIONS[newMember.role]}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={inviting} size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                          {inviting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                          {inviting ? "Inviting…" : "Send Invite"}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowInvite(false)}>Cancel</Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* Member list */}
                {teamLoading ? (
                  <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {team.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">{m.name}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border font-semibold ${STATUS_COLORS[m.status] ?? ""}`}>
                                {m.status}
                              </Badge>
                              {m.id === user?.team_member_id && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">You</Badge>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{m.email}</span>
                              <span className="text-xs bg-primary/10 text-primary rounded px-1.5 font-semibold">{ROLE_LABELS[m.role]}</span>
                            </div>
                          </div>
                        </div>
                        {isPrivileged && m.id !== user?.team_member_id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-1">
                                <UserX className="h-3.5 w-3.5" /> Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove {m.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Their status will be set to inactive. They will lose dashboard access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleRemoveMember(m.id, m.name)}>
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ── Billing ── */}
          {isPrivileged && (
            <TabsContent value="billing">
              <div className="space-y-5 max-w-3xl">
                <Card className="p-6 border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
                  {subLoading ? (
                    <div className="h-32 bg-muted animate-pulse rounded-lg" />
                  ) : (
                    <>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="h-4 w-4 text-primary" />
                          <span className="font-bold text-foreground capitalize">{currentPlan} Plan</span>
                          {sub?.status && <Badge variant="outline" className={`text-[10px] px-1.5 font-semibold ${
                            sub.status === "active" ? "border-green-400 text-green-600" :
                            sub.status === "trialing" ? "border-blue-400 text-blue-600" :
                            "border-gray-300 text-gray-500"
                          }`}>{sub.status}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">${getPlanPrice(currentPlan)}/month · {sub?.billing_cycle ?? "monthly"}</p>
                        {sub?.current_period_end && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Next billing: {new Date(sub.current_period_end).toLocaleDateString()}
                          </p>
                        )}
                        <ul className="mt-3 space-y-1">
                          {getPlanFeatures(currentPlan).map((f, i) => (
                            <li key={i} className="text-sm text-foreground flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        {sub?.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-destructive/60 text-destructive hover:bg-destructive/10">
                                Cancel Subscription
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You'll retain access until end of the current billing period.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleCancelSub}>
                                  {planOp ? "Cancelling…" : "Yes, Cancel"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </>
                  )}
                </Card>

                <Card className="p-6 border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Change Plan</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {planCards.map(plan => (
                      <Card key={plan} className={`p-4 border-2 ${currentPlan === plan ? "border-primary bg-primary/5" : "border-border"}`}>
                        <div className="font-bold text-foreground capitalize mb-1">{plan}</div>
                        <div className="text-2xl font-extrabold text-primary mb-1">
                          ${getPlanPrice(plan)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-1 mb-4">
                          {getPlanFeatures(plan).map((f, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />{f}
                            </li>
                          ))}
                        </ul>
                        {currentPlan === plan ? (
                          <Button disabled className="w-full bg-primary/50 text-xs">Current Plan</Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="w-full bg-primary hover:bg-primary/90 text-xs" disabled={planOp}>
                                {getPlanPrice(plan) > getPlanPrice(currentPlan) ? "Upgrade" : "Downgrade"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Switch to {plan}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You'll be charged ${getPlanPrice(plan)}/month.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-primary hover:bg-primary/90" onClick={() => handleChangePlan(plan)}>
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* ── Data ── */}
          {isPrivileged && (
            <TabsContent value="data">
              <Card className="p-6 border-border max-w-2xl">
                <h2 className="text-lg font-semibold text-foreground mb-5">Data Management</h2>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-1">Export All Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download all customers, tickets, invoices, payments, and team data as JSON.
                    </p>
                    <Button variant="outline" className="border-border" onClick={handleExport}>
                      Export as JSON
                    </Button>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-1">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete all shop data. Contact support to proceed.
                    </p>
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => toast.error("Please contact support@infernorepair.com to request data deletion.")}>
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}


