
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, FileText, CheckCircle, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';


interface CommunityCardProps {
  community: any; // Accepts the new API structure
  showJoinButton?: boolean;
}

export default function CommunityCard({ community, showJoinButton = false }: CommunityCardProps) {
  const navigate = useNavigate();

  // Support both old and new structure
  const id = community?.community_id || community?.id;
  const name = community?.community_name || community?.name;
  const description = community?.community_description || community?.description;
  const category = community?.category_id || community?.category || '';
  const memberCount = community?.member_count || community?.memberCount || 0;
  const postCount = community?.post_count || community?.postCount || 0;
  const status = community?.status_enum || community?.status || '';
  const createdAt = community?.created_at ? new Date(community.created_at).toLocaleDateString() : '';
  const fallback = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c';
  const image = community?.banner || (community?.images && community.images[0]) || fallback;
  const [imgSrc, setImgSrc] = React.useState(image);


  // Join logic for listing page only
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Import store for refreshing after join
  const { fetchCommunities } = require('@/store/communityStore');

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api.get(`/community/community-questions/${id}`);
      // CommunityPage expects questions in res.data.data
      const qs = res.data?.data || [];
      if (!qs || qs.length === 0) {
        // No questions, call join API directly (CommunityPage uses /community/join-request)
        await api.post('/community/join-request', { community_id: id });
        setSuccess(true);
        setLoading(false);
        fetchCommunities();
        return;
      }
      setQuestions(qs);
      setShowModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qid: string, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // CommunityPage expects questionAnswers: [{ question_id, answer }]
      const questionAnswers = questions.map((q: any) => ({
        question_id: q.question_id,
        answer: answers[q.question_id] || '',
      }));
      await api.post('/community/join-request', {
        community_id: id,
        questionAnswers,
      });
      setSuccess(true);
      setShowModal(false);
      fetchCommunities();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to join');
    } finally {
      setLoading(false);
    }
  };


  // Restore handleView for Explore community
  const handleView = () => {
    if (id) navigate(`/community/${id}`);
  };

  return (
    <Card
      className="group bg-background/40 backdrop-blur-sm border border-primary/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:bg-background/60 hover:border-primary/30 hover:scale-[1.02]"
    >
      {/* Large Image Section */}
      <div onClick={handleView}>
        {imgSrc && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={imgSrc}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImgSrc(fallback)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-light text-foreground">
                {category}
              </span>
            </div>
          </div>
        )}
        {/* Info Section */}
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{name}</h3>
          <p className="text-muted-foreground font-light text-sm leading-relaxed line-clamp-2 mb-2">
            {description}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1"><Users className="h-4 w-4" />{memberCount} members</div>
            <div className="flex items-center gap-1"><FileText className="h-4 w-4" />{postCount} posts</div>
            <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />{status}</div>
            {createdAt && <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{createdAt}</div>}
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex items-center justify-between text-sm text-muted-foreground font-light transition-colors duration-300 group hover:text-foreground">
          <span className="flex items-center gap-1 cursor-pointer" onClick={e => { e.stopPropagation(); handleView(); }}>
            Explore community
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          {showJoinButton && (
            <>
              <Button
                className="ml-2"
                size="sm"
                variant="default"
                onClick={handleJoinClick}
                disabled={loading || success}
              >
                {loading ? 'Joining...' : 'Join'}
              </Button>
              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join {name}</DialogTitle>
                  </DialogHeader>
                  {error && <div className="text-red-500 mb-2">{error}</div>}
                  {questions.length > 0 && (
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                      {questions.map((q: any) => (
                        <div key={q.question_id}>
                          <Label htmlFor={`q-${q.question_id}`}>{q.question_description}{q.is_mandatory ? ' *' : ''}</Label>
                          <Input
                            id={`q-${q.question_id}`}
                            required={q.is_mandatory}
                            value={answers[q.question_id] || ''}
                            onChange={e => handleAnswerChange(q.question_id, e.target.value)}
                          />
                        </div>
                      ))}
                      <DialogFooter>
                        <Button type="submit" disabled={loading}>Submit</Button>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}