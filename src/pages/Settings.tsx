
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, CreditCard, Smartphone, Mail, Bell, CloudOff, Check, Building, UserPlus, UserCog } from 'lucide-react';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>
        
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Check className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <UserCog className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about different events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Channels</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      </div>
                      <Switch 
                        id="sms-notifications" 
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <Switch 
                        id="push-notifications" 
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="new-issues" defaultChecked />
                      <div className="grid gap-1">
                        <Label htmlFor="new-issues">New Issues</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a new maintenance issue is reported.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="issue-updates" defaultChecked />
                      <div className="grid gap-1">
                        <Label htmlFor="issue-updates">Issue Updates</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when an issue status changes or is updated.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="handyman-responses" defaultChecked />
                      <div className="grid gap-1">
                        <Label htmlFor="handyman-responses">Handyman Responses</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a handyman accepts or declines a job.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="guest-communication" defaultChecked />
                      <div className="grid gap-1">
                        <Label htmlFor="guest-communication">Guest Communication</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when a guest sends a message about an issue.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto gap-1">
                  <Save className="h-4 w-4" />
                  <span>Save Preferences</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>RentalReady API Integration</CardTitle>
                <CardDescription>Connect to the RentalReady API to sync property data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" value="••••••••••••••••••••••••••••" />
                  <p className="text-xs text-muted-foreground">
                    Your API key is used to authenticate requests to the RentalReady API.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input id="api-endpoint" value="https://api.rentalready.com/v1" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Sync Frequency</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger id="sync-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <div className="rounded-md bg-primary/10 p-4">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="text-sm font-medium">Connected to RentalReady</h4>
                        <p className="text-xs text-muted-foreground">Last synced: Today at 10:30 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" className="gap-1">
                  <CloudOff className="h-4 w-4" />
                  <span>Disconnect</span>
                </Button>
                <Button className="gap-1">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Stripe Integration</CardTitle>
                <CardDescription>Connect to Stripe for payment processing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <Input id="stripe-key" type="password" value="••••••••••••••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <Input id="stripe-webhook" type="password" value="••••••••••••••••••••••••••••" />
                </div>
                
                <div className="pt-4">
                  <div className="rounded-md bg-primary/10 p-4">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="text-sm font-medium">Connected to Stripe</h4>
                        <p className="text-xs text-muted-foreground">Account: acct_1A2B3C4D5E6F7G8H9</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" className="gap-1">
                  <CloudOff className="h-4 w-4" />
                  <span>Disconnect</span>
                </Button>
                <Button className="gap-1">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Pro Plan</h3>
                      <p className="text-sm text-muted-foreground">$49.99 per month</p>
                    </div>
                    <Badge variant="outline" className="text-primary">Current Plan</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Unlimited properties</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Unlimited maintenance issues</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>API integrations</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-8 w-12 flex items-center justify-center rounded">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Billing Information</h3>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="name" className="text-xs">Name</Label>
                        <Input id="name" value="John Doe" className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-xs">Email</Label>
                        <Input id="email" value="john.doe@example.com" className="h-8 text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-xs">Address</Label>
                      <Input id="address" value="123 Main St, San Francisco, CA 94105" className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline">Change Plan</Button>
                <Button className="gap-1">
                  <Save className="h-4 w-4" />
                  <span>Update Billing Info</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your recent billing transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-xs font-medium text-left p-2">Date</th>
                        <th className="text-xs font-medium text-left p-2">Description</th>
                        <th className="text-xs font-medium text-left p-2">Amount</th>
                        <th className="text-xs font-medium text-left p-2">Status</th>
                        <th className="text-xs font-medium text-left p-2">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 text-sm">Apr 1, 2023</td>
                        <td className="p-2 text-sm">Pro Plan Subscription</td>
                        <td className="p-2 text-sm">$49.99</td>
                        <td className="p-2">
                          <Badge className="bg-success/10 text-success hover:bg-success/20">Paid</Badge>
                        </td>
                        <td className="p-2">
                          <Button variant="link" size="sm" className="h-auto p-0">Download</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 text-sm">Mar 1, 2023</td>
                        <td className="p-2 text-sm">Pro Plan Subscription</td>
                        <td className="p-2 text-sm">$49.99</td>
                        <td className="p-2">
                          <Badge className="bg-success/10 text-success hover:bg-success/20">Paid</Badge>
                        </td>
                        <td className="p-2">
                          <Button variant="link" size="sm" className="h-auto p-0">Download</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 text-sm">Feb 1, 2023</td>
                        <td className="p-2 text-sm">Pro Plan Subscription</td>
                        <td className="p-2 text-sm">$49.99</td>
                        <td className="p-2">
                          <Badge className="bg-success/10 text-success hover:bg-success/20">Paid</Badge>
                        </td>
                        <td className="p-2">
                          <Button variant="link" size="sm" className="h-auto p-0">Download</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>Manage user roles and access levels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">User Roles</h3>
                    <Button variant="outline" size="sm" className="gap-1">
                      <UserPlus className="h-4 w-4" />
                      <span>Add User</span>
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-xs font-medium text-left p-2">User</th>
                          <th className="text-xs font-medium text-left p-2">Email</th>
                          <th className="text-xs font-medium text-left p-2">Role</th>
                          <th className="text-xs font-medium text-left p-2">Properties</th>
                          <th className="text-xs font-medium text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                                <img src="/placeholder.svg" alt="User" />
                              </div>
                              <span className="text-sm font-medium">John Doe</span>
                            </div>
                          </td>
                          <td className="p-2 text-sm">john.doe@example.com</td>
                          <td className="p-2">
                            <Badge variant="outline">Admin</Badge>
                          </td>
                          <td className="p-2 text-sm">All Properties</td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                                <img src="/placeholder.svg" alt="User" />
                              </div>
                              <span className="text-sm font-medium">Jane Smith</span>
                            </div>
                          </td>
                          <td className="p-2 text-sm">jane.smith@example.com</td>
                          <td className="p-2">
                            <Badge variant="outline">Property Manager</Badge>
                          </td>
                          <td className="p-2 text-sm">Oceanview Villa, Downtown Loft</td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                                <img src="/placeholder.svg" alt="User" />
                              </div>
                              <span className="text-sm font-medium">Mike Brown</span>
                            </div>
                          </td>
                          <td className="p-2 text-sm">mike.brown@example.com</td>
                          <td className="p-2">
                            <Badge variant="outline">Handyman</Badge>
                          </td>
                          <td className="p-2 text-sm">Assigned Properties Only</td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-medium">Role Permissions</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Admin</h4>
                        <Button variant="outline" size="sm">Edit Role</Button>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="admin-view-all" defaultChecked disabled />
                          <Label htmlFor="admin-view-all" className="text-sm">View all properties</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="admin-manage-all" defaultChecked disabled />
                          <Label htmlFor="admin-manage-all" className="text-sm">Manage all issues</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="admin-assign" defaultChecked disabled />
                          <Label htmlFor="admin-assign" className="text-sm">Assign handymen</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="admin-settings" defaultChecked disabled />
                          <Label htmlFor="admin-settings" className="text-sm">Manage settings</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="admin-billing" defaultChecked disabled />
                          <Label htmlFor="admin-billing" className="text-sm">Access billing</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="admin-users" defaultChecked disabled />
                          <Label htmlFor="admin-users" className="text-sm">Manage users</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Property Manager</h4>
                        <Button variant="outline" size="sm">Edit Role</Button>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="pm-view-assigned" defaultChecked disabled />
                          <Label htmlFor="pm-view-assigned" className="text-sm">View assigned properties</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="pm-manage-issues" defaultChecked disabled />
                          <Label htmlFor="pm-manage-issues" className="text-sm">Manage property issues</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="pm-assign" defaultChecked disabled />
                          <Label htmlFor="pm-assign" className="text-sm">Assign handymen</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="pm-settings" disabled />
                          <Label htmlFor="pm-settings" className="text-sm">Manage settings</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="pm-billing" disabled />
                          <Label htmlFor="pm-billing" className="text-sm">Access billing</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="pm-users" disabled />
                          <Label htmlFor="pm-users" className="text-sm">Manage users</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto gap-1">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
