"use client"
import { useState } from "react"
import OverviewTab from "./tabs/overview-tab"
import ProfessionalsTab from "./tabs/professionals-tab"
import ProjectsTab from "./tabs/projects-tab"
import OpportunitiesTab from "./tabs/opportunities-tab"
import TrendingsTab from "./tabs/trendings-tab"
import GovernanceTab from "./tabs/governance-tab"
import EventsTab from "./tabs/events-tab"
import { Building2, Users, Home, Lightbulb, TrendingUp, Shield, Calendar } from "lucide-react"
import { Territory } from "@/apis/apiService"
import ViewPulses from "../pulses/ViewPulses"

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "projects", label: "Projects", icon: Home },
  { id: "professionals", label: "Professionals", icon: Users },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb },
  { id: "pulses", label: "Pulses", icon: TrendingUp },
  { id: "governance", label: "Governance", icon: Shield },
  { id: "events", label: "Events", icon: Calendar },
]

export function ViewTerritories({ territory }: any) {

  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab territory={territory} />
      case "professionals":
        return <ProfessionalsTab territory={territory} />
      case "projects":
        return <ProjectsTab territory={territory} />
      case "opportunities":
        return <OpportunitiesTab />
      case "pulses":
        return <ViewPulses />
      case "governance":
        return <GovernanceTab />
      case "events":
        return <EventsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className=" bg-card border-r border-border flex flex-col h-screen shadow-lg">
      {/* Flash Banner */}
      <div className="w-full bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-md">
        <div className="px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Name + City */}
          <div>
            <h1 className="text-xl font-bold">{territory.name}</h1>
            <p className="text-xs opacity-80">
              {territory.city} • {territory.zone}
            </p>
          </div>

          {/* Metrics */}
          <div className="flex gap-6 text-xs">
            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {territory.area ? `${territory.area} km²` : "—"}
              </span>
              <span className="opacity-75">Area</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {territory.population ?? "—"}
              </span>
              <span className="opacity-75">Population</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {territory.pin_code ?? "—"}
              </span>
              <span className="opacity-75">Pincode</span>
            </div>
          </div>

          {/* Extra metric: project count */}
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {territory.projects?.length ?? 0}
            </span>
            <span className="opacity-75 text-xs">Projects</span>
          </div>

        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-border bg-card">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                  ? "border-primary text-primary bg-secondary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  )
}
