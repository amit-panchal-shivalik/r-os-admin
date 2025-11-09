import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCommunityById(id: string | undefined) {
  return useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ["community-stats"],
    refetchInterval: 5000,
    queryFn: async () => {
      const [
        { count: communitiesCount },
        { count: pulsesCount },
        { count: listingsCount },
        { count: eventsCount },
      ] = await Promise.all([
        supabase.from("communities").select("*", { count: "exact", head: true }),
        supabase.from("pulses").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("marketplace_listings").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("start_datetime", new Date().toISOString()),
      ]);

      return {
        communities: communitiesCount || 0,
        pulses: pulsesCount || 0,
        listings: listingsCount || 0,
        events: eventsCount || 0,
      };
    },
  });
}
