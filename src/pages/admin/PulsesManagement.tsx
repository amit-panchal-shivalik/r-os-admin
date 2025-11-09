import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PulsesManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialog, setRejectDialog] = useState<{open: boolean, pulseId: string}>({ open: false, pulseId: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: pulses, isLoading, refetch } = useQuery({
    queryKey: ["all-pulses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulses")
        .select(`
          *,
          user:profiles!pulses_user_id_fkey(full_name, email),
          community:communities(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("pulses-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pulses",
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

  const approveMutation = useMutation({
    mutationFn: async (pulseId: string) => {
      const { error } = await supabase
        .from("pulses")
        .update({ status: "approved" })
        .eq("id", pulseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pulses"] });
      toast.success("Pulse approved!");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ pulseId, reason }: { pulseId: string; reason: string }) => {
      const { error } = await supabase
        .from("pulses")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", pulseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pulses"] });
      toast.success("Pulse rejected");
      setRejectDialog({ open: false, pulseId: "" });
      setRejectionReason("");
    },
  });

  const pendingPulses = pulses?.filter(p => p.status === "pending") || [];
  const approvedPulses = pulses?.filter(p => p.status === "approved") || [];
  const rejectedPulses = pulses?.filter(p => p.status === "rejected") || [];

  const filterPulses = (items: typeof pulses) => {
    if (!items) return [];
    const query = searchQuery.toLowerCase();
    return items.filter(pulse =>
      pulse.title.toLowerCase().includes(query) ||
      pulse.user?.full_name?.toLowerCase().includes(query) ||
      pulse.community?.name?.toLowerCase().includes(query)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const PulseCard = ({ pulse, showActions }: { pulse: any; showActions: boolean }) => (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{pulse.title}</h3>
              <p className="text-sm text-muted-foreground">
                By {pulse.user?.full_name} · {pulse.community?.name}
              </p>
            </div>
            <Badge variant={pulse.status === "approved" ? "default" : pulse.status === "rejected" ? "destructive" : "secondary"}>
              {pulse.status}
            </Badge>
          </div>
          
          <p className="text-sm">{pulse.description}</p>
          
          {pulse.attachment_url && (
            <img
              src={pulse.attachment_url}
              alt={pulse.title}
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
          )}
          
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(pulse.created_at), "PPp")}
          </p>

          {pulse.rejection_reason && (
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>Rejection reason:</strong> {pulse.rejection_reason}
              </p>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(pulse.id)}
              disabled={approveMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectDialog({ open: true, pulseId: pulse.id })}
              disabled={rejectMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Pulses Management</h1>
        <p className="text-muted-foreground">Review and manage community pulses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingPulses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approvedPulses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{rejectedPulses.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search pulses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingPulses.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedPulses.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedPulses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {filterPulses(pendingPulses).map(pulse => (
            <PulseCard key={pulse.id} pulse={pulse} showActions={true} />
          ))}
          {filterPulses(pendingPulses).length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending pulses</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {filterPulses(approvedPulses).map(pulse => (
            <PulseCard key={pulse.id} pulse={pulse} showActions={false} />
          ))}
          {filterPulses(approvedPulses).length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No approved pulses</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {filterPulses(rejectedPulses).map(pulse => (
            <PulseCard key={pulse.id} pulse={pulse} showActions={false} />
          ))}
          {filterPulses(rejectedPulses).length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No rejected pulses</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, pulseId: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Pulse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason for rejection (optional)
              </label>
              <Textarea
                placeholder="Enter reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, pulseId: "" })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ pulseId: rejectDialog.pulseId, reason: rejectionReason })}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
