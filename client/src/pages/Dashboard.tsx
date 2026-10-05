import { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState({
    stats: { total: 0, inUse: 0, available: 0, maintenance: 0 },
    recentAssets: [] as any[],
    chartData: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth()
  useEffect(() => {
    if (!user) return;
    const query = user?.role === 'Staff' && user.email ? `?email=${encodeURIComponent(user.email)}` : '';
    fetch(`https://asset-mgt-ewkj.onrender.com/api/dashboard${query}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(user as any)?.token}`
      }
    })
      
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })

      .then(fetchedData => {
        // Safely set the bundled state
        if (fetchedData && fetchedData.stats) {
          setData({
            stats: fetchedData.stats,
            recentAssets: fetchedData.recentAssets || [],
            chartData: fetchedData.chartData || []
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard:', err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of University of Ibadan Assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {[
          { title: 'Total Assets', value: data.stats.total, icon: Package, color: 'text-blue-600' },
          { title: 'Active / In Use', value: data.stats.inUse, icon: CheckCircle, color: 'text-green-600' },
          { title: 'Available', value: data.stats.available, icon: AlertCircle, color: 'text-yellow-600' },
          { title: 'Under Maintenance', value: data.stats.maintenance, icon: Wrench, color: 'text-ui-blue' },
        ].map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-3 rounded-lg bg-gray-50 ${card.color}`}><card.icon className="w-8 h-8" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assets by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#800020" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Assets</h3>
          <div className="overflow-x-auto w-full pb-2">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Asset ID</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.recentAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{asset.asset_id}</td>
                    <td className="py-3 text-gray-600">{asset.name}</td>
                    <td className="py-3 text-gray-600">{asset.category?.name}</td>
                    <td className="py-3 text-gray-600">{asset.department?.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${asset.status === 'In Use' ? 'bg-green-100 text-green-700' : 
                          asset.status === 'Available' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


// ========AI=========
// function useAuth(): { user: any; } {
//   throw new Error('Function not implemented.');
// }
