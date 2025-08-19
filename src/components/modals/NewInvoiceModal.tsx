import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface NewInvoiceModalProps {
  onInvoiceAdded?: (invoice: any) => void;
}

export default function NewInvoiceModal({ onInvoiceAdded }: NewInvoiceModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    project: '',
    dueDate: '',
    paymentTerms: '30',
    notes: ''
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const { toast } = useToast();

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInvoice = {
      id: `INV-${String(Date.now()).slice(-3)}`,
      ...formData,
      amount: `$${totalAmount.toLocaleString()}`,
      status: 'Draft',
      created: new Date().toISOString().split('T')[0],
      paidDate: null
    };

    toast({
      title: "Invoice Created",
      description: `Invoice ${newInvoice.id} has been created successfully.`
    });

    // Reset form
    setFormData({
      customer: '',
      project: '',
      dueDate: '',
      paymentTerms: '30',
      notes: ''
    });
    setLineItems([{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }]);
    setOpen(false);

    onInvoiceAdded?.(newInvoice);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project Description *</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData({...formData, project: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({...formData, paymentTerms: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due Immediately</SelectItem>
                  <SelectItem value="15">Net 15 Days</SelectItem>
                  <SelectItem value="30">Net 30 Days</SelectItem>
                  <SelectItem value="45">Net 45 Days</SelectItem>
                  <SelectItem value="60">Net 60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" onClick={addLineItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs">Description</Label>}
                    <Input
                      placeholder="Description of work completed"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">Quantity</Label>}
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">Rate ($)</Label>}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">Amount</Label>}
                    <Input
                      value={`$${item.amount.toFixed(2)}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    {lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        className="p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold text-success">${totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Payment instructions or additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark">
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}