
import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Wrench, User2, Settings, BarChart3, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Properties',
    href: '/properties',
    icon: Building,
  },
  {
    title: 'Maintenance',
    href: '/issues',
    icon: Wrench,
  },
  {
    title: 'Handymen',
    href: '/handymen',
    icon: User2,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Communications',
    href: '/communications',
    icon: PhoneCall,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <div className="group flex flex-col h-full bg-background border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground p-1 rounded text-xs">PM</span>
          <span className="font-semibold">PropManage</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {mainNavItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
