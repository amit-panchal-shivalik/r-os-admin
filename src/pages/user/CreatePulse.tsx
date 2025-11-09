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
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function CreatePulse() {
  const { id } = useParams(); // community id
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const createPulseMutation = useMutation({
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

      const { error } = await supabase.from("pulses").insert({
        community_id: id!,
        user_id: user.id,
        title,
        description,
        attachment_url: attachmentUrl,
        territory: "General", // Default territory
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-pulses", id] });
      toast.success("Pulse created! Waiting for admin approval.");
      navigate(`/community/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create pulse");
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
        <h1 className="text-xl font-bold">Create Pulse</h1>
      </div>

      <div className="p-4">
        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createPulseMutation.mutate();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's happening?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share more details..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment (optional)</Label>
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
              disabled={createPulseMutation.isPending || uploading}
            >
              {uploading ? "Uploading..." : createPulseMutation.isPending ? "Creating..." : "Create Pulse"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
