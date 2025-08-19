import { Users, UserPlus, DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data - in a real app this would come from your database
const stats = [
  {
    title: 'Active Leads',
    value: '24',
    change: '+12% from last month',
    changeType: 'positive' as const,
    icon: UserPlus
  },
  {
    title: 'Active Projects',
    value: '8',
    change: '+2 this week',
    changeType: 'positive' as const,
    icon: Users
  },
  {
    title: 'Monthly Revenue',
    value: '$45,230',
    change: '+18% from last month',
    changeType: 'positive' as const,
    icon: DollarSign
  },
  {
    title: 'Pending Inspections',
    value: '5',
    change: '3 due today',
    changeType: 'neutral' as const,
    icon: Calendar
  }
];

const recentLeads = [
  { name: 'John Smith', phone: '(555) 123-4567', project: 'Roof Replacement', status: 'New', priority: 'High' },
  { name: 'Maria Garcia', phone: '(555) 987-6543', project: 'Roof Repair', status: 'Contacted', priority: 'Medium' },
  { name: 'David Johnson', phone: '(555) 456-7890', project: 'Gutter Installation', status: 'Estimate Sent', priority: 'High' },
  { name: 'Sarah Wilson', phone: '(555) 321-9876', project: 'Roof Inspection', status: 'Scheduled', priority: 'Low' },
];

const upcomingTasks = [
  { task: 'Follow up with John Smith', type: 'Lead Follow-up', due: 'Today, 2:00 PM' },
  { task: 'Roof inspection at 123 Main St', type: 'Inspection', due: 'Tomorrow, 9:00 AM' },
  { task: 'Send estimate to Maria Garcia', type: 'Estimate', due: 'Today, 5:00 PM' },
  { task: 'Request review from completed project', type: 'Review Request', due: 'Tomorrow, 10:00 AM' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your roofing business.</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          + New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
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
              {recentLeads.map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    <p className="text-xs text-muted-foreground">{lead.project}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={
                      lead.status === 'New' ? 'default' :
                      lead.status === 'Contacted' ? 'secondary' :
                      lead.status === 'Estimate Sent' ? 'outline' : 'default'
                    }>
                      {lead.status}
                    </Badge>
                    <Badge variant={
                      lead.priority === 'High' ? 'destructive' :
                      lead.priority === 'Medium' ? 'default' : 'secondary'
                    } className="ml-1">
                      {lead.priority}
                    </Badge>
                  </div>
                </div>
              ))}
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