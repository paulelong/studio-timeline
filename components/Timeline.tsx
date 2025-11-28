'use client';

import React, { useEffect, useState } from 'react';
import { groqFetch } from '@/lib/sanityClient';
import { TIMELINE_QUERY } from '@/lib/queries';
import TimelineCard from './TimelineCard';

interface TimelineProps {
  onSelectEntry?: (entry: any) => void;
}

export default function Timeline({ onSelectEntry }: TimelineProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="p-4 text-gray-500">Loading timeline...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="overflow-y-auto h-full p-4">
      {entries.map((entry) => (
        <TimelineCard
          key={entry._id}
          entry={entry}
          onClick={() => onSelectEntry?.(entry)}
        />
      ))}
    </div>
  );
}
