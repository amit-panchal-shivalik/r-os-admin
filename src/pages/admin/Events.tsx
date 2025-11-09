import { Plus, Calendar as CalendarIcon, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect } from "react";

export default function Events() {
  const navigate = useNavigate();

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          community:communities(name),
          creator:profiles!events_created_by_fkey(full_name)
        `)
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground">Manage community events</p>
        </div>
        <Button onClick={() => navigate("/admin/events/new")}>
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden cursor-pointer hover:shadow-medium transition-shadow"
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

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(new Date(event.start_datetime), "PPP p")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{event.venue_name}</span>
                </div>
                {event.registration_limit && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Limit: {event.registration_limit}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <Badge variant="secondary">{event.community?.name}</Badge>
                <Badge>{event.territory}</Badge>
              </div>
            </div>
          </Card>
        ))}

        {events?.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <p className="text-muted-foreground mb-4">No events yet</p>
            <Button onClick={() => navigate("/admin/events/new")}>
              Create First Event
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
