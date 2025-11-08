"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search } from "lucide-react"
import { use } from "i18next"
import ProjectCard from "./project-card"


interface Project {
    _id: string
    mid: string
    name: string
    type: string
    status: string
    district: string
    state: string
    totalUnits: number
    pincode?: string
    image?: string
    area?: number
    population?: number
}

interface ProjectSidebarProps {
    projects: Project[]
    selectedProject: Project | null
    onSelectProject: (project: Project) => void
}

export default function ProjectSidebar() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")

    const SAMPLE_PROJECTS: Project[] = [
        {
            _id: "690f233588487b37124664cb",
            mid: "17673",
            name: "Matrix Industrial Park",
            type: "Commercial",
            status: "New",
            district: "Ahmedabad",
            state: "Gujarat",
            totalUnits: 36,
            pincode: "380026",
            area: 50000,
            population: 5000,
            image: "https://plus.unsplash.com/premium_photo-1678903964473-1271ecfb0288?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3087",
        },
        {
            _id: "690f233588487b37124664cc",
            mid: "17674",
            name: "Tech Hub Plaza",
            type: "Commercial",
            status: "Active",
            district: "Bangalore",
            state: "Karnataka",
            totalUnits: 48,
            pincode: "560001",
            area: 75000,
            population: 8000,
            image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740",
        },
        {
            _id: "690f233588487b37124664cd",
            mid: "17675",
            name: "Sunrise Business Complex",
            type: "Commercial",
            status: "New",
            district: "Pune",
            state: "Maharashtra",
            totalUnits: 24,
            pincode: "411001",
            area: 35000,
            population: 3500,
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1548",
        },
    ]
    const [projects, setProjects] = useState(SAMPLE_PROJECTS)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.state.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = selectedStatus === "all" || project.status === selectedStatus

        return matchesSearch && matchesStatus
    })

    const statusColor = {
        New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    }

    return (

        <div className=" border-r border-border bg-sidebar flex flex-col">
            {selectedProject ?
                <ProjectCard project={selectedProject} setSelectedProject={setSelectedProject} />
                : (<div>
                    {/* Header */}
                    <div className="border-b border-border p-4">
                        <h2 className="mb-4 text-lg font-bold text-sidebar-foreground">Projects</h2>
                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {["all", "New", "Active", "Inactive"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${selectedStatus === status
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredProjects.length > 0 ? (
                            <div className="flex flex-col gap-2 p-3">
                                {filteredProjects.map((project) => (
                                    <button
                                        key={project._id}
                                        onClick={() => setSelectedProject(project)}
                                        className={`rounded-lg p-3 text-left transition-all "
                                    }`}
                                    >
                                        {/* Project Image */}
                                        <div className="mb-2 aspect-video overflow-hidden rounded-md bg-muted">
                                            <img
                                                src={project.image || "/placeholder.svg?height=120&width=200&query=project"}
                                                alt={project.name}
                                                width={200}
                                                height={120}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Project Info */}
                                        <h3 className="mb-1 font-semibold text-sidebar-foreground line-clamp-2">{project.name}</h3>
                                        <p className="mb-2 text-xs text-muted-foreground">{project.mid}</p>

                                        {/* Location */}
                                        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span className="line-clamp-1">
                                                {project.district}, {project.state}
                                            </span>
                                        </div>

                                        {/* Status Badge and Units */}
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge
                                                className={`text-xs ${statusColor[project.status as keyof typeof statusColor] || statusColor.Inactive}`}
                                            >
                                                {project.status}
                                            </Badge>
                                            <span className="text-xs font-medium text-sidebar-foreground">{project.totalUnits} units</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center p-4 text-center">
                                <p className="text-sm text-muted-foreground">No projects found</p>
                            </div>
                        )}
                    </div>

                    {/* Results summary */}
                    <div className="border-t border-border bg-sidebar p-3 text-center text-xs text-muted-foreground">
                        {filteredProjects.length} of {projects.length} projects
                    </div>
                </div>)}

        </div>
    )
}
