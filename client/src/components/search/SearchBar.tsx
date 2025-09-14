import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string; // Add this to allow controlled behavior
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [shouldRetainFocus, setShouldRetainFocus] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const lastSearchTime = useRef<number>(0);

  // Cleanup timeout and mark as unmounted
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Memoize the onSearch callback to prevent unnecessary re-renders
  const memoizedOnSearch = useCallback(onSearch, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Mark that we should retain focus after search operations
    setShouldRetainFocus(true);
    lastSearchTime.current = Date.now();

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search - only search after user stops typing for 500ms
    debounceRef.current = setTimeout(() => {
      // Check if component is still mounted before executing callback
      if (mountedRef.current) {
        memoizedOnSearch(newQuery);
        // Restore focus after search completes
        setTimeout(() => {
          if (shouldRetainFocus && inputRef.current && mountedRef.current) {
            inputRef.current.focus();
          }
        }, 100); // Small delay to ensure DOM updates complete
      }
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Execute immediate search on form submit
    if (mountedRef.current) {
      memoizedOnSearch(query);
    }
  };

  const handleClear = useCallback(() => {
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setQuery('');
    if (mountedRef.current) {
      memoizedOnSearch('');
    }

    // Keep focus after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [memoizedOnSearch]);

  // Handle external value changes (if you want controlled behavior)
  useEffect(() => {
    if (initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Focus retention system - monitor for focus loss and restore if needed
  useEffect(() => {
    const checkFocus = () => {
      if (shouldRetainFocus && inputRef.current && document.activeElement !== inputRef.current) {
        // Only restore focus if it was lost recently (within 2 seconds of last search)
        const timeSinceLastSearch = Date.now() - lastSearchTime.current;
        if (timeSinceLastSearch < 2000) {
          inputRef.current.focus();
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        } else {
          // Stop trying to retain focus after 2 seconds
          setShouldRetainFocus(false);
        }
      }
    };

    // Check focus periodically when we should retain it
    let interval: NodeJS.Timeout | null = null;
    if (shouldRetainFocus) {
      interval = setInterval(checkFocus, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [shouldRetainFocus]);

  // Reset focus retention when user manually focuses/blurs
  const handleFocus = () => {
    setShouldRetainFocus(false); // User manually focused, stop auto-focus
  };

  const handleBlur = () => {
    // Only set retention if this blur happened recently after a search
    const timeSinceLastSearch = Date.now() - lastSearchTime.current;
    if (timeSinceLastSearch < 1000) {
      setShouldRetainFocus(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              aria-label="Clear search"
              tabIndex={-1} // Prevent tab focus
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
