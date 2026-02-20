import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bus,
  LogOut,
  Users,
  UserPlus,
  Briefcase,
  BarChart3,
  Shield,
  ClipboardList,
  CalendarCheck,
  Trophy,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';

const Header: React.FC = () => {
  const { session, isAuthenticated, isCaptain, logout } = useAuth();
  const { section, setSection } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const sections = [
    { key: 'prospects' as const, label: 'Prospects', icon: UserPlus },
    { key: 'riders' as const, label: 'Riders', icon: Users },
    { key: 'workers' as const, label: 'Workers', icon: Briefcase },
    { key: 'satvisit' as const, label: 'Sat Visit', icon: CalendarCheck },
    { key: 'buslog' as const, label: 'Sun Bus', icon: ClipboardList },
    { key: 'leaderboard' as const, label: 'Ranks', icon: Trophy },
    { key: 'prayer' as const, label: 'Prayer', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="font-bold text-lg cursor-pointer leading-tight"
              onClick={() => navigate('/')}
            >
              Soul Winning
            </h1>
            <p className="text-xs text-muted-foreground">
              {session?.label} {isCaptain && <Shield className="w-3 h-3 inline text-amber-500" />}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCaptain && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reports')}
              className="hidden sm:flex"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Reports
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </div>

      {/* Section Navigation — 5 tabs */}
      {location.pathname === '/' && (
        <div className="container mx-auto px-4 pb-2">
          <div className="flex gap-0.5 justify-center overflow-x-auto scrollbar-hide">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`relative px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  section === s.key
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section === s.key && (
                  <motion.div
                    layoutId="sectionTab"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;