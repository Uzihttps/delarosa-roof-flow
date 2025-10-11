import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface NewInspectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewInspectionModal({ open, onOpenChange }: NewInspectionModalProps) {
  const [clientType, setClientType] = useState<'customer' | 'lead'>('customer');
  const [clientId, setClientId] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name')
        .eq('status', 'approved')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('inspections')
        .insert({
          customer_id: clientType === 'customer' ? clientId : null,
          lead_id: clientType === 'lead' ? clientId : null,
          inspection_date: new Date(inspectionDate).toISOString(),
          notes: notes || null,
          status: 'scheduled',
          user_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast({ title: 'Inspection scheduled successfully' });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ 
        title: 'Failed to schedule inspection',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setClientType('customer');
    setClientId('');
    setInspectionDate('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const clientList = clientType === 'customer' ? customers : leads;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Inspection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientType">Client Type *</Label>
            <Select value={clientType} onValueChange={(value: 'customer' | 'lead') => {
              setClientType(value);
              setClientId('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="lead">Lead (Approved)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Select {clientType === 'customer' ? 'Customer' : 'Lead'} *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a ${clientType}`} />
              </SelectTrigger>
              <SelectContent>
                {clientList.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inspectionDate">Inspection Date & Time *</Label>
            <Input
              id="inspectionDate"
              type="datetime-local"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Scheduling...' : 'Schedule Inspection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
