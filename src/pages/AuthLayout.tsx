import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
  <div className="container mx-auto px-4 md:px-12 py-4">
          <Link to="/" className="text-xl font-bold">
            Community Platform
          </Link>
        </div>
      </header>
  <main className="container mx-auto px-4 md:px-12 py-6">
        <Outlet />
      </main>
    </div>
  );
}
