import React, { useState, useEffect } from 'react';

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
    <div className={`filter-tags ${className}`}>
      <div className="filter-tags-header">
        <h4 className="filter-tags-title">Filter by Tags</h4>
        {selectedTags.length > 0 && (
          <button
            className="clear-tags-btn"
            onClick={handleClearAll}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="tags-container">
        {visibleTags.map(tag => (
          <button
            key={tag}
            className={`filter-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
            onClick={() => handleTagClick(tag)}
            type="button"
          >
            {tag}
            {selectedTags.includes(tag) && <span className="tag-check">✓</span>}
          </button>
        ))}

        {availableTags.length > 6 && (
          <button
            className="show-more-tags-btn"
            onClick={() => setShowAllTags(!showAllTags)}
            type="button"
          >
            {showAllTags ? 'Show Less' : `Show ${availableTags.length - 6} More`}
          </button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="selected-tags-info">
          <span className="selected-count">
            {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterTags;