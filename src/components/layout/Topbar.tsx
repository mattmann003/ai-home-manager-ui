
import { Bell, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Topbar = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, content: 'New issue reported at Oceanview Villa', isRead: false },
    { id: 2, content: 'Mike Brown resolved "No Hot Water" issue', isRead: false },
    { id: 3, content: 'Smoke detector issue marked as resolved', isRead: true },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center">
          <div className="flex h-7 w-7 items-center justify-center rounded border">
            <img src="/placeholder.svg" alt="Logo" className="h-5 w-5" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-primary text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    onClick={markAllAsRead} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    onClick={() => markAsRead(notification.id)}
                    className="px-3 py-2 focus:bg-accent cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`h-2 w-2 mt-1.5 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                      <div>
                        <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="font-medium">John Doe</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
