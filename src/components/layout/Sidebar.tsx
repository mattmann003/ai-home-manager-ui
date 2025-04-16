
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Home, 
  Users, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';

type SidebarLinkProps = {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
  isCollapsed: boolean;
};

const SidebarLink = ({ href, icon: Icon, title, isActive, isCollapsed }: SidebarLinkProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
      {!isCollapsed && <span>{title}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { href: '/', icon: LayoutDashboard, title: 'Dashboard' },
    { href: '/issues', icon: AlertCircle, title: 'Issues' },
    { href: '/properties', icon: Home, title: 'Properties' },
    { href: '/handymen', icon: Users, title: 'Handymen' },
    { href: '/knowledge-base', icon: BookOpenCheck, title: 'Knowledge Base' },
    { href: '/analytics', icon: BarChart3, title: 'Analytics' },
    { href: '/settings', icon: Settings, title: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all h-screen sticky top-0 shadow-sm",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!isCollapsed && (
          <Link to="/" className="font-semibold text-lg flex items-center space-x-1">
            <span className="text-primary">AI</span>
            <span>Maintenance</span>
          </Link>
        )}
        <button 
          onClick={toggleSidebar} 
          className={cn(
            "p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground",
            isCollapsed && "ml-auto mr-auto"
          )}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            isActive={location.pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      <div className="border-t p-3">
        <div className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground",
          isCollapsed && "justify-center px-2"
        )}>
          {!isCollapsed && (
            <div className="text-xs text-sidebar-foreground/70">
              <p>AI Maintenance Assistant</p>
              <p>v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
