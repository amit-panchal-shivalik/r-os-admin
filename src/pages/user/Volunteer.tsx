import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, MapPin, Users, Clock, HandHeart } from "lucide-react";
import { useVolunteerOpportunities, useMyVolunteerRegistrations, useVolunteerRegistration } from "@/hooks/useVolunteerOpportunities";
import { useState } from "react";
import { format } from "date-fns";

export default function Volunteer() {
  const navigate = useNavigate();
  const { data: opportunities, isLoading: loadingOpportunities } = useVolunteerOpportunities();
  const { data: myRegistrations, isLoading: loadingRegistrations } = useMyVolunteerRegistrations();
  const volunteerMutation = useVolunteerRegistration();
  
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleVolunteer = () => {
    if (!selectedEvent) return;
    
    volunteerMutation.mutate(
      { eventId: selectedEvent, message },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setMessage("");
          setSelectedEvent(null);
        },
      }
    );
  };

  const isAlreadyVolunteered = (eventId: string) => {
    return myRegistrations?.some(reg => reg.events?.id === eventId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          Volunteer Opportunities
        </h1>
      </div>

      {/* Hero Section with Icon */}
      <div className="px-6 py-8 text-center border-b">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 flex items-center justify-center">
            <HandHeart className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Volunteer</h2>
        <p className="text-muted-foreground">Find opportunities & give back</p>
      </div>

      <div className="p-4">
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opportunities">Available</TabsTrigger>
            <TabsTrigger value="my-registrations">My Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4 mt-4">
            {loadingOpportunities ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : opportunities && opportunities.length > 0 ? (
              opportunities.map((event) => {
                const volunteersCount = event.event_volunteers?.length || 0;
                const isFull = event.volunteer_limit && volunteersCount >= event.volunteer_limit;
                const alreadyVolunteered = isAlreadyVolunteered(event.id);

                return (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {event.communities?.name} • {event.communities?.territory}
                          </CardDescription>
                        </div>
                        {isFull && <Badge variant="secondary">Full</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(event.start_datetime), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.start_datetime), "h:mm a")}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                          <MapPin className="h-4 w-4" />
                          {event.venue_name}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {volunteersCount}
                          {event.volunteer_limit && ` / ${event.volunteer_limit}`} volunteers
                        </div>
                      </div>

                      <Dialog open={dialogOpen && selectedEvent === event.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                          setSelectedEvent(null);
                          setMessage("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            disabled={isFull || alreadyVolunteered}
                            onClick={() => {
                              setSelectedEvent(event.id);
                              setDialogOpen(true);
                            }}
                          >
                            {alreadyVolunteered ? "Already Applied" : isFull ? "Volunteer Spots Full" : "Volunteer for This Event"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Volunteer Application</DialogTitle>
                            <DialogDescription>
                              Apply to volunteer for {event.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="message">Message (Optional)</Label>
                              <Textarea
                                id="message"
                                placeholder="Tell us why you'd like to volunteer..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleVolunteer}
                              disabled={volunteerMutation.isPending}
                            >
                              {volunteerMutation.isPending ? "Submitting..." : "Submit Application"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  No volunteer opportunities available at the moment.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-registrations" className="space-y-4 mt-4">
            {loadingRegistrations ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))
            ) : myRegistrations && myRegistrations.length > 0 ? (
              myRegistrations.map((registration) => {
                const event = registration.events;
                if (!event) return null;

                return (
                  <Card key={registration.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {event.communities?.name} • {event.communities?.territory}
                          </CardDescription>
                        </div>
                        {getStatusBadge(registration.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(event.start_datetime), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.start_datetime), "h:mm a")}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                          <MapPin className="h-4 w-4" />
                          {event.venue_name}
                        </div>
                      </div>
                      {registration.message && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            <strong>Your message:</strong> {registration.message}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Applied {format(new Date(registration.created_at), "MMM dd, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  You haven't applied to volunteer for any events yet.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
