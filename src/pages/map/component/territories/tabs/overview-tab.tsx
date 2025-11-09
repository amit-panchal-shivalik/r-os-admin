"use client"

import { useEffect } from "react";
import AreaAnalytics from "./AreaAnalytics/AreaAnalytics"
import { BarChart2, Compass, Map, Pin, Ruler, Shapes } from "lucide-react"

export default function OverviewTab({ territory }: any) {


  const projects = territory.projects || []

  const totalProjects = projects.length
  const types = countBy(projects, "type")
  const statuses = countBy(projects, "status")

  const projectTypesCount = Object.entries(types)
  const projectStatusCount = Object.entries(statuses)

  const polygon = territory.geometry?.coordinates?.[0] || []
  const polygonVertices = polygon.length

  const bbox = computeBBox(polygon)
  const perimeter = computePerimeter(polygon)
  const projectsPerKmSq = territory.area ? (totalProjects / territory.area).toFixed(2) : null

  type PeopleTypeCount = { _id: string; count: number }

  const peopleByType: PeopleTypeCount[] = Object.entries(
    (territory.people || []).reduce((acc: any, p: any) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ _id: type, count: count as number }));

  return (
    <div className="space-y-5">

      {/* ---- TOP SUMMARY ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart2}
          label="Total Projects"
          value={totalProjects}
        />

        <StatCard
          icon={Ruler}
          label="Area"
          value={territory.area ? `${territory.area} km²` : "—"}
        />

        <StatCard
          icon={Pin}
          label="Population"
          value={territory.population ?? "—"}
        />

        <StatCard
          icon={Compass}
          label="Projects / km²"
          value={projectsPerKmSq ?? "—"}
        />
      </div>

      {/* ---- PROJECT TYPE BREAKDOWN ---- */}
      <Section title="Project Distribution by Type">
        <div className="grid grid-cols-1 gap-2">
          {projectTypesCount.map(([type, count]: any) => (
            <Row key={type} label={type} value={count} />
          ))}
        </div>
      </Section>

      <div className=" bg-gray-50 px-2">
        <div>
          <h1 className="text-lg font-bold text-gray-800 mt-2">Real Estate Analytics Dashboard</h1>
          <AreaAnalytics projects={projects} />
        </div>

      </div>

    
        <ShowTrendingPulses />
   
      
        <div className="flex justify-between gap-3">
          <AvgPriceCard label="Average Price pr sq ft" value={territory.avg_price ? `₹${territory.avg_price} /-` : "—"} />
          <div className="p-3 bg-secondary border border-border rounded-lg w-[50%]">
            <h4 className="text-xs font-semibold text-foreground mb-3">People Involved in This Area</h4>

            <div className="grid grid-cols-1 gap-2">
              {peopleByType.map((p: any) => (
                <div key={p._id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{p._id}</span>
                  <span className="font-semibold">{p.count}</span>
                </div>
              ))}

              {/* Total Count */}
              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">
                  {peopleByType.reduce((sum, p) => sum + p.count, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

     


      {/* ---- PROJECT STATUS BREAKDOWN ---- */}
      <Section title="Project Status">
        <div className="grid grid-cols-1 gap-2">
          {projectStatusCount.map(([status, count]: any) => (
            <Row key={status} label={status} value={count} />
          ))}
        </div>
      </Section>

      {/* ---- GEOMETRY INSIGHTS ---- */}
      <Section title="Geometry Insights">
        <div className="grid grid-cols-1 gap-2">
          <Row label="Polygon Vertices" value={polygonVertices} />
          <Row label="Bounding Box" value={`${bbox.width.toFixed(3)} km × ${bbox.height.toFixed(3)} km`} />
          <Row label="Perimeter" value={`${perimeter.toFixed(3)} km`} />
        </div>
      </Section>

      {/* ---- CENTER COORDINATES ---- */}
      <Section title="Center Coordinates">
        <div className="grid grid-cols-1 gap-2">
          <Row label="Longitude" value={territory.center?.coordinates?.[0]?.toFixed(6) ?? "—"} />
          <Row label="Latitude" value={territory.center?.coordinates?.[1]?.toFixed(6) ?? "—"} />
        </div>
      </Section>

    </div>
  )
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="p-3 bg-secondary border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-primary" />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="p-3 bg-secondary border border-border rounded-lg">
      <h4 className="text-xs font-semibold text-foreground mb-3">{title}</h4>
      {children}
    </div>
  )
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

/* ---------------- HELPERS ---------------- */

function countBy(arr: any[], key: string) {
  return arr.reduce((acc: any, obj: any) => {
    const k = obj[key] ?? "Unknown"
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
}

function ShowTrendingPulses() {
  const pulses = {
    id: 13,
    title: "Lululemon Opens Flagship at Ahmedabad Mall",
    author: "Lululemon India",
    location: "Riverfront Mall, SG Highway",
    image: "data:image/jpeg;base64,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",
    likes: 387,
    comments: 29,
    category: "Shopping & Lifestyle",
    description:
      "Lululemon launched its flagship store in Ahmedabad’s new Riverfront Mall, featuring the latest athleisure collections, in-store yoga sessions, and community events aimed at fitness enthusiasts across the city.",
  }
  return (
    <div
      key={pulses.id}
      className="shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer "
    >
      <div className="relative">
        {pulses.image && (
          <img
            src={pulses.image}
            alt={pulses.title}
            className="w-full h-48 object-cover"
          />
        )}

        {/* Back button over the image */}
        {/* <button
          onClick={() => typeof window !== "undefined" && window.history.back()}
          aria-label="Back"
          className="absolute top-3 left-3 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50"
        >
          ←
        </button> */}

        {/* Bottom overlay with details */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white p-3">
          <h3 className="text-sm font-bold truncate">{pulses.title}</h3>
          <div className="mt-1 text-[12px] opacity-90 flex items-center justify-between">
            <div className="truncate">
              <div className="font-medium">{pulses.author}</div>
              <div className="text-xs opacity-80 truncate">{pulses.location}</div>
            </div>
            {/* <div className="flex items-center gap-3 text-xs opacity-90">
              <span>{pulses.likes} likes</span>
              <span>{pulses.comments} comments</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Details below the image */}
      {/* - */}
    </div>
  )
}

function AvgPriceCard({ label, value }: any) {
  return (
    <div className="p-3 bg-secondary border border-border rounded-lg w-[50%]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  )
}


function computeBBox(coords: number[][]) {
  if (!coords.length) return { width: 0, height: 0 }
  const lons = coords.map(c => c[0])
  const lats = coords.map(c => c[1])

  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  const width = haversine(minLat, minLon, minLat, maxLon)
  const height = haversine(minLat, minLon, maxLat, minLon)

  return { width, height }
}

function computePerimeter(coords: number[][]) {
  let d = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i]
    const [lon2, lat2] = coords[i + 1]
    d += haversine(lat1, lon1, lat2, lon2)
  }
  return d
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
