"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Editor {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  industry_niches: string[];
  experience_level: string | null;
  per_video_rate: number;
  location: string | null;
  availability_status: string;
  avatar_url?: string;
  created_at: string;
}

interface BrowseEditorsClientProps {
  initialEditors: Editor[];
  availableSpecialties: string[];
  availableIndustryNiches: string[];
}

export function BrowseEditorsClient({ initialEditors, availableSpecialties, availableIndustryNiches }: BrowseEditorsClientProps) {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedIndustryNiches, setSelectedIndustryNiches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Filter editors based on filters
  const filteredEditors = useMemo(() => {
    let filtered = initialEditors.filter(editor => {
      // Specialty filter
      const matchesSpecialties = selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => editor.specialties.includes(s));

      // Industry niche filter
      const matchesIndustryNiches = selectedIndustryNiches.length === 0 ||
        selectedIndustryNiches.some(n => editor.industry_niches.includes(n));

      return matchesSpecialties && matchesIndustryNiches;
    });

    // Sort filtered results
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rate_low":
        filtered.sort((a, b) => a.per_video_rate - b.per_video_rate);
        break;
      case "rate_high":
        filtered.sort((a, b) => b.per_video_rate - a.per_video_rate);
        break;
      case "experience":
        filtered.sort((a, b) => {
          // For now, just sort by creation date as experience level isn't standardized
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [initialEditors, selectedSpecialties, selectedIndustryNiches, sortBy]);

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleIndustryNicheToggle = (niche: string) => {
    setSelectedIndustryNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };



  return (
    <div className="space-y-6">
      {/* Whop-style Compact Filters */}
      <div className="bg-white dark:bg-card rounded-lg shadow-sm border dark:border-border p-4">
        {/* Industry Niches - Top Row */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {availableIndustryNiches.map(niche => (
            <button
              key={niche}
              onClick={() => handleIndustryNicheToggle(niche)}
              className={`px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap rounded-full ${
                selectedIndustryNiches.includes(niche)
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
        
        {/* Horizontal divider line */}
        <hr className="border-gray-200 dark:border-gray-700 mb-4" />
        
        {/* Skills/Specialties - Bottom Row */}
        <div className="flex gap-1 overflow-x-auto">
          {availableSpecialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => handleSpecialtyToggle(specialty)}
              className={`px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap rounded-full ${
                selectedSpecialties.includes(specialty)
                  ? "bg-black text-white dark:bg-black dark:text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Editors Grid - Whop Style */}
      {filteredEditors.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">No editors found</h3>
          <p className="text-gray-600 dark:text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filteredEditors.map((editor) => (
            <Link key={editor.id} href={`/editor/${editor.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-32 cursor-pointer">
                <CardContent className="p-4 h-full">
                  <div className="flex items-start gap-3 h-full">
                    {/* Icon/Avatar */}
                    <div className="relative flex-shrink-0">
                      {editor.avatar_url ? (
                        <img
                          src={editor.avatar_url}
                          alt={editor.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {editor.name.charAt(0)}
                        </div>
                      )}
                      {/* Availability dot */}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        editor.availability_status === 'available' ? 'bg-green-400' : 
                        editor.availability_status === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {editor.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                          {editor.bio}
                        </p>
                      </div>
                      
                      <div className="mt-2">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {editor.specialties.slice(0, 2).map(specialty => (
                            <span key={specialty} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium">
                              {specialty}
                            </span>
                          ))}
                          {editor.industry_niches.slice(0, 1).map(niche => (
                            <span key={niche} className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md font-medium">
                              {niche}
                            </span>
                          ))}
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              ${editor.per_video_rate}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              /video
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {editor.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}