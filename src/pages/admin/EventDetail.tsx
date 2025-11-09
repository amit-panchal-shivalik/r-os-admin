import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle, Download, QrCode, FileSpreadsheet, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          community:communities(name),
          creator:profiles!events_created_by_fkey(full_name)
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: registrations, isLoading: registrationsLoading, refetch: refetchRegistrations } = useQuery({
    queryKey: ["event-registrations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, user:profiles!event_registrations_user_id_fkey(full_name, email)")
        .eq("event_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance, isLoading: attendanceLoading, refetch: refetchAttendance } = useQuery({
    queryKey: ["event-attendance", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendance")
        .select("*, user:profiles!event_attendance_user_id_fkey(full_name, email)")
        .eq("event_id", id!)
        .order("attended_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: volunteers, refetch: refetchVolunteers } = useQuery({
    queryKey: ["event-volunteers", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_volunteers")
        .select(`
          *,
          profiles!event_volunteers_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq("event_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any)?.map((v: any) => ({
        ...v,
        user: v.profiles
      }));
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const registrationsChannel = supabase
      .channel("event-registrations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_registrations", filter: `event_id=eq.${id}` },
        () => refetchRegistrations()
      )
      .subscribe();

    const attendanceChannel = supabase
      .channel("event-attendance-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_attendance", filter: `event_id=eq.${id}` },
        () => refetchAttendance()
      )
      .subscribe();

    const volunteersChannel = supabase
      .channel("event-volunteers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_volunteers", filter: `event_id=eq.${id}` },
        () => refetchVolunteers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(volunteersChannel);
    };
  }, [id, refetchRegistrations, refetchAttendance, refetchVolunteers]);

  // Generate QR code for event
  useEffect(() => {
    if (event) {
      const qrData = JSON.stringify({
        eventId: event.id,
        eventName: event.title,
        timestamp: new Date().toISOString(),
      });
      
      QRCode.toDataURL(qrData, {
        width: 800,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [event]);

  const approvedRegistrations = registrations?.filter(r => r.status === "approved") || [];
  const pendingRegistrations = registrations?.filter(r => r.status === "pending") || [];
  const attendedCount = attendance?.length || 0;
  const approvedVolunteers = volunteers?.filter(v => v.status === "approved") || [];
  const pendingVolunteers = volunteers?.filter(v => v.status === "pending") || [];

  const approveMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: "approved" })
        .eq("id", registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations", id] });
      toast.success("Registration approved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve registration");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      const { error } = await supabase
        .from("event_registrations")
        .update({ 
          status: "rejected",
          rejection_reason: reason 
        })
        .eq("id", registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations", id] });
      toast.success("Registration rejected");
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRegistration(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject registration");
    },
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => 
      Object.values(row).map(val => `"${val}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success("Exported successfully!");
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `event-qr-${event?.title}.png`;
    a.click();
    toast.success("QR code downloaded!");
  };

  if (eventLoading || registrationsLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="flex justify-center">
            <Skeleton className="h-64 w-64" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/events")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
          <p className="text-muted-foreground">{event.community?.name}</p>
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Registrations</div>
          <div className="text-2xl font-bold">{approvedRegistrations.length}</div>
          {event.registration_limit && (
            <div className="text-xs text-muted-foreground">
              Limit: {event.registration_limit}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-orange-500">{pendingRegistrations.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Attended</div>
          <div className="text-2xl font-bold text-green-500">{attendedCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Attendance Rate</div>
          <div className="text-2xl font-bold">
            {approvedRegistrations.length > 0
              ? Math.round((attendedCount / approvedRegistrations.length) * 100)
              : 0}%
          </div>
        </Card>
      </div>

      {/* QR Code Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Event QR Code
            </h3>
            <p className="text-sm text-muted-foreground">
              Use this QR code for event check-in
            </p>
          </div>
          <Button onClick={downloadQRCode} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download High-Res
          </Button>
        </div>
        {qrCodeUrl && (
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="Event QR Code" className="w-64 h-64" />
          </div>
        )}
      </Card>

      {/* Registrations & Attendance Tabs */}
      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approved">
            Approved ({approvedRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="attendance">
            Attendance ({attendedCount})
          </TabsTrigger>
          {event.needs_volunteers && (
            <TabsTrigger value="volunteers">
              Volunteers ({approvedVolunteers.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  approvedRegistrations.map(r => ({
                    name: r.user?.full_name,
                    email: r.user?.email,
                    registered_at: format(new Date(r.created_at), "PPP p"),
                  })),
                  `approved-registrations-${event.title}.csv`
                )
              }
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          {approvedRegistrations.map((reg) => (
            <Card key={reg.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{reg.user?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{reg.user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Registered: {format(new Date(reg.created_at), "PPP p")}
                  </p>
                </div>
                <Badge variant="default">Approved</Badge>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRegistrations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No pending registrations</p>
            </Card>
          ) : (
            pendingRegistrations.map((reg) => (
              <Card key={reg.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{reg.user?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{reg.user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {format(new Date(reg.created_at), "PPP p")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveMutation.mutate(reg.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedRegistration(reg.id);
                        setRejectDialogOpen(true);
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  attendance?.map(a => ({
                    name: a.user?.full_name,
                    email: a.user?.email,
                    attended_at: format(new Date(a.attended_at), "PPP p"),
                  })) || [],
                  `attendance-${event.title}.csv`
                )
              }
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          {attendance?.map((att) => (
            <Card key={att.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{att.user?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{att.user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Attended: {format(new Date(att.attended_at), "PPP p")}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </Card>
          ))}
        </TabsContent>

        {event.needs_volunteers && (
          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Event Volunteers</h3>
                {event.volunteer_limit && (
                  <p className="text-sm text-muted-foreground">
                    Limit: {approvedVolunteers.length} / {event.volunteer_limit}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCSV(
                    approvedVolunteers.map(v => ({
                      name: v.user?.full_name,
                      email: v.user?.email,
                      message: v.message,
                      registered_at: format(new Date(v.created_at), "PPP p"),
                    })),
                    `volunteers-${event.title}.csv`
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {pendingVolunteers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Pending Volunteers</h4>
                {pendingVolunteers.map((vol) => (
                  <Card key={vol.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{vol.user?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{vol.user?.email}</p>
                        {vol.message && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">{vol.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied: {format(new Date(vol.created_at), "PPP p")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            supabase
                              .from("event_volunteers")
                              .update({ status: "approved" })
                              .eq("id", vol.id)
                              .then(() => {
                                toast.success("Volunteer approved!");
                                refetchVolunteers();
                              });
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            supabase
                              .from("event_volunteers")
                              .update({ status: "rejected" })
                              .eq("id", vol.id)
                              .then(() => {
                                toast.success("Volunteer rejected");
                                refetchVolunteers();
                              });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">Approved Volunteers</h4>
              {approvedVolunteers.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No approved volunteers yet</p>
                </Card>
              ) : (
                approvedVolunteers.map((vol) => (
                  <Card key={vol.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{vol.user?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{vol.user?.email}</p>
                        {vol.message && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">{vol.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Approved: {format(new Date(vol.updated_at), "PPP p")}
                        </p>
                      </div>
                      <Badge variant="default">Volunteer</Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Rejection Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this registration. The user will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectionReason("");
              setSelectedRegistration(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRegistration && rejectionReason.trim()) {
                  rejectMutation.mutate({
                    registrationId: selectedRegistration,
                    reason: rejectionReason,
                  });
                } else {
                  toast.error("Please provide a rejection reason");
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}