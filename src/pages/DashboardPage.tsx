import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import CommunityCard from '@/components/CommunityCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Mail, Phone, Building, Plus, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/user/profile');
        setProfile(res.data.data.userProfile);
        setUserCommunities(res.data.data.userCommunities || []);
        // Debug: log what is being set
        setTimeout(() => {
          console.log('profile state:', res.data.userProfile);
          console.log('userCommunities state:', res.data.userCommunities);
        }, 0);
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
        <Navbar />
        
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Welcome back, {profile?.name || 'User'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-3 border-slate-200 border-t-blue-500 animate-spin"></div>
                <p className="text-slate-500">Loading your space...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats & Quick Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Communities</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {userCommunities.length}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Member Since</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                          Active
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Sidebar - More Compact */}
                <div className="lg:col-span-1">
                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sticky top-8">
                    <CardHeader className="py-4">
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Users className="h-5 w-5 text-blue-500" />
                        Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-semibold text-lg">
                          {profile?.name?.charAt(0) || 'U'}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{profile?.name}</h3>
                        {profile?.company_name && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                            <Building className="h-3 w-3" />
                            {profile.company_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 truncate">{profile?.email}</span>
                        </div>
                        {profile?.phone_number && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300">{profile.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Communities Main Content */}
                <div className="lg:col-span-3">
                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div className='my-4'>
                        <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Your Communities
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Spaces where you collaborate and connect
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                        <Plus className="h-4 w-4" />
                        Join New
                      </button>
                    </CardHeader>
                    <CardContent>
                      {userCommunities.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-slate-400" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">No communities yet</h3>
                          <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                            Start by joining a community to collaborate with others and access exclusive content.
                          </p>
                          <button className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                            Explore Communities
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {userCommunities.map((uc) => (
                            <CommunityCard 
                              key={uc.community?.community_id} 
                              community={uc.community}
                              // className="hover:scale-105 transition-transform duration-200"
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}