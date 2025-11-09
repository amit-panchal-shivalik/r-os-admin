import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Ban, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface MemberDirectoryProps {
  communityId: string;
}

export function MemberDirectory({ communityId }: MemberDirectoryProps) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const queryClient = useQueryClient();
  const [blockingMember, setBlockingMember] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const { data: members, isLoading } = useQuery({
    queryKey: ["community-members", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          *,
          user:profiles!community_members_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          community:communities(manager_id)
        `)
        .eq("community_id", communityId)
        .eq("status", "approved");

      if (error) throw error;
      return data;
    },
  });

  const blockMemberMutation = useMutation({
    mutationFn: async ({ memberId, reason }: { memberId: string; reason: string }) => {
      const { error } = await supabase
        .from("community_members")
        .update({
          is_blocked: true,
          block_reason: reason,
          status: "rejected",
        })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      toast.success("Member blocked successfully");
      setBlockingMember(null);
      setBlockReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to block member");
    },
  });

  const handleBlockMember = () => {
    if (!blockingMember || !blockReason.trim()) {
      toast.error("Please provide a reason for blocking");
      return;
    }
    blockMemberMutation.mutate({ memberId: blockingMember, reason: blockReason });
  };

  const isManager = members?.[0]?.community?.manager_id === user?.id;
  const isAdmin = userRole === "admin";

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Loading members...</p>;
  }

  if (!members?.length) {
    return <p className="text-center text-muted-foreground py-4">No members yet</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {members?.map((member) => {
          const isCommunityManager = member.community?.manager_id === member.user_id;
          
          return (
            <Card key={member.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user?.avatar_url} alt={member.user?.full_name} />
                  <AvatarFallback>
                    {member.user?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{member.user?.full_name}</p>
                    {isCommunityManager && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Manager
                      </Badge>
                    )}
                    {member.is_blocked && (
                      <Badge variant="destructive" className="text-xs">Blocked</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                </div>
                {(isManager || isAdmin) && !isCommunityManager && !member.is_blocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBlockingMember(member.id)}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Block
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!blockingMember} onOpenChange={() => setBlockingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block Member</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for blocking this member. They will be notified via email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="block-reason">Reason for blocking *</Label>
            <Textarea
              id="block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason..."
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setBlockingMember(null);
              setBlockReason("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockMember}
              disabled={!blockReason.trim() || blockMemberMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {blockMemberMutation.isPending ? "Blocking..." : "Block Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
