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

  return (
    <div className="space-y-6 p-8">
      {/* Hero Image */}

      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        <div>
          <IconArrowLeftToArc onClick={() => setSelectedProject(null)} />
        </div>
        <img
          src={project.image || "/placeholder.svg?height=400&width=800&query=project-detail"}
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
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <p className="mt-2 text-base text-muted-foreground">Builder: {project.builder}</p>
          </div>
          <Badge className={` px-4 py-2 ${currentStatusColor}`}>{project.status}</Badge>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
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
          <p className="text-lg font-bold text-card-foreground">{project.type}</p>
        </div>

        {/* Total Units */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Units</span>
          </div>
          <p className="text-lg font-bold text-card-foreground">{project.totalUnits}</p>
        </div>

        {/* Area */}
        {project.area && (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Area (sq ft)</span>
            </div>
            <p className="text-lg font-bold text-card-foreground">{(project.area / 1000).toFixed(0)}K</p>
          </div>
        )}

        {/* Population/Capacity */}
        {project.population && (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Capacity</span>
            </div>
            <p className="text-lg font-bold text-card-foreground">{(project.population / 1000).toFixed(1)}K+</p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Project Information</h2>

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
