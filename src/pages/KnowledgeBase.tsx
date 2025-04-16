
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { FileUpIcon, BookOpenCheck, BookOpen, UploadCloud, Search, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const KnowledgeBase = () => {
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('general');

  // Placeholder data for knowledge base articles
  const articles = [
    {
      id: '1',
      title: 'How to troubleshoot a leaking faucet',
      category: 'plumbing',
      excerpt: 'Learn the steps to identify and fix common faucet leaks in rental properties.',
      date: '2023-04-15',
      attachments: 2
    },
    {
      id: '2',
      title: 'AC maintenance checklist',
      category: 'hvac',
      excerpt: 'Regular maintenance steps to keep air conditioning units running efficiently.',
      date: '2023-03-22',
      attachments: 1
    },
    {
      id: '3',
      title: 'Emergency response procedures',
      category: 'emergency',
      excerpt: 'Standard procedures for responding to maintenance emergencies.',
      date: '2023-02-10',
      attachments: 3
    },
  ];

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for the article');
      return;
    }
    
    setUploading(true);
    
    try {
      // This is a placeholder for the actual Supabase implementation
      // You would typically upload files to Supabase storage and save article metadata to a table
      
      toast.success('Knowledge base article added successfully');
      
      // Reset form
      setTitle('');
      setContent('');
      setFiles([]);
      setCategory('general');
    } catch (error) {
      console.error('Error uploading knowledge base article:', error);
      toast.error('Failed to upload knowledge base article');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage maintenance guides and information for your team.</p>
        </div>
        
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="browse">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Browse Resources</span>
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadCloud className="h-4 w-4 mr-2" />
              <span>Upload Content</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="w-full rounded-md pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <Card key={article.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                          {article.category}
                        </div>
                        <span className="text-xs text-muted-foreground">{article.date}</span>
                      </div>
                      <CardTitle className="text-lg mt-2">{article.title}</CardTitle>
                      <CardDescription>{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow"></CardContent>
                    <CardFooter className="flex justify-between pt-2 border-t">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <FileUpIcon className="h-3.5 w-3.5 mr-1" />
                        <span>{article.attachments} attachment{article.attachments !== 1 ? 's' : ''}</span>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No articles found. Try a different search term.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Knowledge Base Article</CardTitle>
                <CardDescription>
                  Share maintenance guides, checklists, and reference materials with your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., How to troubleshoot a leaking faucet" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="appliances">Appliances</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea 
                      id="content" 
                      rows={6}
                      placeholder="Enter the content of your knowledge base article..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments</Label>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, Word, Excel, Images, or Videos
                            </p>
                          </div>
                          <Input
                            id="attachments"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label>Selected Files</Label>
                          <ul className="border rounded-md divide-y">
                            {files.map((file, index) => (
                              <li key={index} className="flex items-center justify-between p-2 text-sm">
                                <div className="flex items-center">
                                  <FileUpIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={uploading} className="mt-4">
                    {uploading ? 'Uploading...' : 'Upload Article'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;
