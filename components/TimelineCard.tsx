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
      className="border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      style={{ background: 'var(--card-background)' }}
    >
      <div className="text-sm mb-2" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
        {entry.date && formatDate(entry.date)}
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{entry.title}</h3>
      <p className="text-sm mb-3" style={{ color: 'var(--foreground)', opacity: 0.85 }}>{entry.excerpt}</p>
      
      {thumbnails.length > 0 && (
        <div className="flex gap-2">
          {thumbnails.map((media: any, idx: number) => (
            <div key={idx} className="w-20 h-20 bg-gray-200 rounded overflow-hidden">
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
