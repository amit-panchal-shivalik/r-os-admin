import { Users, User, Radio, UserCircle, HandHeart, LogOut, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function UserApp() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Team Udaan
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-8 pb-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-3 text-foreground">
            Welcome Back{profile?.full_name ? `, ${profile.full_name}` : ""}!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect with your community, discover opportunities, and make a difference
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mb-4">Explore</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pulses Card */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
            onClick={() => navigate("/pulses")}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Radio className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Pulses</h3>
                <p className="text-xs text-muted-foreground">Share updates & connect globally</p>
              </div>
            </div>
          </Card>

          {/* Communities Card */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20"
            onClick={() => navigate("/communities")}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Communities</h3>
                <p className="text-xs text-muted-foreground">Join groups & build connections</p>
              </div>
            </div>
          </Card>

          {/* Volunteer Card */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20"
            onClick={() => navigate("/app/volunteer")}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <HandHeart className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Volunteer</h3>
                <p className="text-xs text-muted-foreground">Find opportunities & give back</p>
              </div>
            </div>
          </Card>

          {/* Territories Card */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20"
            onClick={() => navigate("/territories")}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Map className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Territories</h3>
                <p className="text-xs text-muted-foreground">Explore local regions & trends</p>
              </div>
            </div>
          </Card>

          {/* Members Card */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20"
            onClick={() => navigate("/members")}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Members</h3>
                <p className="text-xs text-muted-foreground">Browse community member directory</p>
              </div>
            </div>
          </Card>

          {/* Profile Card */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/profile")}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">My Profile</h3>
                <p className="text-xs text-muted-foreground">Manage your account & preferences</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
