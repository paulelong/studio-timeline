'use client';

import React, { useState } from 'react';
import Timeline from '../../components/Timeline';

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  return (
    <div className="flex h-screen" style={{ background: 'var(--background)' }}>
      {/* Left Column: Timeline (25%) */}
      <div className="w-1/4 border-r border-gray-300">
        <div className="p-6 border-b border-gray-300" style={{ background: 'var(--background)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Paulys Hotel and Recording Studio timeline</h1>
            <a
              href="/studio"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              title="Edit Site"
            >
              Edit
            </a>
          </div>
        </div>
        <Timeline onSelectEntry={setSelectedEntry} />
      </div>

      {/* Right Column: Detail Viewer (75%) */}
      <div className="w-3/4 overflow-y-auto">
        <div className="p-6">
          {selectedEntry ? (
            <div>
              <h2 className="text-xl font-bold mb-4">{selectedEntry.title}</h2>
              <div className="text-sm text-gray-500 mb-4">
                {selectedEntry.date &&
                  new Date(selectedEntry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </div>
              <p className="text-gray-700 mb-4">{selectedEntry.excerpt}</p>

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.media && selectedEntry.media.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Media</h3>
                  <div className="flex flex-col gap-4">
                    {selectedEntry.media.map((media: any, idx: number) => (
                      <div key={idx} className="bg-gray-100 rounded overflow-hidden">
                        {media.asset?.url && (
                          <img
                            src={media.asset.url}
                            alt=""
                            className="w-full h-auto object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.relatedDocs && selectedEntry.relatedDocs.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Related Documents</h3>
                  <ul className="list-disc list-inside">
                    {selectedEntry.relatedDocs.map((doc: any) => (
                      <li key={doc._id} className="text-blue-600">
                        {doc.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-lg">Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
