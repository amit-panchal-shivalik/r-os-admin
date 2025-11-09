"use client"

import { Calendar, MapPin, ArrowRight } from "lucide-react"

const eventsData = [
  {
    id: 1,
    title: "Property Investment Seminar",
    date: "Nov 15, 2025",
    time: "2:00 PM",
    location: "Delhi Convention Center",
    attendees: 234,
  },
  {
    id: 2,
    title: "Site Visit: New Commercial Complex",
    date: "Nov 18, 2025",
    time: "10:00 AM",
    location: "South Delhi",
    attendees: 48,
  },
  {
    id: 3,
    title: "Real Estate Networking Dinner",
    date: "Nov 22, 2025",
    time: "7:00 PM",
    location: "The Leela Palace",
    attendees: 156,
  },
  {
    id: 4,
    title: "Residential Launches 2025",
    date: "Nov 25, 2025",
    time: "11:00 AM",
    location: "Hotel Intercontinental",
    attendees: 89,
  },
]

export default function EventsTab() {
  return (
    <div className="space-y-3">
      {eventsData.map((event) => (
        <div
          key={event.id}
          className="bg-secondary rounded-lg p-3 border border-border hover:border-primary/50 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar size={12} />
                <span>
                  {event.date} • {event.time}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-accent/20 text-accent px-2 py-1 rounded-full">
              {event.attendees}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-0 mb-3">
            <MapPin size={12} />
            <span>{event.location}</span>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-2 py-2 text-xs font-medium hover:bg-primary/90 transition-colors">
            RSVP / Register
            <ArrowRight size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
