import { useState } from 'react';
import { Plus, Star, Send, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NewReviewModal from '@/components/modals/NewReviewModal';
import { format } from 'date-fns';

export default function Reviews() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customers (name, email)
        `)
        .order('request_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Review request deleted' });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'sent':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Requests</h1>
          <p className="text-muted-foreground">Request and manage customer reviews</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Review
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No review requests yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{review.customers?.name || 'Unknown'}</CardTitle>
                    <CardDescription>{review.customers?.email}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(review.status)} className="flex items-center gap-1">
                    {getStatusIcon(review.status)}
                    {review.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Requested: {format(new Date(review.request_date), 'MMM dd, yyyy')}
                  </p>
                  {review.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rating:</span>
                      {renderStars(review.rating)}
                    </div>
                  )}
                  {review.review_text && (
                    <p className="text-muted-foreground bg-muted p-3 rounded-md">{review.review_text}</p>
                  )}
                  {review.review_url && (
                    <a 
                      href={review.review_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View review
                    </a>
                  )}
                  {review.notes && (
                    <p className="text-muted-foreground">Notes: {review.notes}</p>
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

      <NewReviewModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
