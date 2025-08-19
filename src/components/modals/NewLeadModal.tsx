import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface NewLeadModalProps {
  onLeadAdded?: (lead: any) => void;
}

export default function NewLeadModal({ onLeadAdded }: NewLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project: '',
    source: '',
    priority: 'Medium',
    value: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new lead object
    const newLead = {
      id: Date.now(),
      ...formData,
      status: 'New',
      created: 'Just now',
      nextFollowUp: 'Today, 3:00 PM'
    };

    // Simulate saving
    toast({
      title: "Lead Created",
      description: `${formData.name} has been added to your leads.`
    });

    // Reset form and close modal
    setFormData({
      name: '',
      email: '',
      phone: '',
      project: '',
      source: '',
      priority: 'Medium',
      value: '',
      notes: ''
    });
    setOpen(false);

    // Callback for parent component
    onLeadAdded?.(newLead);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value</Label>
              <Input
                id="value"
                placeholder="$5,000"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project Type *</Label>
            <Select value={formData.project} onValueChange={(value) => setFormData({...formData, project: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Complete Roof Replacement">Complete Roof Replacement</SelectItem>
                <SelectItem value="Roof Repair">Roof Repair</SelectItem>
                <SelectItem value="Gutter Installation">Gutter Installation</SelectItem>
                <SelectItem value="Roof Inspection">Roof Inspection</SelectItem>
                <SelectItem value="Emergency Repair">Emergency Repair</SelectItem>
                <SelectItem value="Shingle Replacement">Shingle Replacement</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({...formData, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="How did they find you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about the lead..."
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
              Create Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}