

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/store/marketplaceStore';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card>
      {listing.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{listing.title}</CardTitle>
            <CardDescription>{listing.description}</CardDescription>
          </div>
          <Badge variant={listing.type === 'want' ? 'default' : 'secondary'}>
            {listing.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {listing.price && (
          <div className="flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-5 w-5" />
            {listing.price}
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter>
        <Badge variant="outline">{listing.status}</Badge>
      </CardFooter>
    </Card>
  );
}

