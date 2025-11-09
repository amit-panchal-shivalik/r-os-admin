# Team Udaan - Community Management Platform

A comprehensive community management platform built for connecting and managing local communities, events, volunteer programs, and social initiatives.

## 🌟 Features

### Core Features
- **Community Management**: Create and manage multiple communities with territory-based organization
- **Event Management**: Organize events with QR-based attendance tracking and registration
- **Pulses**: Social feed for sharing updates, stories, and community moments
- **Marketplace**: Buy and sell items within your community
- **Volunteer Programs**: Track volunteer opportunities and contributions
- **Member Directory**: Search and connect with community members
- **Territory Mapping**: Interactive maps powered by OpenLayers
- **Real-time Updates**: Live notifications and data synchronization

### User Roles
- **Admin**: Full system access, user management, and analytics
- **Manager**: Community and event management capabilities  
- **User**: Participate in communities, events, and marketplace

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component primitives
- **React Router DOM** - Client-side routing
- **TanStack React Query** - Data fetching and caching
- **React Hook Form + Zod** - Form validation

### Backend (Lovable Cloud)
- **PostgreSQL** - Database
- **Supabase Auth** - Authentication system
- **Supabase Storage** - File storage
- **Row Level Security** - Database security
- **Real-time subscriptions** - Live data updates

### Additional Libraries
- **OpenLayers** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **QRCode** - QR code generation
- **Sonner** - Toast notifications

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **bun** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Environment Variables

The project uses Lovable Cloud (Supabase) for backend services. Environment variables are automatically configured when connected to Lovable Cloud:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

> **Note**: These are automatically provided by Lovable Cloud integration.

### 4. Run Development Server

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:8080`

### 5. Build for Production

```bash
npm run build
# or
bun run build
```

The production build will be created in the `dist/` directory.

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Shadcn UI components
│   │   └── layout/       # Layout components
│   ├── pages/            # Route pages
│   │   ├── admin/        # Admin dashboard pages
│   │   └── user/         # User-facing pages
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── integrations/     # Supabase integration
│   └── index.css         # Global styles & design tokens
├── supabase/             # Database migrations (auto-managed)
└── tailwind.config.ts    # Tailwind configuration
```

## 🗄️ Database Schema

### Key Tables
- `profiles` - User profile information
- `user_roles` - Role-based access control
- `communities` - Community data
- `community_members` - Community membership
- `events` - Event information
- `event_registrations` - Event attendance
- `pulses` - Social feed posts
- `marketplace_listings` - Marketplace items
- `volunteer_opportunities` - Volunteer programs
- `volunteer_hours` - Volunteer tracking

### Storage Buckets
- `avatars` - User profile pictures
- `community-banners` - Community images
- `event-banners` - Event images
- `pulse-images` - Pulse post images
- `listing-images` - Marketplace images

## 🔐 Authentication

The platform uses email/password authentication with automatic profile creation:

1. **Sign Up**: Users register with email, password, name, territory, and pincode
2. **Email Confirmation**: Auto-enabled for development (can be configured)
3. **Profile Creation**: Automatic profile and role assignment on signup
4. **Session Management**: Persistent sessions with auto-refresh tokens

### Default Roles
- New users are assigned the `user` role by default
- Admins can be assigned through database management
- Managers can be promoted by admins

## 🎨 Design System

The project uses a semantic design system with:
- **CSS Variables**: Defined in `src/index.css`
- **Tailwind Tokens**: Extended in `tailwind.config.ts`
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-first approach

### Color Tokens
- `--primary`: Main brand color
- `--secondary`: Secondary surfaces
- `--accent`: Accent elements
- `--muted`: Subdued elements
- `--background`: Background surfaces
- `--foreground`: Text on background

## 📱 Responsive Design

- **Desktop**: Full feature set with 2x2 grid layouts
- **Tablet**: Optimized layouts with responsive grids
- **Mobile**: Single-column layouts with touch-optimized UI

## 🚢 Deployment

### Deploying with Lovable

1. Click the **Publish** button in the top-right (desktop) or bottom-right (mobile in Preview mode)
2. Click **Update** to deploy frontend changes
3. Backend changes (migrations, edge functions) deploy automatically

### Custom Domain

1. Navigate to **Project → Settings → Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

> **Note**: Custom domains require a paid Lovable plan

### Self-Hosting

The project can be self-hosted on any static hosting platform:

**Vercel**:
```bash
npm run build
vercel --prod
```

**Netlify**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Other Platforms**:
- Build the project: `npm run build`
- Deploy the `dist/` directory
- Configure redirects for SPA (see `vercel.json` or `public/_redirects`)

### Environment Configuration

For self-hosting, ensure you configure:
1. Supabase project URL and anon key
2. OAuth redirect URLs (if using social login)
3. CORS settings in Supabase dashboard
4. RLS policies for security

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Formatting**: Consistent code style
- **Naming Conventions**: 
  - Components: PascalCase
  - Files: PascalCase for components, camelCase for utilities
  - Hooks: camelCase with `use` prefix

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/user/` or `src/pages/admin/`
3. Create custom hooks in `src/hooks/`
4. Update routes in `src/App.tsx`
5. Add database changes through Lovable Cloud migration tool

## 🐛 Troubleshooting

### Common Issues

**Build Errors**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite && npm run dev`

**Authentication Issues**:
- Check environment variables
- Verify Supabase connection
- Check browser console for errors

**Database Issues**:
- Verify RLS policies are configured
- Check user roles are assigned
- Review migration history

**Styling Issues**:
- Verify Tailwind classes
- Check CSS variable definitions
- Inspect element in browser DevTools

## 📊 Analytics & Monitoring

The admin dashboard provides:
- User growth metrics
- Community statistics
- Event participation rates
- Marketplace activity
- Volunteer hours tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is part of the Shivalik Rapid Codeathon 1.0.

## 🔗 Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Supabase Documentation](https://supabase.com/docs)

## 💬 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed description

---

**Built with ❤️ for Team Udaan**
