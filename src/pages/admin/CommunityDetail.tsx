import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Radio, ShoppingBag, BookOpen, Calendar, ArrowLeft, Plus } from "lucide-react";
import { useCommunityById } from "@/hooks/useCommunities";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MemberDirectory } from "@/components/MemberDirectory";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const { data: community, isLoading } = useCommunityById(id);

  // Fetch events for this community
  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ["community-admin-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          creator:profiles!events_created_by_fkey(full_name)
        `)
        .eq("community_id", id!)
        .order("start_datetime", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pulses for this community
  const { data: pulses, refetch: refetchPulses } = useQuery({
    queryKey: ["community-admin-pulses", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulses")
        .select("*, user:profiles!pulses_user_id_fkey(full_name)")
        .eq("community_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch marketplace listings for this community
  const { data: listings, refetch: refetchListings } = useQuery({
    queryKey: ["community-admin-listings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*, user:profiles!marketplace_listings_user_id_fkey(full_name)")
        .eq("community_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch join requests for this community
  const { data: joinRequests, refetch: refetchJoinRequests } = useQuery({
    queryKey: ["community-join-requests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("*, user:profiles!community_members_user_id_fkey(full_name, email)")
        .eq("community_id", id!)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const eventsChannel = supabase
      .channel("community-events-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `community_id=eq.${id}` },
        () => refetchEvents()
      )
      .subscribe();

    const pulsesChannel = supabase
      .channel("community-pulses-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pulses", filter: `community_id=eq.${id}` },
        () => refetchPulses()
      )
      .subscribe();

    const listingsChannel = supabase
      .channel("community-listings-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "marketplace_listings", filter: `community_id=eq.${id}` },
        () => refetchListings()
      )
      .subscribe();

    const requestsChannel = supabase
      .channel("community-requests-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_members", filter: `community_id=eq.${id}` },
        () => refetchJoinRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(pulsesChannel);
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [id, refetchEvents, refetchPulses, refetchListings, refetchJoinRequests]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Community Not Found</h2>
          <Button onClick={() => navigate("/admin/communities")}>
            Back to Communities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Banner */}
      <div className="relative h-64 bg-gradient-primary">
        <img
          src={community.banner_url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/communities")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl font-bold text-white mb-2">{community.name}</h1>
          <div className="flex items-center gap-4 text-white/90">
            <span>{community.territory}</span>
            <span>·</span>
            <Badge className="bg-white/20 capitalize">{community.category}</Badge>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b-0 h-auto p-0 space-x-8">
              <TabsTrigger
                value="events"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 pt-4"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events ({events?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 pt-4"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Requests ({joinRequests?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="pulses"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 pt-4"
              >
                <Radio className="h-4 w-4 mr-2" />
                Pulses ({pulses?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="marketplace"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 pt-4"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Marketplace ({listings?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="directory"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 pt-4"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Directory
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab}>
          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Events</h2>
              <Button onClick={() => navigate("/admin/events/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                >
                  {event.banner_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.start_datetime), "PPP p")}
                      </p>
                      <p className="text-muted-foreground">{event.venue_name}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <Badge>{event.territory}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {events?.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No events yet</p>
                <Button onClick={() => navigate("/admin/events/new")}>
                  Create First Event
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Join Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-2xl font-bold">Join Requests</h2>
            
            {joinRequests?.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{request.user?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested: {format(new Date(request.created_at), "PPP")}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </Card>
            ))}

            {joinRequests?.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending join requests</p>
              </Card>
            )}
          </TabsContent>

          {/* Pulses Tab */}
          <TabsContent value="pulses" className="space-y-4">
            <h2 className="text-2xl font-bold">Pulses</h2>
            
            {pulses?.map((pulse) => (
              <Card key={pulse.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{pulse.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pulse.description}
                    </p>
                    {pulse.attachment_url && (
                      <img
                        src={pulse.attachment_url}
                        alt={pulse.title}
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {pulse.user?.full_name}</span>
                      <span>{format(new Date(pulse.created_at), "PPP")}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      pulse.status === "approved"
                        ? "default"
                        : pulse.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {pulse.status}
                  </Badge>
                </div>
              </Card>
            ))}

            {pulses?.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pulses yet</p>
              </Card>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-4">
            <h2 className="text-2xl font-bold">Marketplace</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {listings?.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <Badge
                        variant={listing.post_type === "offer" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {listing.post_type === "offer" ? "Offering" : "Want"}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        listing.status === "approved"
                          ? "default"
                          : listing.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.description}
                  </p>
                  {listing.price_budget && (
                    <p className="font-bold text-primary mb-2">
                      ${listing.price_budget}
                    </p>
                  )}
                  {listing.attachment_url && (
                    <img
                      src={listing.attachment_url}
                      alt={listing.title}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    By {listing.user?.full_name} · {format(new Date(listing.created_at), "PPP")}
                  </p>
                </Card>
              ))}
            </div>

            {listings?.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No marketplace listings yet</p>
              </Card>
            )}
          </TabsContent>

          {/* Directory Tab */}
          <TabsContent value="directory">
            <h2 className="text-2xl font-bold mb-4">Member Directory</h2>
            <MemberDirectory communityId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}