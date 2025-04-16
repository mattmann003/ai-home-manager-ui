
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handymen } from '@/data/mockData';

const HandymanResponseTime = () => {
  // Sort handymen by response time (ascending)
  const sortedHandymen = [...handymen].sort((a, b) => a.responseTime - b.responseTime);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Handyman Response Time</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-xs font-medium text-left p-4">Handyman</th>
                <th className="text-xs font-medium text-center p-4">Status</th>
                <th className="text-xs font-medium text-right p-4">Avg. Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedHandymen.map((handyman) => (
                <tr key={handyman.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                        <img
                          src={handyman.image}
                          alt={handyman.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{handyman.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {handyman.specialties.join(', ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                        handyman.availability === 'Available'
                          ? 'bg-success/10 text-success'
                          : handyman.availability === 'Busy'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {handyman.availability}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-medium">{handyman.responseTime} mins</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HandymanResponseTime;
