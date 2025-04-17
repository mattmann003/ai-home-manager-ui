import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Smartphone, Mail, Bell, UserPlus, UserCog } from 'lucide-react';
import HandymanDispatchSystem from '@/components/communications/HandymanDispatchSystem';

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
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <UserCog className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="messaging">
              <Smartphone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Messaging</span>
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
          
          <TabsContent value="messaging" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Communication Settings</CardTitle>
                <CardDescription>Voice and messaging services are configured in the backend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Communication Services</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Voice assistant (Vapi), WhatsApp, and Twilio services are now configured automatically in the backend.
                            These services handle tenant communications, handyman dispatches, and voice calls without requiring frontend configuration.
                          </p>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-800">Voice Calls - Active</p>
                            </div>
                          </div>
                          <div className="flex items-center mt-4">
                            <div className="flex-shrink-0">
                              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-800">WhatsApp Messaging - Active</p>
                            </div>
                          </div>
                          <div className="flex items-center mt-4">
                            <div className="flex-shrink-0">
                              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-800">SMS Notifications - Active</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <HandymanDispatchSystem />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
