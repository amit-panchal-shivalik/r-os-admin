"use client"

import { TrendingUp, MessageCircle, ThumbsUp } from "lucide-react"

const trendsData = [
  {
    id: 1,
    title: "Market News: Property prices surge in South Delhi",
    type: "News",
    date: "2 hours ago",
    engagement: 45,
  },
  {
    id: 2,
    title: "Price Trend: Residential prices up 5.2% this quarter",
    type: "Trend",
    date: "5 hours ago",
    engagement: 82,
  },
  {
    id: 3,
    title: "Community Event: Investment seminar this weekend",
    type: "Pulse",
    date: "1 day ago",
    engagement: 156,
  },
  {
    id: 4,
    title: "Video: Premium apartments walkthrough video released",
    type: "Video",
    date: "2 days ago",
    engagement: 234,
  },
]

const typeIcons = {
  News: "from-blue-500 to-blue-600",
  Trend: "from-green-500 to-green-600",
  Pulse: "from-purple-500 to-purple-600",
  Video: "from-red-500 to-red-600",
}

export default function TrendingsTab() {
  return (
    <div className="space-y-3">
      {trendsData.map((trend) => (
        <div
          key={trend.id}
          className="bg-secondary rounded-lg p-3 border border-border hover:border-primary/50 transition-all"
        >
          <div className="flex items-start gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeIcons[trend.type as keyof typeof typeIcons]} flex items-center justify-center flex-shrink-0`}
            >
              <TrendingUp size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground leading-tight">{trend.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{trend.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-10 text-xs text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <ThumbsUp size={14} />
              <span>{trend.engagement}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <MessageCircle size={14} />
              <span>Comment</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
