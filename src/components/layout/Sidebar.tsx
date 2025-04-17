
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Home, 
  Users, 
  BarChart3, 
  Settings,
} from 'lucide-react';

type NavItemProps = {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
};

const NavItem = ({ href, icon: Icon, title, isActive }: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-foreground/70 hover:bg-primary/5 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { href: '/', icon: LayoutDashboard, title: 'Dashboard' },
    { href: '/issues', icon: AlertCircle, title: 'Issues' },
    { href: '/properties', icon: Home, title: 'Properties' },
    { href: '/handymen', icon: Users, title: 'Handymen' },
    { href: '/analytics', icon: BarChart3, title: 'Analytics' },
    { href: '/settings', icon: Settings, title: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">AI Maintenance</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
      </div>
      
      <div className="border-t p-3">
        <div className="px-3 py-2">
          <div className="text-xs text-muted-foreground">
            <p>Assistant</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
