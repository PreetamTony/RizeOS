import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  Wallet, 
  Users, 
  ArrowRight,
  Zap,
  Shield,
  Globe,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Our advanced AI analyzes your skills and experience to match you with the perfect opportunities.',
  },
  {
    icon: Wallet,
    title: 'Web3 Payments',
    description: 'Secure blockchain-based payments with support for Ethereum and Solana networks.',
  },
  {
    icon: Users,
    title: 'Professional Network',
    description: 'Connect with like-minded professionals, share insights, and grow your career network.',
  },
  {
    icon: Zap,
    title: 'Instant Applications',
    description: 'Apply to jobs with a single click using your pre-filled profile and AI-generated cover letters.',
  },
];

const stats = [
  { value: '50K+', label: 'Active Jobs' },
  { value: '100K+', label: 'Professionals' },
  { value: '5K+', label: 'Companies' },
  { value: '98%', label: 'Match Rate' },
];

const Index: React.FC = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Powered by AI & Blockchain</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6 animate-fade-in animation-delay-100">
              Find Your Next{' '}
              <span className="gradient-text">Dream Job</span>
              <br />
              with AI Precision
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in animation-delay-200">
              JobMate connects talented professionals with innovative companies using 
              cutting-edge AI matching and secure Web3 payments.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-300">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login" className="gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/jobs">
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in animation-delay-400">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold font-display gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-muted-foreground">
              From AI-powered job matching to secure blockchain payments, we've got all the tools 
              you need to take your career to the next level.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  hover 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-glow">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold font-display mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              How It{' '}
              <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground">
              Get started in minutes and find your perfect match with our streamlined process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up and let our AI extract skills from your resume to build a comprehensive profile.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Get AI Matches',
                description: 'Our AI analyzes job requirements and your profile to find the best opportunities for you.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Connect & Apply',
                description: 'Apply with one click, connect your wallet, and get paid securely through blockchain.',
                icon: TrendingUp,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step} 
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-7xl font-bold font-display text-primary/10 absolute -top-6 -left-2">
                    {item.step}
                  </div>
                  <div className="relative pt-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold font-display mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-6">
                Built for the{' '}
                <span className="gradient-text">Future of Work</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                We're combining the best of Web3 technology with AI to create a transparent, 
                secure, and efficient job marketplace. Your data, your control.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Secure blockchain-verified transactions' },
                  { icon: Globe, text: 'Access opportunities worldwide' },
                  { icon: Zap, text: 'Lightning-fast AI matching' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-foreground">{item.text}</span>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="hero" size="lg" className="mt-8" asChild>
                <Link to="/connect-wallet" className="gap-2">
                  <Wallet className="w-5 h-5" />
                  Connect Your Wallet
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-card/80 backdrop-blur-xl border-border/50">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent" />
                      <div>
                        <div className="font-semibold">Smart Contract Verified</div>
                        <div className="text-sm text-muted-foreground">Transaction secured on-chain</div>
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold font-display">0.00001 ETH</div>
                        <div className="text-sm text-muted-foreground">Platform Fee</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-display text-success">Instant</div>
                        <div className="text-sm text-muted-foreground">Settlement</div>
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Supported Networks</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">Ethereum</span>
                        <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">Solana</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-6">
            Ready to Find Your{' '}
            <span className="gradient-text">Perfect Match?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through JobMate's 
            AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/login" className="gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/jobs">
                Explore Opportunities
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
