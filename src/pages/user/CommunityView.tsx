import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, ShoppingBag, BookOpen, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberDirectory } from "@/components/MemberDirectory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: membership } = useQuery({
    queryKey: ["membership", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", id!)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: pulses, refetch: refetchPulses } = useQuery({
    queryKey: ["community-pulses", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulses")
        .select("*, user:profiles!pulses_user_id_fkey(full_name)")
        .eq("community_id", id!)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: listings, refetch: refetchListings } = useQuery({
    queryKey: ["community-listings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*, user:profiles!marketplace_listings_user_id_fkey(full_name)")
        .eq("community_id", id!)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ["community-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("community_id", id!)
        .gte("start_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const pulsesChannel = supabase
      .channel("community-pulses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pulses", filter: `community_id=eq.${id}` },
        () => refetchPulses()
      )
      .subscribe();

    const listingsChannel = supabase
      .channel("community-listings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "marketplace_listings", filter: `community_id=eq.${id}` },
        () => refetchListings()
      )
      .subscribe();

    const eventsChannel = supabase
      .channel("community-events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `community_id=eq.${id}` },
        () => refetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pulsesChannel);
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [id, refetchPulses, refetchListings, refetchEvents]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("community_members").insert({
        community_id: id!,
        user_id: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership"] });
      toast.success("Join request sent!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to join community");
    },
  });

  const getJoinButtonText = () => {
    if (!membership) return "Join Community";
    if (membership.status === "pending") return "Request Pending";
    if (membership.status === "approved") return "Joined";
    return "Join Community";
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-background pb-6">
        <div className="relative h-40 md:h-48 overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="relative h-40 md:h-48 overflow-hidden">
        {community.banner_url && (
          <>
            <img
              src={community.banner_url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
          className="absolute top-2 left-2 md:top-4 md:left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
          <span className="text-sm md:text-base">Back</span>
        </Button>

        <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{community.name}</h1>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-white/20 text-xs md:text-sm">{community.category}</Badge>
            <Badge className="bg-white/20 text-xs md:text-sm">{community.territory}</Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-foreground">{community.description}</p>

        <Button
          onClick={() => joinMutation.mutate()}
          disabled={membership?.status === "approved" || membership?.status === "pending"}
          className="w-full"
        >
          {getJoinButtonText()}
        </Button>

        {membership?.status === "approved" && (
          <Tabs defaultValue="pulses" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="pulses" className="flex-col gap-1 py-2 px-2 md:px-4">
                <Radio className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Pulses</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex-col gap-1 py-2 px-2 md:px-4">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Market</span>
              </TabsTrigger>
              <TabsTrigger value="directory" className="flex-col gap-1 py-2 px-2 md:px-4">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex-col gap-1 py-2 px-2 md:px-4">
                <Calendar className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Events</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pulses" className="space-y-4">
              <Button
                className="w-full"
                onClick={() => navigate(`/community/${id}/pulse/new`)}
              >
                Create Pulse
              </Button>
              {pulses?.map((pulse) => (
                <Card key={pulse.id} className="p-4">
                  <h3 className="font-semibold mb-2">{pulse.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{pulse.description}</p>
                  {pulse.attachment_url && (
                    <img
                      src={pulse.attachment_url}
                      alt={pulse.title}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    By {pulse.user?.full_name} · {format(new Date(pulse.created_at), "PPP")}
                  </p>
                </Card>
              ))}
              {pulses?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pulses yet</p>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              <Button
                className="w-full"
                onClick={() => navigate(`/community/${id}/listing/new`)}
              >
                Create Listing
              </Button>
              {listings?.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <Badge variant={listing.post_type === "offer" ? "default" : "secondary"}>
                      {listing.post_type === "offer" ? "Offering" : "Want"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{listing.description}</p>
                  {listing.price_budget && (
                    <p className="font-bold text-primary mb-2">${listing.price_budget}</p>
                  )}
                  {listing.attachment_url && (
                    <img
                      src={listing.attachment_url}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </Card>
              ))}
              {listings?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No listings yet</p>
              )}
            </TabsContent>

            <TabsContent value="directory">
              {membership?.status === "approved" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Community Members</h3>
                  <MemberDirectory communityId={id!} />
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Join the community to view members</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {events?.map((event) => (
                <Card 
                  key={event.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/event/${event.id}/register`)}
                >
                  {event.banner_url && (
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                  <p className="text-sm font-medium mb-1">
                    📅 {format(new Date(event.start_datetime), "PPP p")}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    📍 {event.venue_name}
                  </p>
                  <Button className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/event/${event.id}/register`);
                  }}>
                    View Event
                  </Button>
                </Card>
              ))}
              {events?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No upcoming events</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
