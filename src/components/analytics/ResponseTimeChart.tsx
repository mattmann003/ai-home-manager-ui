
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyticsData } from '@/data/mockData';

const ResponseTimeChart = () => {
  const data = analyticsData.responseTimeByHandyman;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Response Time by Handyman</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 10,
                right: 10,
                left: 120,
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
                label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="handymanName" 
                type="category"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={12}
                stroke="#888"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                cursor={{ fill: 'rgba(236, 240, 243, 0.5)' }}
              />
              <Bar
                dataKey="responseTime"
                fill="hsl(var(--accent))"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseTimeChart;
