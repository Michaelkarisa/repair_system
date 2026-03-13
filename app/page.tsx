import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/feature-card';
import { PricingCard } from '@/components/pricing-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Zap,
  BarChart3,
  Users,
  Bell,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Inferno Repair - Professional Electronics Repair Management',
  description: 'Manage your electronics repair shop with our all-in-one platform. Track tickets, customers, and invoices in real-time.',
};

export default function LandingPage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">IR</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">Inferno Repair</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/track" className="text-sm text-muted-foreground hover:text-foreground transition">
              Track Repair
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
              Sign In
            </Link>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">New Features Available</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Repair Management,{' '}
              <span className="text-primary">Simplified</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The all-in-one platform for electronics repair shops. Manage tickets, track customers, handle invoicing, and grow your business—all from one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="/register" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-muted"
              >
                <Link href="/track">View Demo</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="bg-muted/50 rounded-lg px-6 py-4 inline-flex gap-8 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground font-medium">250+ Shops</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground font-medium">50K+ Repairs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful tools to run your repair shop efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Smart Ticketing"
                description="Create, track, and manage repair tickets with ease"
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Customer Management"
                description="Keep detailed customer records and history"
              />
              <FeatureCard
                icon={<Bell className="h-6 w-6" />}
                title="Real-time Updates"
                description="Notify customers instantly about repairs"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Fast & Reliable"
                description="Lightning-fast performance when you need it"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold text-foreground mb-2">Create a Ticket</h3>
                <p className="text-muted-foreground">
                  Log device information and repair details instantly
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold text-foreground mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor repairs and update status in real-time
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold text-foreground mb-2">Generate Invoice</h3>
                <p className="text-muted-foreground">
                  Create professional invoices and close tickets
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that works for your business
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard
                name="Starter"
                price="$29"
                description="Perfect for small shops"
                features={[
                  'Up to 50 repairs/month',
                  'Basic ticketing',
                  'Customer management',
                  'Email support',
                ]}
              />
              <PricingCard
                name="Professional"
                price="$79"
                description="For growing businesses"
                features={[
                  'Unlimited repairs',
                  'Advanced ticketing',
                  'Full customer management',
                  'Invoicing system',
                  'Priority support',
                ]}
                highlighted
              />
              <PricingCard
                name="Enterprise"
                price="$129"
                description="For large operations"
                features={[
                  'Everything in Professional',
                  'Team management',
                  'Custom workflows',
                  'Advanced analytics',
                  '24/7 Support',
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-primary">
                  Can I try Inferno Repair for free?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We offer a 14-day free trial with full access to all features. No credit card required.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-primary">
                  Is my data secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. We use enterprise-grade encryption and comply with GDPR and SOC 2 standards.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-primary">
                  Can I export my data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, you can export all your data in CSV or JSON format at any time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border">
                <AccordionTrigger className="text-foreground hover:text-primary">
                  What support options are available?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We offer email support for all plans, with phone and live chat available for Professional and Enterprise tiers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Repairs?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join hundreds of repair shops already using Inferno Repair to grow their business
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/register">Start Your Free Trial</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
