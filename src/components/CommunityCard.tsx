import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Community } from '@/store/communityStore';
import { useCommunityStore } from '@/store/communityStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const navigate = useNavigate();
  const { joinCommunity } = useCommunityStore();

  // Only a single image expected in listing — prefer the first image or banner
  const image = (community.images && community.images.length > 0 ? community.images[0] : community.banner) || null;

  const handleJoin = async () => {
    try {
      await joinCommunity(community.id);
      toast.success('Successfully joined community!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  const handleView = () => {
    navigate(`/community/${community.id}`);
  };

  return (
    <Card className="overflow-hidden modern-card rounded-2xl transform-gpu transition-all duration-500 hover:scale-[1.02]">
      {image && (
        <div className="relative h-44 w-full overflow-hidden modern-img-wrap">
          <img src={image} alt={community.name} className="h-full w-full object-cover modern-img" />
          {/* soft gradient overlay for legibility and modern look */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </div>
      )}
      <CardHeader className="pt-4">
        <CardTitle className="text-lg md:text-xl">{community.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground">{community.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{community.memberCount || 0} members</span>
          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">{community.category}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 pt-2">
        <Button onClick={handleView} className="flex-1 transition-transform hover:translate-y-[-1px]">
          View
        </Button>
        {!community.isJoined && (
          <Button onClick={handleJoin} variant="outline" className="transition-colors">
            Join
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

