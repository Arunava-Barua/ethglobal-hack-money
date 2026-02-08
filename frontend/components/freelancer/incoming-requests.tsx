"use client";

import { Check, X, Bot, Hand } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ContractRequest {
  id: string;
  contractorName: string;
  contractorInitials: string;
  projectTitle: string;
  budget: string;
  duration: string;
  mode: "agentic" | "manual";
}

const mockRequests: ContractRequest[] = [
  {
    id: "1",
    contractorName: "TechStart Inc",
    contractorInitials: "TS",
    projectTitle: "Yield Aggregator Frontend",
    budget: "6.0 USDC",
    duration: "2 months",
    mode: "agentic",
  },
  {
    id: "2",
    contractorName: "DeFi Labs",
    contractorInitials: "DL",
    projectTitle: "Liquidity Pool Dashboard",
    budget: "4.5 USDC",
    duration: "6 weeks",
    mode: "manual",
  },
  {
    id: "3",
    contractorName: "Web3 Studio",
    contractorInitials: "W3",
    projectTitle: "Cross-chain Bridge UI",
    budget: "8.0 USDC",
    duration: "3 months",
    mode: "agentic",
  },
];

export function IncomingRequests() {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Incoming Contract Requests
          </CardTitle>
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            {mockRequests.length} pending
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {req.contractorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {req.projectTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {req.contractorName}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                  {req.mode === "agentic" ? (
                    <Bot className="w-3 h-3" />
                  ) : (
                    <Hand className="w-3 h-3" />
                  )}
                  {req.mode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Budget:{" "}
                    <span className="font-semibold text-foreground">
                      {req.budget}
                    </span>
                  </span>
                  <span>
                    Duration:{" "}
                    <span className="font-semibold text-foreground">
                      {req.duration}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                  >
                    <X className="w-3 h-3" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
