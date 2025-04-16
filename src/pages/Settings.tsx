
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
import { Save, Smartphone, Mail, Bell, UserPlus, UserCog, Phone } from 'lucide-react';
import VapiCallInfo from '@/components/dashboard/VapiCallInfo';
import WhatsAppSetup from '@/components/communications/WhatsAppSetup';
import VapiAgentConfig from '@/components/communications/VapiAgentConfig';

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
            <TabsTrigger value="communications">
              <Phone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Communications</span>
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
          
          <TabsContent value="communications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <VapiCallInfo />
              <WhatsAppSetup />
            </div>
            
            <VapiAgentConfig />
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Communication Settings</CardTitle>
                <CardDescription>Configure how communication channels work with your maintenance system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Automatic Responses</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="auto-create-tickets" defaultChecked />
                        <Label htmlFor="auto-create-tickets">Auto-create tickets from messages</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="send-confirmations" defaultChecked />
                        <Label htmlFor="send-confirmations">Send confirmation messages</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-status-changes" defaultChecked />
                        <Label htmlFor="notify-status-changes">Notify on status changes</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Message Templates</h3>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-issue-template">New Issue Template</Label>
                      <Input 
                        id="new-issue-template" 
                        defaultValue="Thank you for reporting your maintenance issue. We have created ticket #{issue_id} and will address it soon." 
                      />
                      <p className="text-xs text-muted-foreground">
                        Available variables: {'{issue_id}'}, {'{property_name}'}, {'{guest_name}'}
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status-update-template">Status Update Template</Label>
                      <Input 
                        id="status-update-template" 
                        defaultValue="Your maintenance issue (#{issue_id}) status has been updated to {status}." 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto gap-1">
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
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
