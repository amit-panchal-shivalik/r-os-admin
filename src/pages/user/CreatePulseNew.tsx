import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

const territoryPincodes: Record<string, string> = {
  "Vaishnodevi": "182301",
  "Mumbai": "400001",
  "Delhi": "110001",
  "Bangalore": "560001",
  "Chennai": "600001",
};

export default function CreatePulseNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [territory, setTerritory] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [publishToCommunity, setPublishToCommunity] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Get user's territory from profile
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("territory, pincode")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get user's joined communities
  const { data: myCommunities } = useQuery({
    queryKey: ["my-communities"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          *,
          community:communities(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "approved")
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data.map((m: any) => m.community);
    },
    enabled: !!user && publishToCommunity,
  });

  // Set default territory when profile loads
  useState(() => {
    if (profile?.territory && !territory) {
      setTerritory(profile.territory);
    }
  });

  const createPulseMutation = useMutation({
    mutationFn: async (isDraft: boolean) => {
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

      // Create the pulse
      const { data: pulseData, error: pulseError } = await supabase
        .from("pulses")
        .insert({
          user_id: user.id,
          community_id: null, // Worldwide pulse
          title,
          description,
          attachment_url: attachmentUrl,
          territory: territory || profile?.territory || "General",
          status: isDraft ? "draft" : "pending",
        })
        .select()
        .single();

      if (pulseError) throw pulseError;

      // Link to selected communities if publishing to community
      if (!isDraft && publishToCommunity && selectedCommunities.length > 0) {
        const communityLinks = selectedCommunities.map((communityId) => ({
          pulse_id: pulseData.id,
          community_id: communityId,
          status: "pending" as "pending",
        }));

        const { error: linkError } = await supabase
          .from("pulse_communities")
          .insert(communityLinks);

        if (linkError) throw linkError;
      }

      return { isDraft };
    },
    onSuccess: ({ isDraft }) => {
      queryClient.invalidateQueries({ queryKey: ["all-pulses"] });
      toast.success(
        isDraft
          ? "Pulse saved as draft!"
          : "Pulse submitted for review!"
      );
      navigate("/pulses");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create pulse");
    },
  });

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId)
        ? prev.filter((id) => id !== communityId)
        : [...prev, communityId]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/pulses")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Create Pulse</h1>
      </div>

      <div className="p-4">
        <Card className="p-6">
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title of the post *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">What do you want to talk about? *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Use @ to mention people..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="territory">Territory</Label>
              <select
                id="territory"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
              >
                <option value="">Select Territory</option>
                {Object.keys(territoryPincodes).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Default: {profile?.territory || "Not set"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Image (optional)
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                {attachment ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {attachment.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttachment(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {attachment.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(attachment)}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md"
                      />
                    )}
                  </div>
                ) : (
                  <label htmlFor="attachment" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <Input
                      id="attachment"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="publish-community">Want to publish in community</Label>
                <Switch
                  id="publish-community"
                  checked={publishToCommunity}
                  onCheckedChange={setPublishToCommunity}
                />
              </div>

              {publishToCommunity && (
                <div className="space-y-2 pl-4 border-l-2 border-primary">
                  <p className="text-sm text-muted-foreground">
                    Select communities to publish in:
                  </p>
                  <div className="space-y-2">
                    {myCommunities && myCommunities.length > 0 ? (
                      myCommunities.map((community: any) => (
                        <div key={community.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={community.id}
                            checked={selectedCommunities.includes(community.id)}
                            onCheckedChange={() => toggleCommunity(community.id)}
                          />
                          <label
                            htmlFor={community.id}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {community.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No joined communities. Join communities to publish there.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => createPulseMutation.mutate(true)}
                disabled={createPulseMutation.isPending || uploading || !title || !description}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => createPulseMutation.mutate(false)}
                disabled={createPulseMutation.isPending || uploading || !title || !description}
              >
                {uploading ? "Uploading..." : createPulseMutation.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
