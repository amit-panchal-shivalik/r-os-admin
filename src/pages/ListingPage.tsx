import CommunitiesList from '@/components/CommunitiesList';
import Navbar from '@/components/Navbar';

export default function ListingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="container mx-auto px-24 py-10">
        <h1 className="text-3xl font-bold mb-6">All Community Listings</h1>
        <CommunitiesList />
      </div>
    </div>
  );
}
