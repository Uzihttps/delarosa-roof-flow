import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Plus, Search, Mail, Calendar, ExternalLink } from 'lucide-react';
import { NewVideoReviewModal } from '@/components/modals/NewVideoReviewModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VideoReview {
  id: string;
  client_name: string;
  client_email: string;
  project_name: string;
  status: 'pending' | 'sent' | 'completed' | 'expired';
  request_date: string;
  deadline?: string;
  review_link?: string;
  video_url?: string;
  notes?: string;
}

export default function VideoReviews() {
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<VideoReview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [videoReviews, searchTerm, statusFilter]);

  const fetchVideoReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('video_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideoReviews((data || []) as VideoReview[]);
    } catch (error) {
      toast({
        title: "Error fetching video reviews",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = videoReviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleVideoReviewAdded = (newReview: VideoReview) => {
    setVideoReviews(prev => [newReview, ...prev]);
    toast({
      title: "Video review request created",
      description: "The client will receive an email with instructions.",
    });
  };

  const sendReminder = async (reviewId: string, clientEmail: string) => {
    toast({
      title: "Reminder sent",
      description: `Reminder email sent to ${clientEmail}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'sent':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'expired':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Video className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Video Review Requests</h1>
        </div>
        <NewVideoReviewModal onVideoReviewAdded={handleVideoReviewAdded}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Video Review
          </Button>
        </NewVideoReviewModal>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by client or project name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Reviews Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{review.client_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{review.project_name}</p>
                </div>
                <Badge className={getStatusColor(review.status)}>
                  {review.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {review.client_email}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Requested: {new Date(review.request_date).toLocaleDateString()}
                </div>
                {review.deadline && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Deadline: {new Date(review.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {review.notes && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  {review.notes}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {review.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => sendReminder(review.id, review.client_email)}
                  >
                    Send Reminder
                  </Button>
                )}
                {review.review_link && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={review.review_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Link
                    </a>
                  </Button>
                )}
                {review.video_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={review.video_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-1" />
                      Watch Video
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No video reviews found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by requesting your first video review'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <NewVideoReviewModal onVideoReviewAdded={handleVideoReviewAdded}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Video Review
                </Button>
              </NewVideoReviewModal>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}