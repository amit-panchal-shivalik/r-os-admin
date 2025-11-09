import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import QrScanner from "qr-scanner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Attendees List Component
function AttendeesListComponent({ eventId }: { eventId: string }) {
  const { data: attendees } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendance")
        .select(`
          *,
          user:profiles!event_attendance_user_id_fkey(full_name, email, avatar_url)
        `)
        .eq("event_id", eventId)
        .order("attended_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Other Attendees ({attendees?.length || 0})
      </h3>
      <div className="space-y-3">
        {attendees?.map((attendance: any) => (
          <div key={attendance.id} className="flex items-center gap-3 p-2 rounded-lg border">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-foreground">
                {attendance.user?.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{attendance.user?.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(attendance.attended_at), "PPP p")}
              </p>
            </div>
          </div>
        ))}
        {attendees?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No other attendees yet
          </p>
        )}
      </div>
    </Card>
  );
}

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [volunteerMessage, setVolunteerMessage] = useState("");

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          community:communities(name)
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: registration, refetch: refetchRegistration } = useQuery({
    queryKey: ["my-registration", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id!)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: myAttendance } = useQuery({
    queryKey: ["my-attendance", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("event_attendance")
        .select("*")
        .eq("event_id", id!)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: registrationCount } = useQuery({
    queryKey: ["registration-count", id],
    queryFn: async () => {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!)
        .eq("status", "approved");
      return count || 0;
    },
  });

  const { data: myVolunteer, refetch: refetchVolunteer } = useQuery({
    queryKey: ["my-volunteer", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("event_volunteers")
        .select("*")
        .eq("event_id", id!)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!event?.needs_volunteers,
  });

  const { data: volunteerCount } = useQuery({
    queryKey: ["volunteer-count", id],
    queryFn: async () => {
      const { count } = await supabase
        .from("event_volunteers")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!)
        .eq("status", "approved");
      return count || 0;
    },
    enabled: !!event?.needs_volunteers,
  });

  // Real-time subscription for registration status
  useEffect(() => {
    const channel = supabase
      .channel("my-registration-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_registrations",
          filter: `event_id=eq.${id}`,
        },
        () => refetchRegistration()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_volunteers",
          filter: `event_id=eq.${id}`,
        },
        () => refetchVolunteer()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchRegistration, refetchVolunteer]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("event_registrations").insert({
        event_id: id!,
        user_id: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registration"] });
      queryClient.invalidateQueries({ queryKey: ["registration-count"] });
      toast.success("Registration request submitted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to register");
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (qrData: any) => {
      if (!user) throw new Error("Must be logged in");
      if (qrData.eventId !== id) throw new Error("Invalid QR code");
      
      const { error } = await supabase.from("event_attendance").insert({
        event_id: id!,
        user_id: user.id,
        qr_code_verified: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      toast.success("Attendance marked successfully!");
      setScanning(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark attendance");
    },
  });

  const volunteerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("event_volunteers").insert({
        event_id: id!,
        user_id: user.id,
        message: volunteerMessage.trim() || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-volunteer"] });
      queryClient.invalidateQueries({ queryKey: ["volunteer-count"] });
      toast.success("Volunteer request submitted!");
      setVolunteerMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit volunteer request");
    },
  });

  const startScanning = async () => {
    setScanning(true);
    if (videoElement) {
      const scanner = new QrScanner(
        videoElement,
        (result) => {
          try {
            const qrData = JSON.parse(result.data);
            markAttendanceMutation.mutate(qrData);
            scanner.stop();
          } catch (err) {
            toast.error("Invalid QR code");
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      await scanner.start();
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isRegistrationOpen = new Date() < new Date(event.registration_end);
  const isEventDay = new Date() >= new Date(event.start_datetime);
  const isLimitReached = event.registration_limit && registrationCount >= event.registration_limit;
  const canRegister = isRegistrationOpen && !isLimitReached && !registration;
  const canAttend = isEventDay && registration?.status === "approved" && !myAttendance;
  const isVolunteerLimitReached = event.volunteer_limit && volunteerCount >= event.volunteer_limit;
  const canVolunteer = event.needs_volunteers && !isVolunteerLimitReached && !myVolunteer;

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/community/${event.community_id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold">Event Details</h1>
      </div>

      <div className="p-4 space-y-4">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        <div>
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <Badge>{event.territory}</Badge>
          {registration && (
            <Badge
              variant={
                registration.status === "approved"
                  ? "default"
                  : registration.status === "pending"
                  ? "secondary"
                  : "destructive"
              }
              className="ml-2"
            >
              {registration.status}
            </Badge>
          )}
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Event Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start_datetime), "PPP p")} -{" "}
                {format(new Date(event.end_datetime), "p")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{event.venue_name}</p>
              <p className="text-sm text-muted-foreground">{event.venue_address}</p>
            </div>
          </div>

          {event.registration_limit && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Registration</p>
                <p className="text-sm text-muted-foreground">
                  {registrationCount} / {event.registration_limit} registered
                </p>
                <p className="text-xs text-muted-foreground">
                  Closes: {format(new Date(event.registration_end), "PPP p")}
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{event.description}</p>
        </Card>

        {/* Volunteer Section */}
        {event.needs_volunteers && (
          <Card className="p-4 border-2 border-accent/50 bg-accent/5">
            <div className="flex items-start gap-3 mb-3">
              <Heart className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Volunteers Needed!</h3>
                <p className="text-sm text-muted-foreground">
                  This event is looking for volunteers to help make it a success.
                </p>
                {event.volunteer_limit && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {volunteerCount} / {event.volunteer_limit} volunteers signed up
                  </p>
                )}
              </div>
            </div>

            {myVolunteer ? (
              <Badge
                variant={
                  myVolunteer.status === "approved"
                    ? "default"
                    : myVolunteer.status === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                Volunteer Status: {myVolunteer.status}
              </Badge>
            ) : canVolunteer ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Why do you want to volunteer? (Optional)
                  </label>
                  <Textarea
                    value={volunteerMessage}
                    onChange={(e) => setVolunteerMessage(e.target.value)}
                    placeholder="Share your motivation..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => volunteerMutation.mutate()}
                  disabled={volunteerMutation.isPending}
                  className="w-full"
                  variant="secondary"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {volunteerMutation.isPending ? "Submitting..." : "Volunteer for This Event"}
                </Button>
              </div>
            ) : isVolunteerLimitReached ? (
              <Button disabled className="w-full" variant="secondary">
                Volunteer Spots Full
              </Button>
            ) : null}
          </Card>
        )}

        {/* Registration Button */}
        {canRegister && (
          <Button
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending}
            className="w-full"
          >
            {registerMutation.isPending ? "Registering..." : "Register for Event"}
          </Button>
        )}

        {isLimitReached && !registration && (
          <Button disabled className="w-full">
            Registration Full
          </Button>
        )}

        {!isRegistrationOpen && !registration && (
          <Button disabled className="w-full">
            Registration Closed
          </Button>
        )}

        {/* Attendance Button */}
        {canAttend && (
          <Button
            onClick={startScanning}
            disabled={scanning}
            className="w-full"
            variant="default"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {scanning ? "Scanning..." : "Mark Attendance (Scan QR)"}
          </Button>
        )}

        {myAttendance && (
          <>
            <Card className="p-4 bg-card">
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Attendance Confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(myAttendance.attended_at), "PPP p")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Attendees List */}
            <AttendeesListComponent eventId={id!} />
          </>
        )}

        {/* QR Scanner */}
        {scanning && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-center">Scan Event QR Code</h3>
            <video
              ref={setVideoElement}
              className="w-full rounded-lg"
              style={{ maxHeight: "400px" }}
            />
            <Button
              variant="outline"
              onClick={() => setScanning(false)}
              className="w-full mt-3"
            >
              Cancel
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}