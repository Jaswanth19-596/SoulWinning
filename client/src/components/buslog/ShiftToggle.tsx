import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ShiftToggleProps {
  type: 'morning' | 'evening';
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ShiftToggle: React.FC<ShiftToggleProps> = ({ type, active, onClick, disabled }) => {
  const isMorning = type === 'morning';
  const Icon = isMorning ? Sun : Moon;
  
  // Standard Tailwind Colors
  // Morning: Amber-500 (#f59e0b), Evening: Indigo-500 (#6366f1)
  const activeColor = isMorning ? '#f59e0b' : '#6366f1';
  const shadowColor = isMorning ? 'rgba(245,158,11,0.5)' : 'rgba(99,102,241,0.5)';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${isMorning ? 'Morning' : 'Evening'} shift`}
      aria-pressed={active}
      className={`
        relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200
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
          size={20} 
          className={active ? 'fill-current' : ''} 
          strokeWidth={active ? 2.5 : 2}
        />
      </motion.div>
    </motion.button>
  );
};

export default ShiftToggle;
