
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--muted))'];

type ResolutionChartProps = {
  aiCalls: any[];
};

const AiResolutionChart = ({ aiCalls }: ResolutionChartProps) => {
  // Process data to count resolution types
  const processData = () => {
    if (!aiCalls || aiCalls.length === 0) return [];
    
    // Count resolutions
    const resolutionCounts: Record<string, number> = {};
    
    aiCalls.forEach(call => {
      const resolution = call.resolution || 'Pending';
      if (resolution.toLowerCase().includes('resolved') || resolution.toLowerCase().includes('completed')) {
        resolutionCounts['Resolved'] = (resolutionCounts['Resolved'] || 0) + 1;
      } else if (resolution.toLowerCase().includes('failed') || resolution.toLowerCase().includes('error')) {
        resolutionCounts['Failed'] = (resolutionCounts['Failed'] || 0) + 1;
      } else if (resolution.toLowerCase() === 'pending' || !call.resolution) {
        resolutionCounts['Pending'] = (resolutionCounts['Pending'] || 0) + 1;
      } else {
        resolutionCounts['Other'] = (resolutionCounts['Other'] || 0) + 1;
      }
    });
    
    // Convert to chart data
    return Object.entries(resolutionCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const data = processData();
  
  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">AI Call Resolutions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No AI call data available</p>
        </CardContent>
      </Card>
    );
  }
  
  // Custom renderer for the pie chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">AI Call Resolutions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => {
                  // Assign colors based on resolution type
                  let colorIndex = 3; // Default to muted
                  if (entry.name === 'Resolved') colorIndex = 0; // Success
                  else if (entry.name === 'Failed') colorIndex = 1; // Destructive
                  else if (entry.name === 'Pending') colorIndex = 2; // Primary
                  
                  return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                formatter={(value) => [`${value} calls`, 'Count']}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right" 
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiResolutionChart;
