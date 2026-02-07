'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Display Name</Label>
              <Input defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company</Label>
              <Input defaultValue="TechStart Inc" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" defaultValue="john@techstart.io" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Contract updates', description: 'When a contract status changes', defaultChecked: true },
            { label: 'Payment notifications', description: 'When a stream starts, pauses, or completes', defaultChecked: true },
            { label: 'Milestone completions', description: 'When a freelancer completes a milestone', defaultChecked: true },
            { label: 'Weekly summary', description: 'Weekly digest of all activity', defaultChecked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wallet */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Wallet Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Payment Token</Label>
            <Input defaultValue="USDC" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Streaming Network</Label>
            <Input defaultValue="ARC Testnet" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-approve agentic milestones</p>
              <p className="text-xs text-muted-foreground">Automatically release funds when agent verifies completion</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
      </div>
    </div>
  )
}
