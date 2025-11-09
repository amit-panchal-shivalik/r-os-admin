import { Users, Radio, ShoppingBag, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCommunities, useCommunityStats } from "@/hooks/useCommunities";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: communities, isLoading: communitiesLoading } = useCommunities();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useCommunityStats();

  useEffect(() => {
    const channels = [
      supabase.channel("communities-stats").on("postgres_changes", { event: "*", schema: "public", table: "communities" }, () => refetchStats()),
      supabase.channel("pulses-stats").on("postgres_changes", { event: "*", schema: "public", table: "pulses" }, () => refetchStats()),
      supabase.channel("listings-stats").on("postgres_changes", { event: "*", schema: "public", table: "marketplace_listings" }, () => refetchStats()),
      supabase.channel("events-stats").on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => refetchStats()),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [refetchStats]);

  const statsData = [
    {
      label: "Total Communities",
      value: stats?.communities.toString() || "0",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Pulses",
      value: stats?.pulses.toString() || "0",
      icon: Radio,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Marketplace Listings",
      value: stats?.listings.toString() || "0",
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Upcoming Events",
      value: stats?.events.toString() || "0",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const recentCommunities = communities?.slice(0, 3) || [];

  if (communitiesLoading || statsLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome back, Admin
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's what's happening in your communities today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsData.map((stat) => (
          <Card key={stat.label} className="p-4 md:p-6 shadow-card hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Communities */}
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">
            Recent Communities
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/communities")}
          >
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {recentCommunities.map((community) => (
            <div
              key={community.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              onClick={() => navigate(`/admin/communities/${community.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                  {community.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {community.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {community.territory}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {community.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 md:p-6 shadow-card">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Button
            variant="outline"
            className="h-auto py-3 md:py-4 flex-col gap-2"
            onClick={() => navigate("/admin/communities/new")}
          >
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-sm md:text-base">Create Community</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 md:py-4 flex-col gap-2"
            onClick={() => navigate("/admin/events")}
          >
            <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-sm md:text-base">Manage Events</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 md:py-4 flex-col gap-2"
            onClick={() => navigate("/admin/join-requests")}
          >
            <Radio className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-sm md:text-base">Join Requests</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
