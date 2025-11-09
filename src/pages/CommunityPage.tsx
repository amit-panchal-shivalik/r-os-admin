
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import DirectorySection from '@/components/community/DirectorySection';
import EventsSection from '@/components/community/EventsSection';
import MarketplaceSection from '@/components/community/MarketplaceSection';
import PulsesSection from '@/components/community/PulsesSection';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function CommunityPage() {
  const params = useParams();
  const communityId = params.id as string;
  const { currentCommunity, loading, fetchCommunityById, fetchCommunities } = useCommunityStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // show skeleton immediately on hard refresh until the store's loading clears
  const [initialLoading, setInitialLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'directory' | 'events' | 'marketplace' | 'pulses'>('overview');

  useEffect(() => {
    if (communityId) {
      // ensure skeleton shows instantly on navigation / hard refresh
      setInitialLoading(true);
      fetchCommunityById(communityId);
    }
  }, [communityId, fetchCommunityById]);

  // clear the initial skeleton once the store reports loading false
  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);


  // State for join modal/questions
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleJoin = async () => {
    setLoadingQuestions(true);
    try {
      const res = await api.get(`/community/community-questions/${communityId}`);
      const questionsData = res.data?.data || [];
      setQuestions(questionsData);
      if (!questionsData || questionsData.length === 0) {
        // No questions, call join API directly
        await handleJoinRequest([]);
      } else {
        setShowQuestionsModal(true);
      }
    } catch (err) {
      toast.error('Failed to fetch community questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (question_id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [question_id]: value }));
  };

  const handleJoinRequest = async (questionAnswers: any[]) => {
    setSubmitLoading(true);
    try {
      const payload = {
        community_id: communityId,
        ...(questionAnswers.length > 0 ? { questionAnswers } : {})
      };
      await api.post('/community/join-request', payload);
      setShowQuestionsModal(false);
      setAnswers({});
      toast.success('Successfully joined community!');
      // Refresh community listing and details
      fetchCommunityById(communityId);
      fetchCommunities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join community');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (initialLoading || loading) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <Sidebar communityId={communityId} />
          <div className="flex-1 p-4 md:p-6">
            <div className="mb-6">
              <Skeleton className="mb-4 h-48 w-full rounded-2xl" />
              <Skeleton className="mb-2 h-8 w-1/3" />
              <Skeleton className="mb-4 h-4 w-1/2" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-2/3" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Community not found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.history.back()}>Back</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <Sidebar
            communityId={communityId}
            onSelect={setTab}
            activeTab={tab}
            hideTabs={!isAuthenticated}
          />
          <div className="flex-1 px-4 md:px-12 py-4 md:py-8">
            <div className="mb-6">
              {currentCommunity && currentCommunity.banner && (
                <div className="mb-4 w-full overflow-hidden rounded-2xl">
                  <img
                    src={currentCommunity.banner}
                    alt={`${currentCommunity.name} banner`}
                    className="h-40 w-full object-cover md:h-48 lg:h-64 max-w-full"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="mb-1 text-2xl font-bold md:text-3xl">{currentCommunity?.name}</h1>
                  <p className="text-sm text-muted-foreground md:text-base">{currentCommunity?.description}</p>
                </div>
                <div className="flex items-center gap-3 w-full">
                  {currentCommunity && !currentCommunity.isJoined ? (
                    <div className="w-full md:w-auto">
                      <Button onClick={handleJoin} className="w-full md:w-auto px-4 py-2" disabled={loadingQuestions}>
                        {loadingQuestions ? 'Loading...' : 'Join Community'}
                      </Button>
                    </div>
                  ) : null}
                  {/* Modal for questions */}
                  <Dialog open={showQuestionsModal} onOpenChange={setShowQuestionsModal}>
                    <DialogContent showCloseButton onClick={e => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Community Questions</DialogTitle>
                      </DialogHeader>
                      <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const questionAnswers = questions?.map((q) => ({
                            question_id: q.question_id,
                            answer: answers[q.question_id] || ''
                          })) || [];
                          await handleJoinRequest(questionAnswers);
                        }}
                      >
                        {questions && questions.map((q) => (
                          <div key={q.question_id} className="space-y-1">
                            <Label htmlFor={`question-${q.question_id}`}>{q.question_description}{q.is_mandatory && <span className="text-red-500">*</span>}</Label>
                            <Input
                              id={`question-${q.question_id}`}
                              value={answers[q.question_id] || ''}
                              onChange={e => handleAnswerChange(q.question_id, e.target.value)}
                              required={q.is_mandatory}
                              placeholder="Your answer..."
                            />
                          </div>
                        ))}
                        <DialogFooter>
                          <Button type="submit" disabled={submitLoading}>
                            {submitLoading ? 'Submitting...' : 'Submit'}
                          </Button>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader></CardHeader>
              <CardContent>
                <div>
                  {tab === 'overview' && (
                    <div>
                      <p className="text-muted-foreground">{currentCommunity?.description}</p>
                    </div>
                  )}
                  {isAuthenticated && tab === 'directory' && <DirectorySection communityId={communityId} />}
                  {isAuthenticated && tab === 'events' && <EventsSection communityId={communityId} />}
                  {isAuthenticated && tab === 'marketplace' && <MarketplaceSection communityId={communityId} />}
                  {isAuthenticated && tab === 'pulses' && <PulsesSection communityId={communityId} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

