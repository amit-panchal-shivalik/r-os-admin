import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Check, X, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function JoinRequests() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialog, setRejectDialog] = useState<{open: boolean, memberId: string}>({ open: false, memberId: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["join-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          *,
          user:profiles!community_members_user_id_fkey(id, full_name, email, avatar_url),
          community:communities(id, name, banner_url)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("join-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_members",
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
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("community_members")
        .update({ 
          status: "approved",
          joined_at: new Date().toISOString()
        })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      toast.success("Join request approved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ memberId, reason }: { memberId: string; reason: string }) => {
      const { error } = await supabase
        .from("community_members")
        .update({ 
          status: "rejected",
          rejection_reason: reason 
        })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      toast.success("Join request rejected");
      setRejectDialog({ open: false, memberId: "" });
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject request");
    },
  });

  const filteredRequests = requests?.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      request.user?.full_name?.toLowerCase().includes(searchLower) ||
      request.user?.email?.toLowerCase().includes(searchLower) ||
      request.community?.name?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Join Requests
        </h1>
        <p className="text-muted-foreground">
          Review and manage community join requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">{requests?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by user name, email, or community..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
            <p className="text-muted-foreground">
              All join requests have been processed
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* User Info */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {request.user?.avatar_url ? (
                          <img
                            src={request.user.avatar_url}
                            alt={request.user.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{request.user?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(request.created_at), "PPp")}
                    </Badge>
                  </div>

                  {/* Community Info */}
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Requesting to join: </span>
                      <span className="font-semibold">{request.community?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 min-w-[140px]">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={approveMutation.isPending}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setRejectDialog({ open: true, memberId: request.id })}
                    disabled={rejectMutation.isPending}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, memberId: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Join Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason for rejection (optional)
              </label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, memberId: "" });
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ 
                memberId: rejectDialog.memberId, 
                reason: rejectionReason 
              })}
              disabled={rejectMutation.isPending}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
