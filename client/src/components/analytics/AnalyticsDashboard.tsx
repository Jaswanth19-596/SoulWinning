import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Heart, Droplets, TrendingUp } from 'lucide-react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../shared/Loading';

const AnalyticsDashboard: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
     totalRiders: 0,
     totalProspects: 0,
     salvations: 0,
     baptisms: 0,
     attendanceData: [] as any[]
  });

  useEffect(() => {
    if (!session?.bus_route) return;
    const busRoute = session.bus_route;

    const fetchData = async () => {
       try {
          // Filter by bus_route instead of fetching ALL documents globally
          const ridersSnap = await getDocs(
            query(
              collection(db, 'riders'),
              where('bus_route', '==', busRoute)
            )
          );
          const prospectsSnap = await getDocs(
            query(
              collection(db, 'prospects'),
              where('bus_route', '==', busRoute)
            )
          );
          
          let salvationsCount = 0;
          let baptismsCount = 0;
          const currentYear = new Date().getFullYear();

          ridersSnap.forEach(doc => {
             const data = doc.data();
             if (data.salvation_date && data.salvation_date.startsWith(currentYear.toString())) salvationsCount++;
             if (data.baptism_date && data.baptism_date.startsWith(currentYear.toString())) baptismsCount++;
          });

          // Fetch only last 8 bus logs for this route instead of ALL logs globally
          const logsSnap = await getDocs(
            query(
              collection(db, 'bus_logs'),
              where('bus_route', '==', busRoute),
              orderBy('date', 'desc'),
              limit(8)
            )
          );
          const logs = logsSnap.docs
             .map(d => ({ date: d.id, ...d.data() }))
             .sort((a, b) => a.date.localeCompare(b.date)); // Re-sort ascending for chart

          const chartData = logs.map((log: any) => ({
             date: log.date.slice(5), // MM-DD
             Morning: log.morning_count || 0,
             Afternoon: log.afternoon_count || 0,
             Evening: log.evening_count || 0,
             Night: log.night_count || 0,
             Total: (log.morning_count || 0) + (log.afternoon_count || 0) + (log.evening_count || 0) + (log.night_count || 0)
          }));

          setStats({
             totalRiders: ridersSnap.size,
             totalProspects: prospectsSnap.size,
             salvations: salvationsCount,
             baptisms: baptismsCount,
             attendanceData: chartData
          });

       } catch (error) {
          console.error("Error fetching analytics", error);
       } finally {
          setLoading(false);
       }
    };
    
    fetchData();
  }, [session?.bus_route]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-xl font-bold px-4">Growth Analytics <span className="text-sm font-normal text-muted-foreground">(2026)</span></h2>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 px-4">
         <div className="bg-red-500/10 border border-red-200/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <Heart className="w-6 h-6 text-red-500 mb-2" />
            <span className="text-2xl font-bold text-red-700">{stats.salvations}</span>
            <span className="text-xs uppercase font-bold text-red-600/70">Salvations</span>
         </div>
         <div className="bg-blue-500/10 border border-blue-200/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <Droplets className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold text-blue-700">{stats.baptisms}</span>
            <span className="text-xs uppercase font-bold text-blue-600/70">Baptisms</span>
         </div>
         <div className="bg-emerald-500/10 border border-emerald-200/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <Users className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="text-2xl font-bold text-emerald-700">{stats.totalRiders}</span>
            <span className="text-xs uppercase font-bold text-emerald-600/70">Total Riders</span>
         </div>
         <div className="bg-purple-500/10 border border-purple-200/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
            <span className="text-2xl font-bold text-purple-700">{stats.totalProspects}</span>
            <span className="text-xs uppercase font-bold text-purple-600/70">Prospects</span>
         </div>
      </div>

      {/* Charts */}
      <div className="px-4">
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Attendance Trends (Last 8 Weeks)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="Morning" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Afternoon" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Evening" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Night" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
