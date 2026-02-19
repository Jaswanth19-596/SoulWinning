import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface CustomCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(selectedDate);
    // Be careful with timezone, but for calendar nav usually fine to use local
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    // Construct date string manually to avoid timezone shifts
    // Format: YYYY-MM-DD
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;
    onSelect(dateStr);
    onClose();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const selectedD = new Date(selectedDate + 'T12:00:00'); // midday to avoid timezone
  const isSelectedMonth = selectedD.getFullYear() === year && selectedD.getMonth() === month;
  const selectedDay = selectedD.getDate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
          <h2 className="font-semibold text-lg">Select Date</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Nav */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="font-semibold">
              {monthNames[month]} {year}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
               <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-xs text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isTodayDay = isCurrentMonth && day === todayDate;
              const isSelected = isSelectedMonth && day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground font-bold shadow-md scale-105' 
                      : isTodayDay
                        ? 'bg-secondary text-secondary-foreground font-bold border border-primary/30'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 bg-muted/20 border-t border-border/50 text-center">
            <Button variant="ghost" size="sm" onClick={() => {
                onSelect(new Date().toISOString().split('T')[0]);
                onClose();
            }} className="text-xs text-primary">
                Jump to Today
            </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomCalendar;
