"use client"

import { User, Phone, Mail, Users } from "lucide-react"

export default function GovernanceTab() {
  return (
    <div className="space-y-4">
      <div className="bg-secondary rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <User size={16} />
          Territory Head
        </h4>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Rajesh Kumar</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone size={14} />
            <span>+91-9876543210</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={14} />
            <span>rajesh@realestate.com</span>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Users size={16} />
          Active Contributors
        </h4>
        <p className="text-sm font-semibold text-accent mb-3">48 active members</p>
        <button className="w-full bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
          Join Governance
        </button>
      </div>

      <div className="bg-secondary rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-sm text-foreground mb-3">Engagement Metrics</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">Engagement Score</span>
              <span className="font-semibold text-foreground">8.5/10</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verifications</span>
              <span className="font-semibold text-foreground">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leads Generated</span>
              <span className="font-semibold text-foreground">1,265</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Events Hosted</span>
              <span className="font-semibold text-foreground">24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
