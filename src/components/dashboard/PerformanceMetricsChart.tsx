
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

type TimeRange = '7' | '30' | '90';

type DataPoint = {
  date: string;
  formattedDate: string;
  responseTime: number;
  resolutionTime: number;
};

const PerformanceMetricsChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch actual performance metrics from Supabase
        // For this example, we'll generate sample data
        const days = parseInt(timeRange);
        const endDate = new Date();
        const startDate = subDays(endDate, days);
        
        // Generate sample data for the selected time range
        const sampleData: DataPoint[] = [];
        for (let i = 0; i < days; i++) {
          const currentDate = subDays(endDate, days - i - 1);
          const formattedDate = format(currentDate, 'MMM dd');
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          
          // Simulate some variation in response and resolution times
          // In a real app, these would come from the database
          const baseResponseTime = 1.5; // hours
          const baseResolutionTime = 8; // hours
          const variationResponse = Math.random() * 1 - 0.5; // -0.5 to 0.5
          const variationResolution = Math.random() * 3 - 1.5; // -1.5 to 1.5
          
          sampleData.push({
            date: dateStr,
            formattedDate,
            responseTime: Math.max(0.5, baseResponseTime + variationResponse),
            resolutionTime: Math.max(4, baseResolutionTime + variationResolution),
          });
        }
        
        setData(sampleData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast.error('Failed to load performance metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  return (
    <Card className="col-span-2 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-base font-medium">Performance Metrics</CardTitle>
          <CardDescription>Response and resolution time trends</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">About these metrics</h4>
                <p className="text-sm text-muted-foreground">
                  Response Time: Average time until a handyman responds to an issue.
                  <br />
                  Resolution Time: Average time until an issue is marked as resolved.
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-opacity-50 border-t-primary rounded-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickFormatter={(value) => `${value}h`}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Hours', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12, textAnchor: 'middle' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [
                  `${Number(value).toFixed(1)}h`,
                  ``
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend 
                align="center" 
                verticalAlign="bottom" 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                name="Response Time"
                stroke="#1EAEDB"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="resolutionTime"
                name="Resolution Time"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsChart;
