import { Users, UserPlus, DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NewLeadModal from '@/components/modals/NewLeadModal';
import FollowUpModal from '@/components/modals/FollowUpModal';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


const upcomingTasks = [
  { task: 'Follow up with John Smith', type: 'Lead Follow-up', due: 'Today, 2:00 PM' },
  { task: 'Roof inspection at 123 Main St', type: 'Inspection', due: 'Tomorrow, 9:00 AM' },
  { task: 'Send estimate to Maria Garcia', type: 'Estimate', due: 'Today, 5:00 PM' },
  { task: 'Request review from completed project', type: 'Review Request', due: 'Tomorrow, 10:00 AM' },
];

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch active leads count (status = 'new')
  const { data: activeLeadsCount } = useQuery({
    queryKey: ['active-leads-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch pending inspections count (status = 'scheduled')
  const { data: pendingInspectionsCount } = useQuery({
    queryKey: ['pending-inspections-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch recent leads from Supabase
  const { data: recentLeads, isLoading } = useQuery({
    queryKey: ['recent-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, phone, notes, status, created_at')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Dynamic stats based on real data
  const stats = [
    {
      title: 'Active Leads',
      value: activeLeadsCount?.toString() || '0',
      change: 'New leads requiring contact',
      changeType: 'neutral' as const,
      icon: UserPlus
    },
    {
      title: 'Active Projects',
      value: '-',
      change: 'No project tracking yet',
      changeType: 'neutral' as const,
      icon: Users
    },
    {
      title: 'Monthly Revenue',
      value: '-',
      change: 'No revenue tracking yet',
      changeType: 'neutral' as const,
      icon: DollarSign
    },
    {
      title: 'Pending Inspections',
      value: pendingInspectionsCount?.toString() || '0',
      change: 'Scheduled inspections',
      changeType: 'neutral' as const,
      icon: Calendar
    }
  ];

  const handleStatCardClick = (title: string) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${title} section...`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your roofing business.</p>
        </div>
        <NewLeadModal />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} onClick={() => handleStatCardClick(stat.title)} className="cursor-pointer">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                // Loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : !recentLeads || recentLeads.length === 0 ? (
                // Empty state
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No leads yet. Click "Add Lead" to get started.</p>
                </div>
              ) : (
                // Real lead data
                <>
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone || 'No phone'}</p>
                        <p className="text-xs text-muted-foreground">{lead.notes || 'No notes'}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          lead.status === 'new' ? 'default' :
                          lead.status === 'contacted' ? 'secondary' :
                          lead.status === 'qualified' ? 'outline' :
                          lead.status === 'proposal' ? 'default' :
                          lead.status === 'negotiation' ? 'secondary' :
                          lead.status === 'won' ? 'default' :
                          lead.status === 'lost' ? 'destructive' : 'default'
                        }>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <FollowUpModal 
                      leadName={recentLeads[0]?.name || "Lead"} 
                      leadPhone={recentLeads[0]?.phone} 
                      leadEmail={recentLeads[0]?.email || ""}
                    >
                      <Button size="sm" className="flex-1">
                        Follow Up Recent Leads
                      </Button>
                    </FollowUpModal>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toast({
                        title: "Estimate",
                        description: `Creating estimate for recent leads...`
                      })}
                    >
                      Send Estimates
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.type}</p>
                    <p className="text-xs text-primary font-medium">{task.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Month's Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">32</div>
              <div className="text-sm text-muted-foreground">Leads Generated</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">18</div>
              <div className="text-sm text-muted-foreground">Projects Won</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">85%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">Avg. Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}