import { useState } from 'react';
import { Plus, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NewInspectionModal from '@/components/modals/NewInspectionModal';
import { format } from 'date-fns';

export default function Inspections() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          customers (name, email, phone),
          leads (name, email, phone)
        `)
        .order('inspection_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast({ title: 'Inspection deleted' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('inspections')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast({ title: 'Status updated' });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inspections</h1>
          <p className="text-muted-foreground">Schedule and manage property inspections</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : inspections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No inspections scheduled yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {inspections.map((inspection) => {
            const clientName = inspection.customers?.name || inspection.leads?.name || 'Unknown';
            const clientEmail = inspection.customers?.email || inspection.leads?.email;
            const clientPhone = inspection.customers?.phone || inspection.leads?.phone;
            
            return (
              <Card key={inspection.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{clientName}</CardTitle>
                      <CardDescription>
                        {format(new Date(inspection.inspection_date), 'MMM dd, yyyy - HH:mm')}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(inspection.status)} className="flex items-center gap-1">
                      {getStatusIcon(inspection.status)}
                      {inspection.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {clientEmail && <p className="text-muted-foreground">Email: {clientEmail}</p>}
                    {clientPhone && <p className="text-muted-foreground">Phone: {clientPhone}</p>}
                    {inspection.notes && <p className="text-muted-foreground">Notes: {inspection.notes}</p>}
                    <div className="flex gap-2 mt-4">
                      {inspection.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: inspection.id, status: 'completed' })}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(inspection.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewInspectionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
