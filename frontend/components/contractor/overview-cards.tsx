"use client";

import {
  Users, FileText, Wallet, Zap, TrendingDown, Bot,
  Github, CheckCircle2, ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreamingCounter } from "@/components/streaming-counter";
import { useGitHub } from "@/components/github-provider";
import { GITHUB_APP_SLUG } from "@/lib/github";

const stats = [
  {
    label: "Total Active Freelancers",
    value: "12",
    icon: Users,
    change: "+2 this month",
    positive: true,
  },
  {
    label: "Active Contracts",
    value: "8",
    icon: FileText,
    change: "3 pending",
    positive: true,
  },
  {
    label: "Total Budget Allocated",
    value: "$124,500",
    icon: Wallet,
    change: "68% utilized",
    positive: true,
  },
  {
    label: "Total Streaming Payout",
    value: "streaming",
    icon: Zap,
    change: "Live",
    positive: true,
    isStreaming: true,
  },
  {
    label: "Avg Burn Rate / Day",
    value: "$1,240",
    icon: TrendingDown,
    change: "-5% vs last week",
    positive: false,
  },
  {
    label: "Agentic vs Manual",
    value: "62% / 38%",
    icon: Bot,
    change: "5 agentic, 3 manual",
    positive: true,
  },
];

export function ContractorOverviewCards() {
  const { isConnected, installationId, connect, disconnect } = useGitHub();

  return (
    <div className="space-y-4">
      {/* GitHub Banner */}
      {isConnected ? (
        <Card className="bg-gradient-to-r from-card to-emerald-500/5 border border-emerald-500/20 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  GitHub Connected
                </p>
                <p className="text-xs text-muted-foreground">
                  Installation ID: {installationId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2" asChild>
                <a
                  href={`https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Manage
                </a>
              </Button>
              <Button size="sm" variant="ghost" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-card to-primary/5 border border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Github className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Connect your GitHub
                </p>
                <p className="text-xs text-muted-foreground">
                  Link your repos for agentic milestone verification
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
              onClick={connect}
            >
              <Github className="w-4 h-4" />
              Connect
            </Button>
          </CardContent>
        </Card>
      )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              {stat.isStreaming && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-dot" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            {stat.isStreaming ? (
              <div className="text-2xl font-bold text-foreground">
                <StreamingCounter
                  baseValue={45.234}
                  ratePerSecond={0.0001}
                  suffix=" USDC"
                  decimals={4}
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            )}
            <p
              className={`text-xs mt-1 ${stat.positive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
            >
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
  );
}
