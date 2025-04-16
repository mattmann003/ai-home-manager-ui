
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IssuesPerPropertyChart from '@/components/analytics/IssuesPerPropertyChart';
import ResponseTimeChart from '@/components/analytics/ResponseTimeChart';
import CommonIssuesChart from '@/components/analytics/CommonIssuesChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsData, issues } from '@/data/mockData';
import { Calendar, Download, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Analytics = () => {
  // Calculate metrics
  const openIssues = issues.filter(issue => issue.status === "Open").length;
  const resolvedIssues = issues.filter(issue => issue.status === "Resolved").length;
  const totalIssues = issues.length;
  const resolutionRate = Math.round((resolvedIssues / totalIssues) * 100);
  
  // Sample resolution time data
  const resolutionTimeData = [
    { name: 'Jan', time: 32 },
    { name: 'Feb', time: 28 },
    { name: 'Mar', time: 30 },
    { name: 'Apr', time: 24 },
    { name: 'May', time: 26 },
    { name: 'Jun', time: 22 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track and analyze maintenance performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span>Last 30 Days</span>
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openIssues}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-destructive mr-1">
                  <TrendingUp className="h-3 w-3 inline" />
                  12%
                </span>
                compared to last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedIssues}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-success mr-1">
                  <TrendingUp className="h-3 w-3 inline" />
                  18%
                </span>
                compared to last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-success mr-1">
                  <TrendingUp className="h-3 w-3 inline" />
                  5%
                </span>
                compared to last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">27h</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-success mr-1">
                  <TrendingDown className="h-3 w-3 inline" />
                  14%
                </span>
                compared to last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Resolution Time Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={resolutionTimeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="issues" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-4 max-w-md">
            <TabsTrigger value="issues">Issue Analysis</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="handymen">Handymen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <IssuesPerPropertyChart />
              <CommonIssuesChart />
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-6">
            <IssuesPerPropertyChart />
          </TabsContent>
          
          <TabsContent value="handymen" className="space-y-6">
            <ResponseTimeChart />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
