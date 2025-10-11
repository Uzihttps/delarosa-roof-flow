import { useState } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NewClientImportModal from '@/components/modals/NewClientImportModal';
import { format } from 'date-fns';

export default function ClientImports() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: imports = [], isLoading } = useQuery({
    queryKey: ['client_imports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_imports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_imports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_imports'] });
      toast({ title: 'Import deleted' });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Data Imports</h1>
          <p className="text-muted-foreground">Import client data from CSV files</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          New Import
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : imports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No imports yet. Upload your first CSV file!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {imports.map((importRecord) => (
            <Card key={importRecord.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{importRecord.file_name}</CardTitle>
                    <CardDescription>
                      {format(new Date(importRecord.created_at), 'MMM dd, yyyy HH:mm')}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(importRecord.status)} className="flex items-center gap-1">
                    {getStatusIcon(importRecord.status)}
                    {importRecord.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Import Name:</span>
                    <span className="font-medium">{importRecord.import_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{importRecord.import_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Records:</span>
                    <span className="font-medium">{importRecord.total_records}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successful:</span>
                    <span className="font-medium text-green-600">{importRecord.successful_imports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed:</span>
                    <span className="font-medium text-destructive">{importRecord.failed_imports}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(importRecord.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewClientImportModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
