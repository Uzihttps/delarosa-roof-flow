import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MessageSquare } from 'lucide-react';

interface FollowUpModalProps {
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  children: React.ReactNode;
}

export default function FollowUpModal({ leadName, leadPhone, leadEmail, children }: FollowUpModalProps) {
  const [open, setOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let actionText = '';
    switch (followUpType) {
      case 'call':
        actionText = 'Phone call scheduled';
        break;
      case 'email':
        actionText = 'Email follow-up scheduled';
        break;
      case 'text':
        actionText = 'Text message scheduled';
        break;
      default:
        actionText = 'Follow-up scheduled';
    }

    toast({
      title: "Follow-up Scheduled",
      description: `${actionText} with ${leadName} for ${scheduledDate} at ${scheduledTime}.`
    });

    // Reset form and close modal
    setFollowUpType('');
    setScheduledDate('');
    setScheduledTime('');
    setMessage('');
    setOpen(false);
  };

  const getTemplateMessage = (type: string) => {
    switch (type) {
      case 'call':
        return `Hi ${leadName}, this is De La Rosa Roofing. I wanted to follow up on your roofing project inquiry. When would be a good time to discuss your needs?`;
      case 'email':
        return `Dear ${leadName},\n\nThank you for your interest in De La Rosa Roofing services. I wanted to follow up on your recent inquiry about your roofing project.\n\nWe specialize in quality roofing solutions and would love to discuss how we can help with your specific needs.\n\nBest regards,\nDe La Rosa Roofing Team`;
      case 'text':
        return `Hi ${leadName}, this is De La Rosa Roofing. Following up on your roofing inquiry. Can we schedule a quick call to discuss your project?`;
      default:
        return '';
    }
  };

  const handleTypeChange = (type: string) => {
    setFollowUpType(type);
    setMessage(getTemplateMessage(type));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up with {leadName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Follow-up Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={followUpType === 'call' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('call')}
                className="flex items-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </Button>
              <Button
                type="button"
                variant={followUpType === 'email' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('email')}
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
              <Button
                type="button"
                variant={followUpType === 'text' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('text')}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Text</span>
              </Button>
            </div>
          </div>

          {followUpType && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  {followUpType === 'call' ? 'Call Notes/Script' : 
                   followUpType === 'email' ? 'Email Message' : 'Text Message'}
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={followUpType === 'email' ? 6 : 3}
                  className="resize-none"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <strong>Contact Info:</strong><br />
                {leadPhone && <span>Phone: {leadPhone}<br /></span>}
                {leadEmail && <span>Email: {leadEmail}</span>}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark"
              disabled={!followUpType || !scheduledDate || !scheduledTime}
            >
              Schedule Follow-up
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}