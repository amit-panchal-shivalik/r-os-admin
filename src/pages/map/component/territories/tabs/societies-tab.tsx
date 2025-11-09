"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, User2 } from "lucide-react"

export default function SocietiesTab({ territory }) {
  const societies = territory.societies || []
  return (
    <div className="space-y-3 p-4">
      {societies.map((s) => (
        <Card key={s._id} className="rounded-2xl shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              <span className="text-xs">{s.address}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <User2 className="w-4 h-4" /> {s.contact_name || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {s.contact_number || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {s.email || "N/A"}
              </div>
              <br/>
              <div className="flex items-center gap-2">
                Ward : {s.ward_no} {s.pincode}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
