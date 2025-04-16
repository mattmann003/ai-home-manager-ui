
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DurationChartProps = {
  aiCalls: any[];
};

const AiCallDurationChart = ({ aiCalls }: DurationChartProps) => {
  // Process data to calculate average duration by property
  const processData = () => {
    if (!aiCalls || aiCalls.length === 0) return [];
    
    // Group calls by property and calculate average duration
    const propertyDurations: Record<string, { total: number, count: number, propertyName: string }> = {};
    
    aiCalls.forEach(call => {
      if (!call.issue_id) return;
      
      // Use issue ID as property identifier if we don't have property name
      const propertyId = call.property_id || call.issue_id;
      const propertyName = call.property_name || `Property ${propertyId.substring(0, 6)}`;
      
      if (!propertyDurations[propertyId]) {
        propertyDurations[propertyId] = { total: 0, count: 0, propertyName };
      }
      
      propertyDurations[propertyId].total += call.duration;
      propertyDurations[propertyId].count += 1;
    });
    
    // Convert to chart data and calculate averages
    return Object.entries(propertyDurations)
      .map(([id, { total, count, propertyName }]) => ({
        propertyName: propertyName,
        avgDuration: Math.round(total / count),
        id
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5); // Top 5 properties
  };

  const data = processData();
  
  // Format duration for display (seconds to minutes:seconds)
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Average Call Duration by Property</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 30,
                  left: 100,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="#888"
                  tickFormatter={formatDuration}
                />
                <YAxis 
                  dataKey="propertyName" 
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="#888"
                  width={95}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                  formatter={(value) => [formatDuration(value as number), 'Average Duration']}
                  cursor={{ fill: 'rgba(236, 240, 243, 0.5)' }}
                />
                <Bar
                  dataKey="avgDuration"
                  fill="hsl(var(--accent))"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No duration data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiCallDurationChart;
