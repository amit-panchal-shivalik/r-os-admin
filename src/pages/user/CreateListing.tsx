import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

export default function CreateListing() {
  const { id } = useParams(); // community id
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [postType, setPostType] = useState<"offer" | "want">("offer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      let attachmentUrl = null;

      // Upload attachment if provided
      if (attachment) {
        setUploading(true);
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, attachment);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrl;
        setUploading(false);
      }

      const { error } = await supabase.from("marketplace_listings").insert({
        community_id: id!,
        user_id: user.id,
        post_type: postType,
        title,
        description,
        price_budget: price ? parseFloat(price) : null,
        attachment_url: attachmentUrl,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-listings", id] });
      toast.success("Listing created! Waiting for admin approval.");
      navigate(`/community/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create listing");
    },
  });

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/community/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold">Create Listing</h1>
      </div>

      <div className="p-4">
        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createListingMutation.mutate();
            }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <Label>Type *</Label>
              <RadioGroup value={postType} onValueChange={(v) => setPostType(v as "offer" | "want")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offer" id="offer" />
                  <Label htmlFor="offer" className="font-normal cursor-pointer">
                    I'm offering something
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="want" id="want" />
                  <Label htmlFor="want" className="font-normal cursor-pointer">
                    I want something
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you offering/requesting?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price/Budget (optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Image (optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="attachment"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {attachment && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachment(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {attachment && (
                <p className="text-sm text-muted-foreground">
                  Selected: {attachment.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createListingMutation.isPending || uploading}
            >
              {uploading ? "Uploading..." : createListingMutation.isPending ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
