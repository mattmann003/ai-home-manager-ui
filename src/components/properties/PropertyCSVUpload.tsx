
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function PropertyCSVUpload() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type !== 'text/csv') {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const properties = lines.slice(1).filter(line => line.trim() !== '').map(line => {
            const values = line.split(',').map(v => v.trim());
            const property: Record<string, string> = {};
            
            headers.forEach((header, i) => {
              property[header] = values[i] || '';
            });
            
            return property;
          });
          
          resolve(properties);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      const properties = await parseCSV(file);
      
      // Verify required fields and format data
      const formattedProperties = properties.map(prop => ({
        name: prop.name || '',
        address: prop.address || '',
        city: prop.city || '',
        state: prop.state || '',
        zip_code: prop.zip_code || '',
        type: prop.type || 'Apartment',
        owner_name: prop.owner_name || null,
        owner_email: prop.owner_email || null,
        owner_phone: prop.owner_phone || null
      }));
      
      // Validate each property
      for (const [index, property] of formattedProperties.entries()) {
        if (!property.name || !property.address || !property.city || !property.state || !property.zip_code) {
          toast.error(`Row ${index + 1}: Missing required fields (name, address, city, state or zip code)`);
          setIsUploading(false);
          return;
        }
      }
      
      // Insert properties in batches of 100
      const batchSize = 100;
      for (let i = 0; i < formattedProperties.length; i += batchSize) {
        const batch = formattedProperties.slice(i, i + batchSize);
        const { error } = await supabase.from('properties').insert(batch);
        
        if (error) {
          throw error;
        }
      }
      
      toast.success(`Successfully imported ${formattedProperties.length} properties`);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setOpen(false);
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading properties:', error);
      toast.error(error.message || 'Failed to import properties');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-1 items-center">
          <Upload className="h-4 w-4" />
          <span>Import CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Properties from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with property data. The CSV should have columns for name, address, city, state, zip_code, type, owner_name, owner_email, and owner_phone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              CSV File
            </label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="border border-input rounded-md px-3 py-2"
            />
            {file && (
              <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
            )}
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Required CSV Format:</h4>
            <code className="text-xs block whitespace-pre overflow-x-auto">
              name,address,city,state,zip_code,type,owner_name,owner_email,owner_phone
            </code>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isUploading || !file}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
