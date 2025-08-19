import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, Phone, Mail, Calendar, DollarSign } from 'lucide-react';

interface ViewItemModalProps {
  type: 'lead' | 'estimate' | 'invoice';
  item: any;
  children: React.ReactNode;
}

export default function ViewItemModal({ type, item, children }: ViewItemModalProps) {
  const [open, setOpen] = useState(false);

  const renderLeadDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <div className="flex gap-2">
          <Badge variant={
            item.status === 'New' ? 'default' :
            item.status === 'Contacted' ? 'secondary' :
            item.status === 'Estimate Sent' ? 'outline' : 'default'
          }>
            {item.status}
          </Badge>
          <Badge variant={
            item.priority === 'High' ? 'destructive' :
            item.priority === 'Medium' ? 'default' : 'secondary'
          }>
            {item.priority}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{item.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{item.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Next: {item.nextFollowUp}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Project:</span>
            <p className="font-medium">{item.project}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Source:</span>
            <p className="font-medium">{item.source}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Est. Value:</span>
            <p className="font-medium text-success">{item.value}</p>
          </div>
        </div>
      </div>

      {item.notes && (
        <>
          <Separator />
          <div>
            <span className="text-sm text-muted-foreground">Notes:</span>
            <p className="mt-1">{item.notes}</p>
          </div>
        </>
      )}
    </div>
  );

  const renderEstimateDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{item.id}</h3>
        <Badge variant={
          item.status === 'Draft' ? 'secondary' :
          item.status === 'Sent' ? 'default' :
          item.status === 'Viewed' ? 'outline' :
          item.status === 'Accepted' ? 'default' : 'destructive'
        }>
          {item.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-muted-foreground">Customer:</span>
          <p className="font-medium">{item.customer}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Project:</span>
          <p className="font-medium">{item.project}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Amount:</span>
          <p className="font-medium text-success text-xl">{item.amount}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Items:</span>
          <p className="font-medium">{item.items} line items</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Timeline:</div>
        <div className="space-y-1">
          <p>Created: {item.created}</p>
          <p>Expires: {item.expiresIn}</p>
        </div>
      </div>
    </div>
  );

  const renderInvoiceDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{item.id}</h3>
        <Badge variant={
          item.status === 'Paid' ? 'default' :
          item.status === 'Sent' ? 'secondary' :
          item.status === 'Partial' ? 'outline' :
          item.status === 'Overdue' ? 'destructive' : 'secondary'
        }>
          {item.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-muted-foreground">Customer:</span>
          <p className="font-medium">{item.customer}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Project:</span>
          <p className="font-medium">{item.project}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Amount:</span>
          <p className="font-medium text-success text-xl">{item.amount}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Status:</span>
          <p className="font-medium">
            {item.status === 'Paid' ? 'Paid in full' : 
             item.status === 'Overdue' ? 'Payment overdue' : 
             item.status === 'Partial' ? 'Partially paid' :
             'Awaiting payment'}
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Timeline:</div>
        <div className="space-y-1">
          <p>Created: {item.created}</p>
          <p>Due Date: {item.dueDate}</p>
          {item.paidDate && <p>Paid: {item.paidDate}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {type === 'lead' ? 'Lead Details' :
             type === 'estimate' ? 'Estimate Details' : 'Invoice Details'}
          </DialogTitle>
        </DialogHeader>
        
        {type === 'lead' && renderLeadDetails()}
        {type === 'estimate' && renderEstimateDetails()}
        {type === 'invoice' && renderInvoiceDetails()}

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}