import React from 'react';
import { motion } from 'framer-motion';
import { Heart, LogOut, Plus, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ThemeToggle } from '../ui/theme-toggle';
import { getInitials } from '../../lib/utils';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 glass backdrop-blur-2xl"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:rotate-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors duration-300">
              Soul Winning
            </h1>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              className="text-foreground hover:text-primary font-medium"
            >
              Contacts
            </Button>
            <Button
              variant={location.pathname === '/prayer-wall' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/prayer-wall')}
              className="text-foreground hover:text-primary font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Prayer Wall
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/contacts/new')}
              className="text-foreground hover:text-primary font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-white shadow-lg">
                {getInitials(user?.username || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                Soul Winner
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;