"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, ExternalLink } from "lucide-react";
import Link from "next/link";

interface PortfolioVideosProps {
  portfolioUrls: string[];
  editorName: string;
}

// Utility function to extract video info from URLs
function getVideoInfo(url: string): { type: 'youtube' | 'vimeo' | 'other', id: string | null, thumbnailUrl: string | null } {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : null;
    return {
      type: 'youtube',
      id,
      thumbnailUrl: id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
    };
  } else if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match ? match[1] : null;
    return {
      type: 'vimeo',
      id,
      thumbnailUrl: null // Vimeo thumbnails require API call
    };
  }
  return { type: 'other', id: null, thumbnailUrl: null };
}

export function PortfolioVideos({ portfolioUrls, editorName }: PortfolioVideosProps) {
  const validUrls = portfolioUrls.filter((url: string) => url.trim());

  if (!validUrls.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Portfolio Videos</CardTitle>
        <CardDescription className="dark:text-gray-400">Recent work and projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validUrls.map((url: string, index: number) => {
            const videoInfo = getVideoInfo(url);
            
            return (
              <div key={index} className="group relative">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {videoInfo.thumbnailUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={videoInfo.thumbnailUrl}
                        alt={`${editorName} portfolio video ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if thumbnail fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Play className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                    </div>
                  ) : videoInfo.type === 'vimeo' ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Vimeo Video</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <ExternalLink className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">External Link</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Video link */}
                <Link 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 cursor-pointer"
                >
                  <span className="sr-only">Watch video {index + 1}</span>
                </Link>
              </div>
            );
          })}
        </div>
        {validUrls.length === 0 && (
          <div className="text-center py-8">
            <Play className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No portfolio videos added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 