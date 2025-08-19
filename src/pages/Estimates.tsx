import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, DollarSign, Calendar, Plus, Eye, Send } from 'lucide-react';
import NewEstimateModal from '@/components/modals/NewEstimateModal';
import ViewItemModal from '@/components/modals/ViewItemModal';
import { useToast } from '@/hooks/use-toast';

// Mock data
const estimates = [
  {
    id: 'EST-001',
    customer: 'John Smith',
    project: 'Complete Roof Replacement',
    amount: '$15,000',
    status: 'Draft',
    created: '2024-01-15',
    expiresIn: '27 days',
    items: 5
  },
  {
    id: 'EST-002',
    customer: 'Maria Garcia',
    project: 'Roof Leak Repair',
    amount: '$3,500',
    status: 'Sent',
    created: '2024-01-12',
    expiresIn: '24 days',
    items: 3
  },
  {
    id: 'EST-003',
    customer: 'David Johnson',
    project: 'Gutter Installation',
    amount: '$2,800',
    status: 'Viewed',
    created: '2024-01-10',
    expiresIn: '22 days',
    items: 4
  },
  {
    id: 'EST-004',
    customer: 'Sarah Wilson',
    project: 'Roof Inspection',
    amount: '$500',
    status: 'Accepted',
    created: '2024-01-08',
    expiresIn: 'Accepted',
    items: 2
  },
  {
    id: 'EST-005',
    customer: 'Mike Brown',
    project: 'Shingle Replacement',
    amount: '$8,200',
    status: 'Expired',
    created: '2023-12-20',
    expiresIn: 'Expired',
    items: 6
  }
];

export default function Estimates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [estimatesData, setEstimatesData] = useState(estimates);
  const { toast } = useToast();

  const handleEstimateAdded = (newEstimate: any) => {
    setEstimatesData([...estimatesData, newEstimate]);
  };

  const filteredEstimates = estimatesData.filter(estimate => {
    const matchesSearch = estimate.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estimate.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Sent': return 'default';
      case 'Viewed': return 'outline';
      case 'Accepted': return 'default';
      case 'Expired': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Estimates</h1>
          <p className="text-muted-foreground">Create and manage project estimates</p>
        </div>
        <NewEstimateModal onEstimateAdded={handleEstimateAdded} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Estimates</p>
                <p className="text-2xl font-bold text-primary">{estimates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-success">$30,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold text-primary">68%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search estimates..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEstimates.map((estimate) => (
              <div key={estimate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{estimate.id}</p>
                      <Badge variant={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{estimate.customer} • {estimate.project}</p>
                    <p className="text-xs text-muted-foreground">{estimate.items} items • Created {estimate.created}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-success">{estimate.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {estimate.status === 'Accepted' ? 'Approved' : 
                       estimate.status === 'Expired' ? 'Expired' : 
                       `Expires in ${estimate.expiresIn}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ViewItemModal type="estimate" item={estimate}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </ViewItemModal>
                    {estimate.status === 'Draft' && (
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary-dark"
                        onClick={() => toast({
                          title: "Estimate Sent",
                          description: `${estimate.id} has been sent to ${estimate.customer}.`
                        })}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    {(estimate.status === 'Sent' || estimate.status === 'Viewed') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast({
                          title: "Follow-up Scheduled",
                          description: `Follow-up with ${estimate.customer} has been scheduled.`
                        })}
                      >
                        Follow Up
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Library */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">📋 Estimate Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pre-built templates for common roofing services to speed up estimate creation.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start">Complete Roof Replacement</Button>
            <Button variant="outline" className="justify-start">Leak Repair & Patch</Button>
            <Button variant="outline" className="justify-start">Gutter Installation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}