import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useVolunteerOpportunities() {
  return useQuery({
    queryKey: ["volunteer-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          communities (
            name,
            territory
          ),
          event_volunteers (
            id,
            user_id,
            status
          )
        `)
        .eq("needs_volunteers", true)
        .gte("start_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useMyVolunteerRegistrations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-volunteer-registrations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("event_volunteers")
        .select(`
          *,
          events (
            *,
            communities (
              name,
              territory
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useVolunteerRegistration() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, message }: { eventId: string; message?: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("event_volunteers")
        .insert({
          event_id: eventId,
          user_id: user.id,
          message: message || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["my-volunteer-registrations"] });
      toast.success("Volunteer application submitted!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
