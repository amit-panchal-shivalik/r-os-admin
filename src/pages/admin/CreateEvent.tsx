import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, Users, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [territory, setTerritory] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState("");
  const [needsVolunteers, setNeedsVolunteers] = useState(false);
  const [volunteerLimit, setVolunteerLimit] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      let bannerUrl = null;
      if (bannerFile) {
        const fileExt = bannerFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("event-banners")
          .upload(fileName, bannerFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("event-banners")
          .getPublicUrl(fileName);
        
        bannerUrl = publicUrl;
      }

      const { error } = await supabase.from("events").insert({
        title,
        description,
        community_id: communityId,
        territory,
        venue_name: venueName,
        venue_address: venueAddress,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        registration_end: registrationEnd,
        registration_limit: registrationLimit ? parseInt(registrationLimit) : null,
        needs_volunteers: needsVolunteers,
        volunteer_limit: volunteerLimit ? parseInt(volunteerLimit) : null,
        banner_url: bannerUrl,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
      navigate("/admin/events");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/events")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
          <p className="text-muted-foreground">Set up a new community event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="community">Community *</Label>
              <Select value={communityId} onValueChange={setCommunityId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  {communities?.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="territory">Territory *</Label>
              <Select value={territory} onValueChange={setTerritory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Venue Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue Name *</Label>
              <Input
                id="venue-name"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue-address">Venue Address *</Label>
              <Textarea
                id="venue-address"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Enter complete address"
                rows={2}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Schedule
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Date & Time *</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={startDatetime}
                  onChange={(e) => setStartDatetime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">End Date & Time *</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={endDatetime}
                  onChange={(e) => setEndDatetime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-end">Registration Deadline *</Label>
                <Input
                  id="reg-end"
                  type="datetime-local"
                  value={registrationEnd}
                  onChange={(e) => setRegistrationEnd(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">
                  <Users className="h-4 w-4 inline mr-1" />
                  Registration Limit (Optional)
                </Label>
                <Input
                  id="limit"
                  type="number"
                  value={registrationLimit}
                  onChange={(e) => setRegistrationLimit(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Volunteer Requirements
            </h3>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="needs-volunteers"
                checked={needsVolunteers}
                onChange={(e) => setNeedsVolunteers(e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              <Label htmlFor="needs-volunteers" className="cursor-pointer">
                This event needs volunteers
              </Label>
            </div>

            {needsVolunteers && (
              <div className="space-y-2">
                <Label htmlFor="volunteer-limit">
                  Volunteer Limit (Optional)
                </Label>
                <Input
                  id="volunteer-limit"
                  type="number"
                  value={volunteerLimit}
                  onChange={(e) => setVolunteerLimit(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Event Banner</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="banner" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload event banner
                  </p>
                  <input
                    id="banner"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/events")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
