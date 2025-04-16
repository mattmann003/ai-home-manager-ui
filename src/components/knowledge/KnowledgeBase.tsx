
import { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k1',
    category: 'Properties',
    title: 'How to add a new property',
    content: 'To add a new property, click on the "Add Property" button on the Properties page. Fill in the required fields such as property name, address, city, state, zip code, and property type. Owner information is optional. Click "Create Property" to save.'
  },
  {
    id: 'k2',
    category: 'Properties',
    title: 'How to import properties via CSV',
    content: 'You can import multiple properties at once using a CSV file. Click on the dropdown menu next to "Add Property" and select "Import CSV". Upload a CSV file with the following headers: name, address, city, state, zip_code, type. Optional headers: owner_name, owner_email, owner_phone.'
  },
  {
    id: 'k3',
    category: 'Handymen',
    title: 'How to add a new handyman',
    content: 'To add a new handyman, navigate to the Handymen page and click the "Add Handyman" button. Enter the handyman\'s name, email, and optional details like phone number and specialties. You can set their initial availability status as well. Click "Create Handyman" to save.'
  },
  {
    id: 'k4',
    category: 'Handymen',
    title: 'Managing handyman assignments',
    content: 'You can assign handymen to properties by going to a property\'s detail page. Under the "Assigned Handymen" section, click "Assign" to add a handyman to that property. You can also view which properties a handyman is assigned to from their detail page.'
  },
  {
    id: 'k5',
    category: 'Issues',
    title: 'Creating a maintenance issue',
    content: 'To create a new maintenance issue, go to the Issues page and click "Create Issue". Select the affected property, enter a title and description, set the priority, and assign a handyman if needed. You can upload photos of the issue as well.'
  },
  {
    id: 'k6',
    category: 'Issues',
    title: 'Using AI calls for issue resolution',
    content: 'For remote issue resolution, you can use the AI Call feature to initiate an automated call to the tenant or guest. This allows you to collect more information about the issue without sending someone on-site immediately. To use this feature, go to an issue\'s detail page and click the "Call Guest" button.'
  },
  {
    id: 'k7',
    category: 'System',
    title: 'CSV import guidelines',
    content: 'When importing data via CSV, make sure your file follows these guidelines: (1) Include all required headers. (2) Use commas as delimiters. (3) For property imports: name, address, city, state, zip_code, and type are required. (4) For handyman imports: name and email are required. Specialties should be separated by semicolons.'
  },
  {
    id: 'k8',
    category: 'System',
    title: 'Data backup and export',
    content: 'It\'s recommended to backup your data regularly. You can export property, handyman, and issue data from their respective pages. Look for the "Export" option in the page actions. The system also performs automatic backups of your data periodically.'
  }
];

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(knowledgeItems.map(item => item.category)));
  
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      activeCategory === null || item.category === activeCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>
          Find answers to common questions and learn how to use the system.
        </CardDescription>
        <div className="relative flex items-center mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search knowledge base..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {activeCategory !== null && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Filtering by: {activeCategory}
            </span>
            <button 
              onClick={() => setActiveCategory(null)}
              className="text-sm text-primary hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {activeCategory === null && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-medium mb-2">{category}</h3>
              <Accordion type="single" collapsible className="w-full">
                {items.map(item => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none">
                        <p>{item.content}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found for "{searchQuery}".</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeBase;
