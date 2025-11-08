"use client"

import { MessageCircle, Phone, CheckCircle2, Search } from "lucide-react"
import { useState } from "react"

// const professionalsData = [
//   { id: 1, name: "Amit Kumar", role: "Broker", verified: true, phone: "+91-9876543210", rating: 4.8 },
//   { id: 2, name: "Priya Sharma", role: "Developer", verified: true, phone: "+91-9876543211", rating: 4.9 },
//   { id: 3, name: "Rajesh Patel", role: "Architect", verified: false, phone: "+91-9876543212", rating: 4.5 },
//   { id: 4, name: "Neha Singh", role: "Channel Partner", verified: true, phone: "+91-9876543213", rating: 4.7 },
//   { id: 5, name: "Vikram Verma", role: "Lawyer", verified: true, phone: "+91-9876543214", rating: 4.6 },
// ]

const roles = ["All", "Channel Partners", "Developers", "Brokers", "Architects", "Lawyers"]

export default function ProfessionalsTab({ territory }: any) {
  const [selectedRole, setSelectedRole] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const professionalsData = territory.people || []

  const filtered = professionalsData.filter((p) => {
    const roleMatch = selectedRole === "All" || p.type === selectedRole
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return roleMatch && searchMatch
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search professionals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-secondary text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
              selectedRole === role
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Professionals List */}
      <div className="space-y-3">
        {filtered.map((prof) => (
          <div
            key={prof.id}
            className="bg-secondary rounded-lg p-3 border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">{prof.name}</h4>
                  {prof.verified && <CheckCircle2 size={14} className="text-accent flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{prof.designation}</p>
              </div>
              <span className="text-xs font-semibold text-foreground bg-accent/20 px-2 py-1 rounded">
                ★ {prof.rating}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground rounded px-2 py-1 text-xs font-medium hover:bg-primary/90 transition-colors">
                <MessageCircle size={12} />
                Chat
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 bg-secondary border border-border text-foreground rounded px-2 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
                <Phone size={12} />
                Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
