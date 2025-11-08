"use client"

import { MapPin, HandshakeIcon } from "lucide-react"

const opportunitiesData = [
  {
    id: 1,
    type: "Buyer Requirement",
    title: "Seeking 3BHK Premium Apartment",
    details: "Budget: ₹2-3Cr, Ready to move",
  },
  {
    id: 2,
    type: "Land Parcel",
    title: "5 Acres Commercial Plot Available",
    details: "Location: South Delhi, Prime location",
  },
  { id: 3, type: "Rental Requirement", title: "Furnished 2BHK Apartment", details: "Budget: ₹50k/month, Immediate" },
  {
    id: 4,
    type: "Joint Development",
    title: "Collaboration Opportunity",
    details: "Residential project, seeking CP partners",
  },
]

const typeColors = {
  "Buyer Requirement": "bg-blue-500/20 text-blue-700 border-blue-200",
  "Land Parcel": "bg-green-500/20 text-green-700 border-green-200",
  "Rental Requirement": "bg-purple-500/20 text-purple-700 border-purple-200",
  "Joint Development": "bg-orange-500/20 text-orange-700 border-orange-200",
}

export default function OpportunitiesTab() {
  return (
    <div className="space-y-3">
      {opportunitiesData.map((opp) => (
        <div
          key={opp.id}
          className="bg-secondary rounded-lg p-3 border border-border hover:border-primary/50 transition-all"
        >
          <div className="flex items-start gap-2 mb-2">
            <MapPin size={16} />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">{opp.title}</h4>
              <span
                className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded border ${typeColors[opp.type as keyof typeof typeColors]}`}
              >
                {opp.type}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground ml-6 mb-3">{opp.details}</p>

          <div className="flex gap-2 ml-6">
            {opp.type === "Joint Development" ? (
              <button className="flex-1 flex items-center justify-center gap-1 bg-accent text-accent-foreground rounded px-2 py-1 text-xs font-medium hover:bg-accent/90 transition-colors">
                <HandshakeIcon size={12} />
                Collaborate
              </button>
            ) : (
              <>
                <button className="flex-1 bg-primary text-primary-foreground rounded px-2 py-1 text-xs font-medium hover:bg-primary/90 transition-colors">
                  Claim
                </button>
                <button className="flex-1 bg-secondary border border-border text-foreground rounded px-2 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
                  Refer
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
