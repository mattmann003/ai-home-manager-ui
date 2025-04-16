
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  BarChart3,
  Building2,
  HardHat,
  Home,
  Settings,
  Wrench,
  BookOpen,
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className={cn('h-screen w-64 border-r bg-background flex-shrink-0 overflow-hidden', className)}>
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link to="/">
                <Button
                  variant={pathname === '/' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/issues">
                <Button
                  variant={pathname.startsWith('/issues') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Maintenance Issues
                </Button>
              </Link>
              <Link to="/properties">
                <Button
                  variant={pathname.startsWith('/properties') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Properties
                </Button>
              </Link>
              <Link to="/handymen">
                <Button
                  variant={pathname.startsWith('/handymen') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <HardHat className="mr-2 h-4 w-4" />
                  Handymen
                </Button>
              </Link>
            </div>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Insights
            </h2>
            <div className="space-y-1">
              <Link to="/analytics">
                <Button
                  variant={pathname.startsWith('/analytics') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link to="/knowledge">
                <Button
                  variant={pathname.startsWith('/knowledge') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Knowledge Base
                </Button>
              </Link>
            </div>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link to="/settings">
                <Button
                  variant={pathname === '/settings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
