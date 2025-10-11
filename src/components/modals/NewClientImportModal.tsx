import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NewClientImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewClientImportModal({ open, onOpenChange }: NewClientImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          const rows = text.split('\n').filter(row => row.trim());
          
          const { error } = await supabase
            .from('client_imports')
            .insert({
              file_name: file.name,
              import_name: file.name.replace('.csv', ''),
              import_type: 'csv',
              status: 'completed',
              total_records: rows.length - 1, // Exclude header
              successful_imports: rows.length - 1,
              failed_imports: 0,
              user_id: user.id
            });
          
          if (error) reject(error);
          else resolve(null);
        };
        
        reader.onerror = reject;
        reader.readAsText(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_imports'] });
      toast({ title: 'Import started successfully' });
      onOpenChange(false);
      setFile(null);
    },
    onError: () => {
      toast({ 
        title: 'Failed to start import',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    importMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Client Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV File *</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Upload a CSV file with client data
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || importMutation.isPending}>
              {importMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
