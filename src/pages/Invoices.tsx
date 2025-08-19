import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, DollarSign, Calendar, Plus, Eye, Send, Download } from 'lucide-react';
import NewInvoiceModal from '@/components/modals/NewInvoiceModal';
import ViewItemModal from '@/components/modals/ViewItemModal';
import { useToast } from '@/hooks/use-toast';

// Mock data
const invoices = [
  {
    id: 'INV-001',
    customer: 'Sarah Wilson',
    project: 'Roof Inspection',
    amount: '$500',
    status: 'Paid',
    created: '2024-01-05',
    dueDate: '2024-01-20',
    paidDate: '2024-01-18'
  },
  {
    id: 'INV-002',
    customer: 'Mike Davis',
    project: 'Emergency Roof Repair',
    amount: '$2,800',
    status: 'Sent',
    created: '2024-01-08',
    dueDate: '2024-01-23',
    paidDate: null
  },
  {
    id: 'INV-003',
    customer: 'Lisa Johnson',
    project: 'Gutter Cleaning',
    amount: '$300',
    status: 'Overdue',
    created: '2023-12-15',
    dueDate: '2023-12-30',
    paidDate: null
  },
  {
    id: 'INV-004',
    customer: 'Robert Brown',
    project: 'Shingle Replacement',
    amount: '$8,200',
    status: 'Paid',
    created: '2024-01-01',
    dueDate: '2024-01-16',
    paidDate: '2024-01-14'
  },
  {
    id: 'INV-005',
    customer: 'Jennifer Clark',
    project: 'Complete Roof Replacement',
    amount: '$15,000',
    status: 'Partial',
    created: '2023-12-20',
    dueDate: '2024-01-05',
    paidDate: null
  }
];

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoicesData, setInvoicesData] = useState(invoices);
  const { toast } = useToast();

  const handleInvoiceAdded = (newInvoice: any) => {
    setInvoicesData([...invoicesData, newInvoice]);
  };

  const filteredInvoices = invoicesData.filter(invoice => {
    const matchesSearch = invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Sent': return 'secondary';
      case 'Partial': return 'outline';
      case 'Overdue': return 'destructive';
      case 'Draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + parseFloat(inv.amount.replace('$', '').replace(',', '')), 0);
  const totalOutstanding = invoices.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + parseFloat(inv.amount.replace('$', '').replace(',', '')), 0);
  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Invoices</h1>
          <p className="text-muted-foreground">Track payments and manage billing</p>
        </div>
        <NewInvoiceModal onInvoiceAdded={handleInvoiceAdded} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-primary">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-warning">${totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search invoices..."
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Receipt className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{invoice.id}</p>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.customer} • {invoice.project}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {invoice.created} • Due {invoice.dueDate}
                      {invoice.paidDate && ` • Paid ${invoice.paidDate}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-success">{invoice.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.status === 'Paid' ? 'Paid in full' : 
                       invoice.status === 'Overdue' ? 'Payment overdue' : 
                       invoice.status === 'Partial' ? 'Partially paid' :
                       'Awaiting payment'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ViewItemModal type="invoice" item={invoice}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </ViewItemModal>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast({
                        title: "PDF Generated",
                        description: `${invoice.id} PDF is being generated...`
                      })}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    {(invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary-dark"
                        onClick={() => toast({
                          title: "Reminder Sent",
                          description: `Payment reminder sent to ${invoice.customer}.`
                        })}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Reminders */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">💰 Automated Payment Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set up automatic payment reminders to be sent 3 days before due date, on due date, and for overdue invoices. 
            This feature will be available once you connect your backend database for email automation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}