import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Calendar, Plus, Filter } from 'lucide-react';

// Mock data
const leads = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@email.com',
    phone: '(555) 123-4567',
    project: 'Complete Roof Replacement',
    source: 'Google Ads',
    status: 'New',
    priority: 'High',
    value: '$15,000',
    created: '2 hours ago',
    nextFollowUp: 'Today, 2:00 PM'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria@email.com',
    phone: '(555) 987-6543',
    project: 'Roof Leak Repair',
    source: 'Referral',
    status: 'Contacted',
    priority: 'Medium',
    value: '$3,500',
    created: '1 day ago',
    nextFollowUp: 'Tomorrow, 10:00 AM'
  },
  {
    id: 3,
    name: 'David Johnson',
    email: 'david@email.com',
    phone: '(555) 456-7890',
    project: 'Gutter Installation',
    source: 'Website',
    status: 'Estimate Sent',
    priority: 'High',
    value: '$2,800',
    created: '3 days ago',
    nextFollowUp: 'Friday, 3:00 PM'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@email.com',
    phone: '(555) 321-9876',
    project: 'Roof Inspection',
    source: 'Facebook',
    status: 'Scheduled',
    priority: 'Low',
    value: '$500',
    created: '5 days ago',
    nextFollowUp: 'Next Monday, 9:00 AM'
  }
];

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter;
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
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
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
            <SelectItem value="estimate sent">Estimate Sent</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{lead.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{lead.project}</p>
                </div>
                <div className="flex flex-col gap-1">
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
                  } className="text-xs">
                    {lead.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <p className="font-medium">{lead.source}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Value:</span>
                  <p className="font-medium text-success">{lead.value}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="text-sm space-y-1 border-t pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next Follow-up:</span>
                </div>
                <p className="font-medium text-primary ml-6">{lead.nextFollowUp}</p>
                <p className="text-xs text-muted-foreground ml-6">Created {lead.created}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  Follow Up
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Send Estimate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automation Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">🤖 Automation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Automated follow-ups, review requests, and inspection reminders will be available once you connect your backend database. 
            This will enable features like automatic email sequences, SMS notifications, and scheduled task creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}