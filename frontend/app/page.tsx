'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Code2, Zap, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConnectWallet } from '@/components/connect-wallet'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-20">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base">F</span>
              </div>
              <span className="font-semibold text-foreground text-xl tracking-tight">StarcPay</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                About
              </Button>
              <ConnectWallet variant="landing" />
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Powered by Web3 Streaming Payments
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Streamlined Contracts.{' '}
              <span className="text-primary">Real-time Pay.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect contractors and freelancers with transparent, automated streaming payments.
              Manage projects, milestones, and payouts — all on-chain.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Contractor Card */}
            <Link href="/contractor/dashboard">
              <Card className="group relative overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 bg-card">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">I'm a Contractor</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Post projects, manage freelancers, initiate streaming payments, and track milestones with agentic or manual evaluation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Manage Projects', 'Stream Payments', 'Track Budgets'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Freelancer Card */}
            <Link href="/freelancer/dashboard">
              <Card className="group relative overflow-hidden border border-border hover:border-accent/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-accent/5 bg-card">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                      <Code2 className="w-7 h-7 text-accent" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">I'm a Freelancer</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Accept contracts, get paid in real-time via streaming, connect your GitHub, and track your earnings across projects.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Accept Contracts', 'Real-time Earnings', 'Track Projects'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            {[
              { icon: Zap, label: 'Streaming Payments', desc: 'Pay-per-second via on-chain streams' },
              { icon: Shield, label: 'Agentic Evaluation', desc: 'AI-powered milestone verification' },
              { icon: TrendingUp, label: 'Real-time Analytics', desc: 'Live dashboards & burn tracking' },
            ].map((feature) => (
              <div key={feature.label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.label}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
