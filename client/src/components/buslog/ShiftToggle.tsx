import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, MoonStar } from 'lucide-react';
import { RidePeriod } from '../../services/busLogService';

interface ShiftToggleProps {
  type: RidePeriod;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const shiftConfig: Record<RidePeriod, {
  Icon: React.ElementType;
  label: string;
  activeColor: string;
  shadowColor: string;
}> = {
  morning: {
    Icon: Sun,
    label: 'Morning (To Church)',
    activeColor: '#f59e0b',     // Amber-500
    shadowColor: 'rgba(245,158,11,0.5)',
  },
  afternoon: {
    Icon: Sunset,
    label: 'Afternoon (Back Home)',
    activeColor: '#f97316',     // Orange-500
    shadowColor: 'rgba(249,115,22,0.5)',
  },
  evening: {
    Icon: Moon,
    label: 'Evening (To Church)',
    activeColor: '#6366f1',     // Indigo-500
    shadowColor: 'rgba(99,102,241,0.5)',
  },
  night: {
    Icon: MoonStar,
    label: 'Night (Back Home)',
    activeColor: '#8b5cf6',     // Violet-500
    shadowColor: 'rgba(139,92,246,0.5)',
  },
};

const ShiftToggle: React.FC<ShiftToggleProps> = ({ type, active, onClick, disabled }) => {
  const config = shiftConfig[type];
  const { Icon, label, activeColor, shadowColor } = config;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label} shift`}
      aria-pressed={active}
      title={label}
      className={`
        relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${active ? 'text-white' : 'bg-muted/50 text-muted-foreground border border-transparent hover:border-border hover:bg-muted hover:text-foreground'}
      `}
      style={{
        backgroundColor: active ? activeColor : undefined,
        boxShadow: active ? `0 0 12px ${shadowColor}` : 'none'
      }}
    >
      {/* Pop Animation Wrapper */}
      <motion.div
        initial={false}
        animate={{ scale: active ? [1, 1.25, 1] : 1 }}
        transition={{ duration: 0.4, type: 'tween', ease: 'circOut' }}
      >
        <Icon 
          size={16} 
          className={active ? 'fill-current' : ''} 
          strokeWidth={active ? 2.5 : 2}
        />
      </motion.div>
    </motion.button>
  );
};

export default React.memo(ShiftToggle);
