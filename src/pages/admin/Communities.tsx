import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCommunities } from "@/hooks/useCommunities";

export default function Communities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: communities, isLoading } = useCommunities();

  const filteredCommunities = communities?.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            Communities
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and monitor all communities
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/communities/new")}
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-sm md:text-base">Create Community</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCommunities.map((community) => (
          <Card
            key={community.id}
            className="overflow-hidden cursor-pointer hover:shadow-medium transition-all group"
            onClick={() => navigate(`/admin/communities/${community.id}`)}
          >
            {/* Banner */}
            <div className="relative h-32 md:h-40 overflow-hidden bg-gradient-primary">
              <img
                src={community.banner_url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"}
                alt={community.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4 md:p-5 space-y-2 md:space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {community.name}
                </h3>
                <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize shrink-0">
                  {community.status}
                </span>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                {community.description}
              </p>

              <div className="flex items-center justify-between pt-2 md:pt-3 border-t">
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                  <span className="truncate">{community.territory}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium truncate">
                  {community.category}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
