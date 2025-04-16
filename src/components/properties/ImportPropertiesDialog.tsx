
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImportPropertiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const ImportPropertiesDialog = ({ open, onOpenChange, onImportComplete }: ImportPropertiesDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const parseCSV = async (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    const expectedHeaders = ['name', 'address', 'city', 'state', 'zip_code', 'type'];
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    const properties = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      if (values.length !== headers.length) {
        errors.push(`Line ${i + 1}: Invalid format, expected ${headers.length} columns but got ${values.length}`);
        continue;
      }
      
      const property: Record<string, any> = {};
      headers.forEach((header, index) => {
        property[header] = values[index] || null;
        
        // Special case for optional columns
        if (['owner_name', 'owner_email', 'owner_phone'].includes(header) && !values[index]) {
          property[header] = null;
        }
      });
      
      properties.push(property);
    }
    
    return { properties, errors };
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const text = await file.text();
      const { properties, errors } = await parseCSV(text);
      
      if (properties.length === 0) {
        throw new Error('No valid properties found in the CSV file');
      }
      
      // Insert properties in batches of 100
      const batchSize = 100;
      let successCount = 0;
      
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        const { error, count } = await supabase
          .from('properties')
          .insert(batch);
        
        if (error) {
          console.error('Error importing properties batch:', error);
          errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        } else {
          successCount += count || batch.length;
        }
      }
      
      setUploadResult({
        success: successCount,
        failed: properties.length - successCount,
        errors
      });
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} properties`);
        if (errors.length === 0) {
          onImportComplete();
        }
      } else {
        toast.error('Failed to import properties');
      }
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error(`Error: ${error.message}`);
      setUploadResult({
        success: 0,
        failed: 0,
        errors: [error.message]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (uploadResult && uploadResult.success > 0) {
      onImportComplete();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Properties</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing property details. 
            The CSV should have headers: name, address, city, state, zip_code, type. 
            Optional fields: owner_name, owner_email, owner_phone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="csv-upload" 
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                ${file ? 'border-primary/70 bg-primary/5' : 'border-muted-foreground/30 hover:border-muted-foreground/50'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileText className="w-8 h-8 mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">CSV file only</p>
                  </>
                )}
              </div>
              <Input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          
          {uploadResult && (
            <div className={`p-3 rounded-md ${
              uploadResult.success > 0 && uploadResult.failed === 0 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2">
                {uploadResult.success > 0 && uploadResult.failed === 0 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {uploadResult.success} properties imported successfully
                    {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2 text-xs max-h-24 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <p key={index} className="text-destructive">{error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleImport}
            disabled={!file || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="h-4 w-4" /> 
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPropertiesDialog;
