import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { NewClientImportModal } from '@/components/modals/NewClientImportModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ClientImport {
  id: string;
  import_name: string;
  file_name: string;
  file_url?: string;
  status: 'processing' | 'completed' | 'failed';
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  import_type: 'leads' | 'customers' | 'projects';
  created_at: string;
}

export default function ClientImports() {
  const [imports, setImports] = useState<ClientImport[]>([]);
  const [filteredImports, setFilteredImports] = useState<ClientImport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImports();
  }, []);

  useEffect(() => {
    filterImports();
  }, [imports, searchTerm, statusFilter, typeFilter]);

  const fetchImports = async () => {
    try {
      const { data, error } = await supabase
        .from('client_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImports((data || []) as ClientImport[]);
    } catch (error) {
      toast({
        title: "Error fetching imports",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterImports = () => {
    let filtered = imports;

    if (searchTerm) {
      filtered = filtered.filter(imp =>
        imp.import_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imp.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(imp => imp.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(imp => imp.import_type === typeFilter);
    }

    setFilteredImports(filtered);
  };

  const handleImportAdded = (newImport: ClientImport) => {
    setImports(prev => [newImport, ...prev]);
    toast({
      title: "Import started",
      description: "Your file is being processed...",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (imp: ClientImport) => {
    if (imp.total_records === 0) return 0;
    return ((imp.successful_imports + imp.failed_imports) / imp.total_records) * 100;
  };

  const downloadTemplate = (type: string) => {
    const templates = {
      leads: 'name,email,phone,company,project_type,source,priority,value,notes\nJohn Doe,john@example.com,555-0123,Acme Corp,Kitchen Remodel,Website,High,15000,Interested in modern design',
      customers: 'name,email,phone,company,address,created_date,status,notes\nJane Smith,jane@example.com,555-0124,Smith Inc,123 Main St,2024-01-15,Active,Long-term client',
      projects: 'name,description,client_name,client_email,start_date,end_date,budget,status,notes\nBathroom Renovation,Full bathroom remodel,Bob Wilson,bob@example.com,2024-02-01,2024-03-15,8000,In Progress,Using premium fixtures'
    };

    const content = templates[type as keyof typeof templates];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Upload className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Client Data Imports</h1>
        </div>
        <NewClientImportModal onImportAdded={handleImportAdded}>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </NewClientImportModal>
      </div>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Download Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download CSV templates to ensure your data is formatted correctly before importing.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadTemplate('leads')}>
              <FileText className="h-4 w-4 mr-2" />
              Leads Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadTemplate('customers')}>
              <FileText className="h-4 w-4 mr-2" />
              Customers Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadTemplate('projects')}>
              <FileText className="h-4 w-4 mr-2" />
              Projects Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search imports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="customers">Customers</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Imports List */}
      <div className="space-y-4">
        {filteredImports.map((imp) => (
          <Card key={imp.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{imp.import_name}</h3>
                  <p className="text-sm text-muted-foreground">{imp.file_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(imp.status)}>
                    {getStatusIcon(imp.status)}
                    <span className="ml-1 capitalize">{imp.status}</span>
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {imp.import_type}
                  </Badge>
                </div>
              </div>

              {imp.status === 'processing' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round(calculateProgress(imp))}%</span>
                  </div>
                  <Progress value={calculateProgress(imp)} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Records</p>
                  <p className="font-medium">{imp.total_records.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Successful</p>
                  <p className="font-medium text-green-600">{imp.successful_imports.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Failed</p>
                  <p className="font-medium text-red-600">{imp.failed_imports.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(imp.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {imp.status === 'failed' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  Import failed. Please check your file format and try again.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredImports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No imports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by importing your first client data file'}
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <NewClientImportModal onImportAdded={handleImportAdded}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </NewClientImportModal>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}