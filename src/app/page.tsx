'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Timeline from '../../components/Timeline';

const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
  loading: () => <div className="w-full aspect-video bg-gray-800 animate-pulse" />
});

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  // Removed direct upload; videos now added through Studio using Mux plugin.

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="px-4 py-4 md:p-6 border-b border-gray-300 sticky top-0 z-10 bg-[var(--background)]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">Paulys Hotel and Recording Studio timeline</h1>
          <div className="flex items-center gap-2">
            <a
              href="/studio"
              className="text-xs md:text-sm bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-blue-700 transition"
              title="Edit Site"
            >
              Edit
            </a>
          </div>
        </div>
      </div>

      {/* Timeline at top */}
      <div className="flex-shrink-0">
        <Timeline onSelectEntry={setSelectedEntry} selectedEntry={selectedEntry} />
      </div>

      {/* Content at bottom */}
      <div className="border-t border-gray-300">
        <div className="px-4 py-4 md:p-6">
          {selectedEntry ? (
            <div>
              <div className="flex items-baseline gap-2 mb-3 md:mb-4 flex-wrap">
                <h2 className="text-lg md:text-xl font-bold m-0 p-0">{selectedEntry.title}</h2>
                {selectedEntry.date && (
                  <span className="text-xs md:text-sm text-gray-500 font-normal">
                    {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm md:text-base mb-3 md:mb-4">{selectedEntry.excerpt}</p>

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-[11px] md:text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.media && selectedEntry.media.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <h3 className="font-semibold mb-2">Media</h3>
                  <div className="flex flex-col gap-3 md:gap-4">
                    {selectedEntry.media.map((media: any, idx: number) => {
                      console.log('Media item:', JSON.stringify(media, null, 2)); // Debug log
                      const url = media.asset?.url;
                      const mimeType = media.asset?.metadata?.mimeType;
                      const isVideo = mimeType?.startsWith('video/') || 
                                     (typeof url === 'string' && url.match(/\.(mp4|mov|webm|m4v|avi)$/i));
                      const isImage = media._type === 'image' || mimeType?.startsWith('image/');
                      const thumbnailUrl = media.thumbnail?.asset?.url;
                      // For Mux videos, the playbackId is in the dereferenced asset
                      const muxPlaybackId = media.asset?.playbackId;
                      const isMux = media._type === 'mux.video' && muxPlaybackId;
                      
                      return (
                        <div key={idx} className="bg-gray-100 rounded overflow-hidden">
                          {isMux ? (
                            <MuxPlayer
                              playbackId={muxPlaybackId}
                              poster={thumbnailUrl}
                              streamType="on-demand"
                              autoPlay={false}
                              accentColor="#2563eb"
                              className="w-full h-auto bg-black"
                            />
                          ) : url && (isVideo ? (
                            <video
                              src={url}
                              controls
                              className="w-full h-auto object-contain bg-black"
                              playsInline
                              poster={thumbnailUrl || undefined}
                            />
                          ) : isImage ? (
                            <img src={url} alt="" className="w-full h-auto object-contain" />
                          ) : (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 text-blue-600 hover:underline">
                              📄 {media.asset?.originalFilename || 'Download File'}
                            </a>
                          ))}
                          {media._type === 'mux.video' && !isMux && (
                            <div className="p-4 text-red-600 text-sm">
                              Mux video error: Missing playbackId. Data: {JSON.stringify(media)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedEntry.relatedDocs && selectedEntry.relatedDocs.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <h3 className="font-semibold mb-2">Related Documents</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedEntry.relatedDocs.map((doc: any) => (
                      <li key={doc._id} className="text-blue-600 text-sm md:text-base">
                        {doc.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-6 md:mt-10">
              <p className="text-base md:text-lg">Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
