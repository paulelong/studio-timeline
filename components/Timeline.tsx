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
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Scroll selected card into view within container
  useEffect(() => {
    if (selectedEntry && cardRefs.current[selectedEntry._id]) {
      const card = cardRefs.current[selectedEntry._id];
      if (card) {
        // Use scrollIntoView with inline: 'nearest' to prevent page-level scrolling
        card.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    }
  }, [selectedEntry]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading timeline...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Get date range for timeline
  const dates = sortedEntries.map(entry => new Date(entry.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateRange = maxDate - minDate || 1;

  return (
    <div className="flex flex-col h-full">
      {/* Horizontal scrolling cards at the top */}
      <div className="overflow-x-auto px-3 py-3 md:p-4 border-b border-gray-300">
        <div className="flex gap-3 min-w-max items-stretch">
          {sortedEntries.map((entry) => (
            <div
              key={entry._id}
              className={`w-64 h-64 flex-shrink-0${selectedEntry && selectedEntry._id === entry._id ? ' ring-2 ring-blue-500' : ''}`}
              ref={el => { cardRefs.current[entry._id] = el; }}
            >
              <TimelineCard
                entry={entry}
                onClick={() => onSelectEntry?.(entry)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline graphic below - scales to fit width */}
      <div className="px-3 py-4 md:p-6">
        <div className="relative w-full min-h-[100px]">
          {/* Timeline line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300"></div>
          
          {/* Timeline points */}
          <div className="relative">
            {sortedEntries.map((entry, index) => {
              const entryDate = new Date(entry.date).getTime();
              const position = ((entryDate - minDate) / dateRange) * 100;
              
              return (
                <div
                  key={entry._id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  onClick={() => onSelectEntry?.(entry)}
                >
                  {/* Date point */}
                  <div className="relative">
                    <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
                    
                    {/* Date label */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="text-xs font-semibold text-gray-700">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1 max-w-[100px] truncate">
                        {entry.title}
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
