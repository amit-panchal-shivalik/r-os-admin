import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Communities() {
  const navigate = useNavigate();

  const { data: communities, isLoading } = useQuery({
    queryKey: ["user-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          Communities
        </h1>
      </div>

      <div className="p-4">
        {communities?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map((community) => (
              <Card
                key={community.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/community/${community.id}`)}
              >
                {community.banner_url && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={community.banner_url}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl">
                      {community.name}
                    </h3>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  {!community.banner_url && (
                    <h3 className="font-bold text-lg">{community.name}</h3>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{community.category}</Badge>
                    <Badge variant="outline">{community.territory}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No communities available</p>
          </div>
        )}
      </div>
    </div>
  );
}
