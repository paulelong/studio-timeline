import React from 'react';

interface TimelineCardProps {
  entry: any;
  onClick?: () => void;
}

export default function TimelineCard({ entry, onClick }: TimelineCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const thumbnails = entry.media?.slice(0, 3) || [];

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4 cursor-pointer hover:shadow-lg transition-shadow active:opacity-90"
      style={{ background: 'var(--card-background)' }}
    >
      <div className="text-xs md:text-sm mb-1 md:mb-2" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
        {entry.date && formatDate(entry.date)}
      </div>
      <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2" style={{ color: 'var(--foreground)' }}>{entry.title}</h3>
      <p className="text-sm md:text-base mb-2 md:mb-3" style={{ color: 'var(--foreground)', opacity: 0.85 }}>{entry.excerpt}</p>
      
      {thumbnails.length > 0 && (
        <div className="flex gap-2">
          {thumbnails.map((media: any, idx: number) => (
            <div key={idx} className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded overflow-hidden">
              {media.asset?.url && (
                <img
                  src={media.asset.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
