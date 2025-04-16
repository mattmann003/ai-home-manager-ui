
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AiCallData = {
  name: string;
  value: number;
}

const AiCallAnalyticsChart = ({ aiCalls }: { aiCalls: any[] }) => {
  const [timeframe, setTimeframe] = useState("week");
  
  // Process data based on selected timeframe
  const processData = () => {
    if (!aiCalls || aiCalls.length === 0) return [];
    
    let data: AiCallData[] = [];
    const now = new Date();
    
    if (timeframe === "week") {
      // Get data for the last 7 days
      const lastWeek = new Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(now.getDate() - (6 - i));
        return { 
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: 0,
          date: new Date(date.setHours(0, 0, 0, 0))
        };
      });
      
      // Count calls per day
      aiCalls.forEach(call => {
        const callDate = new Date(call.timestamp);
        const dayIndex = lastWeek.findIndex(day => {
          const dayDate = day.date;
          return callDate >= dayDate && callDate < new Date(dayDate.getTime() + 24 * 60 * 60 * 1000);
        });
        
        if (dayIndex !== -1) {
          lastWeek[dayIndex].value++;
        }
      });
      
      data = lastWeek.map(d => ({ name: d.name, value: d.value }));
    } else if (timeframe === "month") {
      // Get data for the last 4 weeks
      const lastMonth = new Array(4).fill(0).map((_, i) => {
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - (7 * (3 - i) + 6));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return { 
          name: `Week ${i + 1}`,
          weekStart,
          weekEnd,
          value: 0 
        };
      });
      
      // Count calls per week
      aiCalls.forEach(call => {
        const callDate = new Date(call.timestamp);
        const weekIndex = lastMonth.findIndex(week => 
          callDate >= week.weekStart && callDate <= week.weekEnd
        );
        
        if (weekIndex !== -1) {
          lastMonth[weekIndex].value++;
        }
      });
      
      data = lastMonth.map(d => ({ name: d.name, value: d.value }));
    } else if (timeframe === "year") {
      // Get data for the last 12 months
      const lastYear = new Array(12).fill(0).map((_, i) => {
        const date = new Date();
        date.setMonth(now.getMonth() - (11 - i));
        return { 
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          month: date.getMonth(),
          year: date.getFullYear(),
          value: 0 
        };
      });
      
      // Count calls per month
      aiCalls.forEach(call => {
        const callDate = new Date(call.timestamp);
        const monthIndex = lastYear.findIndex(m => 
          m.month === callDate.getMonth() && m.year === callDate.getFullYear()
        );
        
        if (monthIndex !== -1) {
          lastYear[monthIndex].value++;
        }
      });
      
      data = lastYear.map(d => ({ name: d.name, value: d.value }));
    }
    
    return data;
  };

  const chartData = processData();
  
  // Calculate the maximum value for better Y axis scaling
  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const yAxisMax = Math.ceil(maxValue * 1.2); // 20% headroom
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">AI Call Volume</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={12}
                stroke="#888"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={12}
                stroke="#888"
                domain={[0, yAxisMax]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                cursor={{ fill: 'rgba(236, 240, 243, 0.5)' }}
                formatter={(value) => [`${value} calls`, 'Volume']}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={36}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.value > (maxValue/2) ? "hsl(var(--primary))" : "hsl(var(--primary)/0.7)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiCallAnalyticsChart;
