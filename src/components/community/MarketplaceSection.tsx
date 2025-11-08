

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ImageCarousel from '@/components/ImageCarousel';
import ModalForm from '@/components/ModalForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MarketplaceSection({ communityId }: { communityId: string }) {
  const { listings, loading, fetchListings } = useMarketplaceStore();
  const { createListing } = useMarketplaceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'offer', title: '', description: '', price: '', image: '' });

  useEffect(() => {
    fetchListings(communityId);
  }, [communityId, fetchListings]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createListing({
        type: form.type as 'want' | 'offer',
        title: form.title,
        description: form.description,
        price: form.price ? Number(form.price) : undefined,
        image: form.image || undefined,
        communityId,
      });
      toast.success('Listing created');
      setForm({ type: 'offer', title: '', description: '', price: '', image: '' });
      handleClose();
      // refresh
      fetchListings(communityId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create listing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Marketplace</h3>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Buy, sell or request items within the community</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpen}>Create Listing</Button>
        </div>
      </div>
      <ModalForm open={open} onOpenChange={setOpen} title="Create Listing" onSubmit={handleSubmit} submitLabel="Create">
        <div className="grid gap-2">
          <div className="flex gap-2">
            <label className="flex-1">
              <Label>Type</Label>
              <select className="w-full rounded-md border px-2 py-2" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="offer">Offer</option>
                <option value="want">Want</option>
              </select>
            </label>
            <label className="flex-1">
              <Label>Price</Label>
              <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. 100" />
            </label>
          </div>
          <label>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label>
            <Label>Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." />
          </label>
        </div>
      </ModalForm>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* If listing has multiple images (future-proof), render carousel. Otherwise render single image if present. */}
              {((listing as any).images?.length > 0) ? (
                <div className="w-full">
                  <ImageCarousel images={(listing as any).images} />
                </div>
              ) : listing.image ? (
                <div className="w-full">
                  <img src={listing.image} alt={listing.title} className="w-full object-cover max-h-48" />
                </div>
              ) : null}

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium truncate">{listing.title}</div>
                  <div className="text-lg font-semibold text-primary">{typeof listing.price === 'number' ? `$${listing.price}` : listing.price ?? ''}</div>
                </div>

                <div className="mt-2 text-sm text-muted-foreground truncate">{'condition' in listing ? `Condition: ${(listing as any).condition}` : ''}</div>
                <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{listing.description}</div>

                <div className="mt-4 flex items-center gap-2">
                  {listing.author?.image ? (
                    <img src={listing.author.image} alt={listing.author.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs">{listing.author?.name ? listing.author.name.slice(0, 2).toUpperCase() : 'NA'}</div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm">{listing.author?.name ?? 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>

                <div className="mt-3">
                  {/* Single primary action: full width on mobile, auto on larger screens */}
                  {listing.type === 'offer' ? (
                    <Button variant="default" size="sm" className="w-full sm:w-auto" onClick={() => toast(`Marked interest in ${listing.title}`)}>I'm interested</Button>
                  ) : (
                    <Button variant="default" size="sm" className="w-full sm:w-auto" onClick={() => toast(`You offered to help with ${listing.title}`)}>I can help</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
