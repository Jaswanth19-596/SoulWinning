import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Briefcase,
  TrendingUp,
  Check,
  Bus,
  Calendar,
  Download,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { prospectService } from '../../services/prospectService';
import { riderService } from '../../services/riderService';
import { workerService } from '../../services/workerService';
import { DashboardStats } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const { dayType } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadStats = async () => {
      if (!session) return;
      try {
        setLoading(true);
        const [prospects, riders, workers] = await Promise.all([
          prospectService.getProspects(session.bus_route, dayType),
          riderService.getRiders(session.bus_route, dayType),
          workerService.getWorkers(session.bus_route, dayType),
        ]);

        const visitedToday = riders.filter((r) =>
          (r.visit_history || []).some((v) => v.date === today)
        ).length;

        const workersPresent = workers.filter((w) =>
          (w.attendance_log || []).some((a) => a.date === today)
        ).length;

        setStats({
          total_prospects: prospects.length,
          total_riders: riders.length,
          total_workers: workers.length,
          visited_today: visitedToday,
          rode_today: visitedToday, // Same field, different label for Sunday
          workers_present: workersPresent,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [session, dayType, today]);

  const handleExportCSV = async () => {
    if (!session) return;
    try {
      const [prospects, riders, workers] = await Promise.all([
        prospectService.getProspects(session.bus_route, dayType),
        riderService.getRiders(session.bus_route, dayType),
        workerService.getWorkers(session.bus_route, dayType),
      ]);

      // Build CSV
      let csv = 'Type,Name,Phone,Address,Status,Notes\n';
      prospects.forEach((p) => {
        const addr = [p.address.street, p.address.city, p.address.state, p.address.zip].filter(Boolean).join(' ');
        csv += `Prospect,"${p.name}","${p.phone || ''}","${addr}","${p.interest_level}","${p.notes}"\n`;
      });
      riders.forEach((r) => {
        const addr = [r.address.street, r.address.city, r.address.state, r.address.zip].filter(Boolean).join(' ');
        csv += `Rider,"${r.name}","${r.phone || ''}","${addr}","${r.status}","${r.notes}"\n`;
      });
      workers.forEach((w) => {
        csv += `Worker,"${w.name}","${w.phone || ''}","","${w.assigned_section}",""\n`;
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dayType}_route_${session.bus_route}_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  const statCards = [
    {
      label: 'Total Prospects',
      value: stats?.total_prospects || 0,
      icon: UserPlus,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Active Riders',
      value: stats?.total_riders || 0,
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Workers',
      value: stats?.total_workers || 0,
      icon: Briefcase,
      color: 'from-purple-500 to-violet-500',
    },
    {
      label: dayType === 'saturday' ? 'Visited Today' : 'Rode Today',
      value: stats?.visited_today || 0,
      icon: Check,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Workers Present',
      value: stats?.workers_present || 0,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bus className="w-6 h-6" /> Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            {dayType === 'saturday' ? 'Saturday Soul Winning' : 'Sunday Bus Ministry'} · {session?.bus_route}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">
                  {loading ? '—' : stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Export */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Export Route Sheet</h3>
            <p className="text-sm text-muted-foreground">Download CSV with all prospects, riders, and workers</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
