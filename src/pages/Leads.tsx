import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Calendar, Filter } from 'lucide-react';
import NewLeadModal from '@/components/modals/NewLeadModal';
import FollowUpModal from '@/components/modals/FollowUpModal';
import ViewItemModal from '@/components/modals/ViewItemModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads from Supabase
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for new leads
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update lead status
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No rows were updated. Check permissions.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Success",
        description: "Lead status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const filteredLeads = (leads || []).filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Leads</h1>
          <p className="text-muted-foreground">Manage and track your potential customers</p>
        </div>
        <NewLeadModal />
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No leads found. Add your first lead to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <ViewItemModal key={lead.id} type="lead" item={lead}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{lead.name}</CardTitle>
                        {lead.notes && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lead.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadMutation.mutate({ id: lead.id, status: value })}
                        >
                          <SelectTrigger 
                            className="h-auto py-1 px-2 text-xs w-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="text-sm space-y-1 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      <FollowUpModal 
                        leadName={lead.name} 
                        leadPhone={lead.phone || ''} 
                        leadEmail={lead.email || ''}
                      >
                        <Button size="sm" className="flex-1">
                          Follow Up
                        </Button>
                      </FollowUpModal>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toast({
                          title: "Estimate",
                          description: `Creating estimate for ${lead.name}...`
                        })}
                      >
                        Send Estimate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ViewItemModal>
            ))}
          </div>
        )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">💡 Lead Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Leads are automatically saved to your database. Click on any lead card to view details, or change the status dropdown to update the lead's progress through your sales pipeline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}