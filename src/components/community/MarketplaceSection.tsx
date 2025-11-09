import { useEffect, useState } from 'react';
import { fetchCommunityAdminDetails } from '@/lib/communityApi';
import { Card, CardContent } from '@/components/ui/card';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { Loader2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price?: number;
  image: string;
  status: 'active' | 'pending' | 'rejected';
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  communityId: string;
  type: 'offer' | 'want';
  condition?: string;
  category?: string;
}

// Extend the createListing parameters to include condition and category
interface CreateListingParams {
  type: 'offer' | 'want';
  title: string;
  description: string;
  price?: number;
  image?: string;
  communityId: string;
  condition?: string;
  category?: string;
}

export default function MarketplaceSection({ communityId }: { communityId: string }) {
  const { listings, loading, fetchListings, createListing } = useMarketplaceStore();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'offer' | 'want'>('all');
  const fallback = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c';

  // Sample data for demonstration (displayed immediately so UI isn't blank)
  const dummyMarketListings: MarketplaceListing[] = [
    { 
      id: 'm-d1', 
      title: 'Vintage Camera Lens', 
      description: 'Retro camera lens in excellent condition. Perfect for photography enthusiasts. Includes original box and accessories.', 
      price: 120, 
      image: fallback, 
      status: 'active',
      author: { id: 'u1', name: 'Ava Chen' }, 
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
      type: 'offer',
      condition: 'excellent',
      category: 'electronics',
      communityId: 'comm-1'
    },
    { 
      id: 'm-d2', 
      title: 'Looking for Graphic Designer', 
      description: 'Need a graphic designer for a small project. Logo design and branding for a local business.', 
      price: 300, 
      image: fallback, 
      status: 'active',
      author: { id: 'u2', name: 'Kai Martinez' }, 
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), 
      type: 'want',
      category: 'services',
      communityId: 'comm-1'
    },
    { 
      id: 'm-d3', 
      title: 'Office Desk for Sale', 
      description: 'Modern office desk in great condition. Dimensions: 160x80cm. Pickup only.', 
      price: 75, 
      image: fallback, 
      status: 'pending',
      author: { id: 'u3', name: 'You' }, 
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
      type: 'offer',
      condition: 'good',
      category: 'furniture',
      communityId: 'comm-1'
    },
  ];

  const [marketListings, setMarketListings] = useState<MarketplaceListing[]>(dummyMarketListings);
  
  const formDefaults = {
    type: 'offer' as 'offer' | 'want',
    title: '',
    description: '',
    price: '',
    image: '',
    condition: 'excellent',
    category: 'other'
  };
  
  const [form, setForm] = useState(formDefaults);

  useEffect(() => {
    let mounted = true;
    
    const loadListings = async () => {
      try {
        const data: any = await fetchCommunityAdminDetails(communityId, 'MARKET');
        if (mounted && Array.isArray(data)) {
          const formattedListings: MarketplaceListing[] = data
            .filter((item) => item.is_approved && item.market)
            .map((item) => ({
              id: item.market.market_id,
              title: item.market.title,
              description: item.market.description,
              price: item.market.price,
              image: item.market.image_url || fallback,
              status: 'active' as const, // Use const assertion to ensure correct type
              author: { 
                id: item.user_id, 
                name: item.user_name || 'Unknown User',
                image: item.user_image || fallback 
              },
              createdAt: item.market.created_at,
              communityId: item.community_id,
              type: (item.market.type || 'offer') as 'offer' | 'want',
              condition: item.market.condition || 'good',
              category: item.market.category || 'other'
            }));
          setMarketListings(formattedListings);
        } else if (mounted) {
          setMarketListings(dummyMarketListings);
        }
      } catch (err) {
        console.error('Error loading marketplace listings:', err);
        if (mounted) setMarketListings(dummyMarketListings);
      }
    };

    loadListings();
    return () => { mounted = false; };
  }, [communityId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm(formDefaults);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create the listing data with proper typing
      const listingData: CreateListingParams = {
        type: form.type,
        title: form.title,
        description: form.description,
        price: form.price ? Number(form.price) : undefined,
        image: form.image || undefined,
        communityId,
        condition: form.condition,
        category: form.category
      };

      // Type assertion for the store function if needed
      await (createListing as (data: CreateListingParams) => Promise<void>)(listingData);

      toast.success('Listing submitted for approval', {
        description: 'Your listing will be reviewed within 24 hours'
      });

      // Refresh listings
      try {
        await fetchListings(communityId);
      } catch (_) {
        // Fallback to updating local state
        const newListing: MarketplaceListing = {
          id: 'local-' + Date.now(),
          title: form.title,
          description: form.description,
          price: form.price ? Number(form.price) : undefined,
          image: form.image || fallback,
          status: 'pending',
          author: { id: 'me', name: 'You' },
          createdAt: new Date().toISOString(),
          communityId,
          type: form.type,
          condition: form.condition,
          category: form.category
        };
        setMarketListings(prev => [newListing, ...prev]);
      }

      handleClose();
    } catch (err) {
      console.error('Error creating listing:', err);
      toast.error('Failed to create listing', {
        description: 'Please try again later'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInterest = (listing: MarketplaceListing) => {
    if (listing.type === 'offer') {
      toast.success(`Interest marked for "${listing.title}"`, {
        description: `We'll notify ${listing.author.name} of your interest`
      });
    } else {
      toast.success(`Offer to help with "${listing.title}"`, {
        description: `We'll notify ${listing.author.name} that you can help`
      });
    }
  };

  const getStatusBadge = (status: 'active' | 'pending' | 'rejected') => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Live</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const filteredListings = marketListings.filter(listing => 
    filter === 'all' || listing.type === filter
  );

  // Show dummy data immediately while store loading occurs; the effect will replace with real data when available.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Community Marketplace</h3>
          <p className="text-gray-300 mt-1">Buy, sell, or request items and services within your community</p>
        </div>
        <Button onClick={handleOpen} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          All Listings
        </Button>
        <Button 
          variant={filter === 'offer' ? 'default' : 'outline'} 
          onClick={() => setFilter('offer')}
        >
          Offers
        </Button>
        <Button 
          variant={filter === 'want' ? 'default' : 'outline'} 
          onClick={() => setFilter('want')}
        >
          Requests
        </Button>
      </div>

      {/* Create Listing Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Listing</DialogTitle>
            <DialogDescription className="text-gray-300">
              Listings require admin approval and will be live within 24 hours
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Listing Type</Label>
                <Select value={form.type} onValueChange={(value: 'offer' | 'want') => setForm(f => ({ ...f, type: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offer">I'm Offering</SelectItem>
                    <SelectItem value="want">I'm Looking For</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm(f => ({ ...f, category: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={form.type === 'offer' ? 'e.g., Vintage Camera for Sale' : 'e.g., Looking for Web Designer'}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what you're offering or looking for..."
                className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">
                  Price {form.type === 'want' && '(Budget)'}
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {form.type === 'offer' && (
                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-white">Condition</Label>
                  <Select value={form.condition} onValueChange={(value) => setForm(f => ({ ...f, condition: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs-repair">Needs Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-white">Image URL (Optional)</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Listings Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg">No listings found</div>
            <p className="text-gray-500 mt-2">
              {filter === 'all' 
                ? "Be the first to create a listing in this community!"
                : `No ${filter} listings found. Try changing the filter.`
              }
            </p>
            <Button onClick={handleOpen} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Listing
            </Button>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Image */}
                <div className="relative">
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                    onError={e => (e.currentTarget.src = fallback)}
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant={listing.type === 'offer' ? 'default' : 'secondary'}>
                      {listing.type === 'offer' ? 'Offer' : 'Request'}
                    </Badge>
                    {getStatusBadge(listing.status)}
                  </div>
                  {listing.price !== undefined && listing.price > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-black/50 text-white backdrop-blur-sm">
                        ${listing.price}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {listing.category}
                      </Badge>
                      {listing.condition && (
                        <Badge variant="outline" className="text-xs">
                          {listing.condition}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                      {listing.description}
                    </p>
                  </div>

                  {/* Author and Actions */}
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                      {listing.author.image ? (
                        <img 
                          src={listing.author.image} 
                          alt={listing.author.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                          {listing.author.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {listing.author.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleInterest(listing)}
                      disabled={listing.status !== 'active'}
                      className="w-full"
                      variant={listing.type === 'offer' ? 'default' : 'secondary'}
                    >
                      {listing.type === 'offer' ? "I'm Interested" : "I Can Help"}
                    </Button>
                    
                    {listing.status === 'pending' && listing.author.name === 'You' && (
                      <div className="text-xs text-yellow-400 text-center flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Under review - will be live within 24 hours
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}