import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface FilterTagsProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

const FilterTags: React.FC<FilterTagsProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  className = '',
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  // Show only first 6 tags by default, with "Show more" option
  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 6);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Tags
          </h4>
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {visibleTags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  <span className="flex items-center gap-1">
                    {tag}
                    {isSelected && <Check className="w-3 h-3" />}
                  </span>
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {availableTags.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
          >
            {showAllTags ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                +{availableTags.length - 6} More
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterTags;