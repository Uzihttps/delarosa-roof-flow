import { useState } from 'react';
import { Plus, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NewVideoReviewModal from '@/components/modals/NewVideoReviewModal';
import { format } from 'date-fns';

export default function VideoReviews() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['video_reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video_reviews'] });
      toast({ title: 'Review request deleted' });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Review Requests</h1>
          <p className="text-muted-foreground">Manage and track customer video review requests</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No video review requests yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{review.client_name}</CardTitle>
                    <CardDescription>{review.client_email}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(review.status)} className="flex items-center gap-1">
                    {getStatusIcon(review.status)}
                    {review.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Project: {review.project_name}</p>
                  {review.notes && (
                    <p className="text-muted-foreground">Notes: {review.notes}</p>
                  )}
                  <p className="text-muted-foreground">
                    Request Date: {format(new Date(review.request_date), 'MMM dd, yyyy')}
                  </p>
                  {review.video_url && (
                    <p className="text-primary">Video submitted</p>
                  )}
                  {review.review_link && (
                    <p className="text-muted-foreground text-xs">Link: {review.review_link}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewVideoReviewModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
