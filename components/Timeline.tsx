'use client';

import React, { useEffect, useState, useRef } from 'react';
import { groqFetch } from '../lib/sanityClient';
import { TIMELINE_QUERY } from '../lib/queries';
import TimelineCard from './TimelineCard';

interface TimelineProps {
  onSelectEntry?: (entry: any) => void;
  selectedEntry?: any;
}

export default function Timeline({ onSelectEntry, selectedEntry }: TimelineProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pointRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStateRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0 });

  useEffect(() => {
    async function fetchTimeline() {
      try {
        setLoading(true);
        const data = await groqFetch(TIMELINE_QUERY);
        setEntries(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch timeline');
      } finally {
        setLoading(false);
      }
    }

    fetchTimeline();
  }, []);

  // Enable drag-to-scroll functionality
  useEffect(() => {
    // Use a small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      
      if (!container) {
        return;
      }

      const handleMouseDown = (e: MouseEvent) => {
        dragStateRef.current.isDown = true;
        dragStateRef.current.startX = e.clientX;
        dragStateRef.current.startScrollLeft = container.scrollLeft;
        setIsDragging(false);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragStateRef.current.isDown) return;
        
        const distance = dragStateRef.current.startX - e.clientX;
        
        if (Math.abs(distance) > 5) {
          setIsDragging(true);
        }
        
        container.scrollLeft = dragStateRef.current.startScrollLeft + distance;
      };

      const handleMouseUp = () => {
        dragStateRef.current.isDown = false;
      };

      const handleMouseLeave = () => {
        dragStateRef.current.isDown = false;
      };

      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [entries]);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [entries]);

  // Scroll selected card into view within container
  useEffect(() => {
    if (selectedEntry && cardRefs.current[selectedEntry._id]) {
      const card = cardRefs.current[selectedEntry._id];
      const container = scrollContainerRef.current;

      if (card && container) {
        const cardRect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Center the selected card within the horizontal scroller
        const cardOffsetWithinContainer = cardRect.left - containerRect.left + container.scrollLeft;
        const targetScrollLeft = cardOffsetWithinContainer - (container.clientWidth / 2) + (cardRect.width / 2);

        container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }
    }
  }, [selectedEntry]);

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Get date range for timeline
  const dates = sortedEntries.map(entry => new Date(entry.date).getTime());
  const minDate = dates.length ? Math.min(...dates) : Date.now();
  const maxDate = dates.length ? Math.max(...dates) : minDate;
  const dateRange = Math.max(maxDate - minDate, 1);
  const timelineWidth = Math.max(sortedEntries.length * 160, 800);

  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      track.style.width = `${timelineWidth}px`;
    }

    let maxLabelHeight = 0;

    sortedEntries.forEach((entry, index) => {
      const entryDate = new Date(entry.date).getTime();
      const position = ((entryDate - minDate) / dateRange) * 100;
      const point = pointRefs.current[entry._id];

      if (point) {
        point.style.left = `${position}%`;
        const label = point.querySelector('[data-label]') as HTMLElement | null;
        if (label) {
          maxLabelHeight = Math.max(maxLabelHeight, label.getBoundingClientRect().height);
        }
      }

      // Calculate left padding based on first item's text width
      if (index === 0 && track) {
        const label = point?.querySelector('[class*="flex"]');
        if (label) {
          const labelWidth = (label as HTMLElement).offsetWidth;
          track.style.paddingLeft = `${Math.max(labelWidth + 16, 40)}px`;
        }
      }
    });

    if (track) {
      const baseHeight = 36; // room for line and point
      const labelPadding = 8; // small breathing room under labels
      const computedHeight = Math.max(baseHeight + labelPadding + maxLabelHeight, 64);
      track.style.minHeight = `${computedHeight}px`;
    }
  }, [timelineWidth, sortedEntries, minDate, dateRange]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading timeline...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Horizontal scrolling cards at the top */}
      <div className="relative border-b border-gray-300">
        {/* Left arrow indicator */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center z-10 pl-2">
            <div className="text-gray-400 text-2xl animate-pulse">&lt;</div>
          </div>
        )}
        
        {/* Right arrow indicator */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center z-10 pr-2">
            <div className="text-gray-400 text-2xl animate-pulse">&gt;</div>
          </div>
        )}
        
        <div ref={scrollContainerRef} className="overflow-x-auto px-3 py-3 md:p-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none" onSelectCapture={(e) => { e.preventDefault(); }}>
          <div className="flex gap-3 min-w-max items-stretch">
            {sortedEntries.map((entry) => (
              <div
                key={entry._id}
                className={`w-64 h-64 flex-shrink-0${selectedEntry && selectedEntry._id === entry._id ? ' ring-2 ring-blue-500' : ''}`}
                ref={el => { cardRefs.current[entry._id] = el; }}
                draggable="false"
              >
                <TimelineCard
                  entry={entry}
                  onClick={() => !isDragging && onSelectEntry?.(entry)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline graphic below - scales to fit width */}
      <div className="px-3 py-2 md:py-3 md:px-6 overflow-x-auto overflow-y-visible">
        <div
          className="relative"
          ref={trackRef}
        >
          {/* Timeline line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300"></div>
          
          {/* Timeline points */}
          <div className="relative">
            {sortedEntries.map((entry, index) => {
              const stagger = index % 2 === 0 ? 'translate-y-6' : 'translate-y-12';
              
              return (
                <div
                  key={entry._id}
                  className="absolute -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"
                  ref={el => { pointRefs.current[entry._id] = el; }}
                  onClick={() => onSelectEntry?.(entry)}
                >
                  {/* Date point */}
                  <div className="relative">
                    <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>

                    {/* Date label */}
                    <div className="absolute top-8 -translate-x-full -translate-y-1/2 whitespace-nowrap">
                      <div className={`origin-bottom-right -rotate-45 flex flex-col gap-0.5 items-end`} data-label>
                        <div className="text-[10px] font-semibold text-gray-700">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-gray-500 max-w-[160px] truncate text-right">
                          {entry.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
