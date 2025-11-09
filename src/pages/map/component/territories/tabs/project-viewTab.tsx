"use client"

import { Badge } from "@/components/ui/badge"
import { IconArrowLeftToArc } from "@tabler/icons-react"
import { MapPin, Building2, Users, Ruler, Zap } from "lucide-react"


interface ProjectDetailsProps {
  project: {
    _id: string
    mid: string
    builder: string
    name: string
    type: string
    status: string
    district: string
    state: string
    totalUnits: number
    pincode?: string
    area?: number
    population?: number
    image?: string
  },
  setSelectedProject: (project: null) => void
}

export default function ProjectCard({ project, setSelectedProject }: ProjectDetailsProps) {
  const statusColor = {
    New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  }

  const currentStatusColor = statusColor[project.status as keyof typeof statusColor] || statusColor.Inactive
  const images = [
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
    "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
    "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
    "https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg",
    "https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg",
    "https://images.pexels.com/photos/259600/pexels-photo-259600.jpeg",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
    "https://images.pexels.com/photos/259597/pexels-photo-259597.jpeg",
    "https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg",
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    "https://images.pexels.com/photos/36367/house-building-lawn-green.jpg",
    "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg",
    "https://images.pexels.com/photos/259600/pexels-photo-259600.jpeg",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
    "https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg",
    "https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
    "https://images.pexels.com/photos/259600/pexels-photo-259600.jpeg",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
    "https://images.pexels.com/photos/280232/pexels-photo-280232.jpeg",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
    "https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg",
    "https://images.pexels.com/photos/259603/pexels-photo-259603.jpeg",
    "https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg",
    "https://images.pexels.com/photos/1834732/pexels-photo-1834732.jpeg",
    "https://images.pexels.com/photos/259600/pexels-photo-259600.jpeg",
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
    "https://images.pexels.com/photos/259600/pexels-photo-259600.jpeg",
    "https://images.pexels.com/photos/280226/pexels-photo-280226.jpeg",
    "https://images.pexels.com/photos/280233/pexels-photo-280233.jpeg",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
    "https://images.pexels.com/photos/259597/pexels-photo-259597.jpeg",
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
    "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    "https://images.pexels.com/photos/1834732/pexels-photo-1834732.jpeg",
    "https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg",
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    "https://images.pexels.com/photos/280233/pexels-photo-280233.jpeg",
    "https://images.pexels.com/photos/280232/pexels-photo-280232.jpeg",
    "https://images.pexels.com/photos/280226/pexels-photo-280226.jpeg"
  ]

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div>
        <IconArrowLeftToArc onClick={() => setSelectedProject(null)} />
      </div>
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">

        <img
          src={images[Math.floor(Math.random() * images.length)]}
          alt={project.name}
          width={800}
          height={400}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-md font-bold text-foreground">{project.name}</h1>
            <p className="mt-2 text-base text-sm text-muted-foreground">Builder: {project.builder ?? ""}</p>
          </div>
          <Badge className={` px-4 py-2 text-sm ${currentStatusColor}`}>{project.status}</Badge>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span>
            {project.district}, {project.state}
          </span>
          {project.pincode && <span className="ml-4">Pincode: {project.pincode}</span>}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ">
        {/* Type */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Type</span>
          </div>
          <p className="text-sm font-bold text-card-foreground">{project.type}</p>
        </div>

        {/* Total Units */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Units</span>
          </div>
          <p className="text-sm font-bold text-card-foreground">{project.totalUnits}</p>
        </div>

        {/* Area */}
        {project.area && (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Area (sq ft)</span>
            </div>
            <p className="text-sm font-bold text-card-foreground">{(project.area / 1000).toFixed(0)}K</p>
          </div>
        )}

        {/* Population/Capacity */}
        {project.population && (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Capacity</span>
            </div>
            <p className="text-sm font-bold text-card-foreground">{(project.population / 1000).toFixed(1)}K+</p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground">Project Information</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Project Type</p>
            <p className="font-semibold text-foreground">{project.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <Badge className={currentStatusColor}>{project.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Location</p>
            <p className="font-semibold text-foreground">
              {project.district}, {project.state}
            </p>
          </div>
          {project.pincode && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pincode</p>
              <p className="font-semibold text-foreground">{project.pincode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
