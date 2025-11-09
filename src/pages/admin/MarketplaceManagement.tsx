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

export default function MarketplaceManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialog, setRejectDialog] = useState<{open: boolean, listingId: string}>({ open: false, listingId: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ["all-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select(`
          *,
          user:profiles!marketplace_listings_user_id_fkey(full_name, email),
          community:communities(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("marketplace-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marketplace_listings",
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
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from("marketplace_listings")
        .update({ status: "approved" })
        .eq("id", listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-listings"] });
      toast.success("Listing approved!");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string; reason: string }) => {
      const { error } = await supabase
        .from("marketplace_listings")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-listings"] });
      toast.success("Listing rejected");
      setRejectDialog({ open: false, listingId: "" });
      setRejectionReason("");
    },
  });

  const pendingListings = listings?.filter(l => l.status === "pending") || [];
  const approvedListings = listings?.filter(l => l.status === "approved") || [];
  const rejectedListings = listings?.filter(l => l.status === "rejected") || [];

  const filterListings = (items: typeof listings) => {
    if (!items) return [];
    const query = searchQuery.toLowerCase();
    return items.filter(listing =>
      listing.title.toLowerCase().includes(query) ||
      listing.user?.full_name?.toLowerCase().includes(query) ||
      listing.community?.name?.toLowerCase().includes(query)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ListingCard = ({ listing, showActions }: { listing: any; showActions: boolean }) => (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{listing.title}</h3>
                <Badge variant={listing.post_type === "offer" ? "default" : "secondary"}>
                  {listing.post_type === "offer" ? "Offering" : "Want"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                By {listing.user?.full_name} · {listing.community?.name}
              </p>
            </div>
            <Badge variant={listing.status === "approved" ? "default" : listing.status === "rejected" ? "destructive" : "secondary"}>
              {listing.status}
            </Badge>
          </div>
          
          <p className="text-sm">{listing.description}</p>
          
          {listing.price_budget && (
            <p className="text-lg font-bold text-primary">${listing.price_budget}</p>
          )}
          
          {listing.attachment_url && (
            <img
              src={listing.attachment_url}
              alt={listing.title}
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
          )}
          
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(listing.created_at), "PPp")}
          </p>

          {listing.rejection_reason && (
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>Rejection reason:</strong> {listing.rejection_reason}
              </p>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(listing.id)}
              disabled={approveMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectDialog({ open: true, listingId: listing.id })}
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace Management</h1>
        <p className="text-muted-foreground">Review and manage marketplace listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingListings.length}</p>
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
              <p className="text-2xl font-bold">{approvedListings.length}</p>
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
              <p className="text-2xl font-bold">{rejectedListings.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingListings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedListings.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedListings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {filterListings(pendingListings).map(listing => (
            <ListingCard key={listing.id} listing={listing} showActions={true} />
          ))}
          {filterListings(pendingListings).length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending listings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {filterListings(approvedListings).map(listing => (
            <ListingCard key={listing.id} listing={listing} showActions={false} />
          ))}
          {filterListings(approvedListings).length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No approved listings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {filterListings(rejectedListings).map(listing => (
            <ListingCard key={listing.id} listing={listing} showActions={false} />
          ))}
          {filterListings(rejectedListings).length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No rejected listings</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, listingId: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
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
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, listingId: "" })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ listingId: rejectDialog.listingId, reason: rejectionReason })}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
