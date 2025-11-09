import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users as UsersIcon, Shield, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Members() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: members, isLoading } = useQuery({
    queryKey: ["all-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  // Get unique members with their community count
  const { data: memberStats } = useQuery({
    queryKey: ["member-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("user_id, community_id, communities(name, manager_id)")
        .eq("status", "approved");

      if (error) throw error;

      // Group by user_id to count communities
      const stats = data.reduce((acc: any, member: any) => {
        if (!acc[member.user_id]) {
          acc[member.user_id] = {
            communityCount: 0,
            isManager: false,
            communities: []
          };
        }
        acc[member.user_id].communityCount++;
        acc[member.user_id].communities.push(member.communities?.name);
        if (member.communities?.manager_id === member.user_id) {
          acc[member.user_id].isManager = true;
        }
        return acc;
      }, {});

      return stats;
    },
  });

  const filteredMembers = members?.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.territory?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Member Directory
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search members by name, email, or territory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="h-5 w-5" />
            <span className="text-sm">
              {filteredMembers?.length || 0} {filteredMembers?.length === 1 ? "member" : "members"} found
            </span>
          </div>
        </Card>

        {/* Members List */}
        <div className="space-y-3">
          {!filteredMembers?.length ? (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">
                {searchQuery ? "No members found matching your search" : "No members yet"}
              </p>
            </Card>
          ) : (
            filteredMembers.map((member) => {
              const stats = memberStats?.[member.id];
              
              return (
                <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {member.full_name || "User"}
                        </h3>
                        {stats?.isManager && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Manager
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {member.email}
                      </p>

                      {member.territory && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{member.territory}</span>
                          {member.pincode && <span className="ml-1">({member.pincode})</span>}
                        </div>
                      )}

                      {stats && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {stats.communityCount} {stats.communityCount === 1 ? "Community" : "Communities"}
                          </Badge>
                          {stats.communities?.slice(0, 2).map((communityName: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {communityName}
                            </Badge>
                          ))}
                          {stats.communities?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{stats.communities.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
