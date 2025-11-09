import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Radio, Calendar, ArrowRight, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span>Shivalik Rapid Codeathon 1.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight px-4">
              Community Platform
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Connecting People, Empowering Communities
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 px-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 group w-full sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 px-4">
            Everything You Need to Build Communities
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            A comprehensive platform for managing communities, events, and engagement
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="p-6 md:p-8 rounded-2xl bg-card shadow-card hover:shadow-medium transition-all hover:-translate-y-1 border border-border/50">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
              Community Management
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Create and manage communities with member directories, join requests, and role-based access control.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-card shadow-card hover:shadow-medium transition-all hover:-translate-y-1 border border-border/50">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Radio className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
              Pulses & Marketplace
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Share updates, create listings, and facilitate community commerce with approval workflows.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-card shadow-card hover:shadow-medium transition-all hover:-translate-y-1 border border-border/50">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
              Event Management
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Organize events with registration, QR code attendance, and comprehensive analytics.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-card shadow-card hover:shadow-medium transition-all hover:-translate-y-1 border border-border/50">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
              Volunteer Programs
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Enable volunteer registration for events, manage applications, and track community service contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
