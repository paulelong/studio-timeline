'use client';

import React, { useState } from 'react';
import Timeline from '../../components/Timeline';

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersistVideo = async (file: File) => {
    if (!selectedEntry?._id) {
      setError('Select an entry before uploading.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entryId', selectedEntry._id);

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      const data = await res.json();

      const newMediaItem = {
        asset: { url: data.assetUrl, _id: data.assetId },
        _type: 'file',
      };
      setSelectedEntry((prev: any) =>
        prev
          ? { ...prev, media: Array.isArray(prev.media) ? [...prev.media, newMediaItem] : [newMediaItem] }
          : prev
      );
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handlePersistVideo(file);
    } else {
      setError('Please select a video file.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="px-4 py-4 md:p-6 border-b border-gray-300 sticky top-0 z-10" style={{ background: 'var(--background)' }}>
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
            <label className="text-xs md:text-sm bg-gray-200 text-gray-800 px-2 py-1 md:px-3 md:py-1 rounded cursor-pointer hover:bg-gray-300 transition">
              Upload Video
              <input type="file" accept="video/*" className="hidden" onChange={onFileChange} />
            </label>
          </div>
        </div>
        {uploading && <p className="text-xs text-gray-500 mt-2">Uploading video…</p>}
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      {/* Timeline at top */}
      <div className="flex-shrink-0">
        <Timeline onSelectEntry={setSelectedEntry} selectedEntry={selectedEntry} />
      </div>

      {/* Content at bottom */}
      <div className="flex-1 overflow-y-auto border-t border-gray-300">
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
                      const url = media.asset?.url;
                      const isVideo = typeof url === 'string' && url.match(/\.(mp4|mov|webm|m4v|avi)$/i);
                      return (
                        <div key={idx} className="bg-gray-100 rounded overflow-hidden">
                          {url && (isVideo ? (
                            <video src={url} controls className="w-full h-auto object-contain bg-black" />
                          ) : (
                            <img src={url} alt="" className="w-full h-auto object-contain" />
                          ))}
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
            <div className="text-center text-gray-400 mt-10 md:mt-20">
              <p className="text-base md:text-lg">Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
