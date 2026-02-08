"use client";

import {
  FolderKanban,
  TrendingUp,
  Zap,
  Clock,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StreamingCounter } from "@/components/streaming-counter";

export function FreelancerOverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Ongoing Projects
            </p>
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              3 streaming
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-foreground">24.8 USDC</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-dot" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Currently Streaming
            </p>
            <div className="text-2xl font-bold text-foreground">
              <StreamingCounter
                baseValue={0.847}
                ratePerSecond={0.00005}
                suffix=" USDC"
                decimals={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Avg Hourly Rate
            </p>
            <p className="text-2xl font-bold text-foreground">0.035 USDC</p>
            <p className="text-xs text-muted-foreground mt-1">~$59.50/hr</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Pending Requests
            </p>
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-xs text-accent mt-1">Action needed</p>
          </CardContent>
        </Card>
      </div>
  );
}
