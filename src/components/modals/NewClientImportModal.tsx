import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewClientImportModalProps {
  onImportAdded?: (importData: any) => void;
  children: React.ReactNode;
}

export function NewClientImportModal({ onImportAdded, children }: NewClientImportModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    importName: '',
    importType: '',
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        if (!formData.importName) {
          setFormData(prev => ({ ...prev, importName: file.name.replace('.csv', '') }));
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        if (!formData.importName) {
          setFormData(prev => ({ ...prev, importName: file.name.replace('.csv', '') }));
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
      }
    }
  };

  const simulateProcessing = async (importId: string) => {
    // Simulate processing with random data
    const totalRecords = Math.floor(Math.random() * 500) + 50;
    const processingTime = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
    
    setTimeout(async () => {
      const successRate = Math.random() * 0.3 + 0.7; // 70-100% success rate
      const successful = Math.floor(totalRecords * successRate);
      const failed = totalRecords - successful;
      
      await supabase
        .from('client_imports')
        .update({
          status: 'completed',
          total_records: totalRecords,
          successful_imports: successful,
          failed_imports: failed,
        })
        .eq('id', importId);
    }, processingTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.importName || !formData.importType || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to import data.",
          variant: "destructive",
        });
        return;
      }

      const importData = {
        user_id: user.id,
        import_name: formData.importName,
        file_name: selectedFile.name,
        import_type: formData.importType as 'leads' | 'customers' | 'projects',
        status: 'processing' as const,
        total_records: 0,
        successful_imports: 0,
        failed_imports: 0,
      };

      const { data, error } = await supabase
        .from('client_imports')
        .insert([importData])
        .select()
        .single();

      if (error) throw error;

      // Start simulated processing
      simulateProcessing(data.id);

      toast({
        title: "Import started",
        description: `Processing ${selectedFile.name}...`,
      });

      // Reset form
      setFormData({
        importName: '',
        importType: '',
      });
      setSelectedFile(null);
      setOpen(false);

      onImportAdded?.(data);
    } catch (error: any) {
      toast({
        title: "Error starting import",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Client Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="importName">Import Name *</Label>
              <Input
                id="importName"
                value={formData.importName}
                onChange={(e) => setFormData({ ...formData, importName: e.target.value })}
                placeholder="Enter a name for this import"
                required
              />
            </div>

            <div>
              <Label htmlFor="importType">Data Type *</Label>
              <Select value={formData.importType} onValueChange={(value) => setFormData({ ...formData, importType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>CSV File *</Label>
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your CSV file here, or{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Only CSV files are supported
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your CSV file follows the correct format. Download the appropriate template from the main imports page.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Starting Import..." : "Start Import"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}