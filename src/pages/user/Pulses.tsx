import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Pulses() {
  const navigate = useNavigate();

  const { data: pulses, isLoading } = useQuery({
    queryKey: ["all-pulses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulses")
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Pulses
          </h1>
        </div>
        <Button
          onClick={() => navigate("/pulses/create")}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      {/* Pulses Feed */}
      <div className="p-4">
        {pulses && pulses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pulses.map((pulse: any) => (
              <Card key={pulse.id} className="p-4 space-y-3">
                {/* Author info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {pulse.profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{pulse.profile?.full_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pulse.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Pulse content */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{pulse.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {pulse.description}
                  </p>
                  {pulse.attachment_url && (
                    <img
                      src={pulse.attachment_url}
                      alt="Pulse attachment"
                      className="w-full rounded-lg max-h-64 object-cover"
                    />
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{pulse.territory}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No pulses yet</p>
            <Button onClick={() => navigate("/pulses/create")}>
              Create First Pulse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
