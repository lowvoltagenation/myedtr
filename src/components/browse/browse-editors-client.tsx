"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Clock, DollarSign, Star, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Editor {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  experience_level: string | null;
  hourly_rate: number;
  location: string | null;
  availability_status: string;
  avatar_url?: string;
  created_at: string;
}

interface BrowseEditorsClientProps {
  initialEditors: Editor[];
  availableSpecialties: string[];
}

export function BrowseEditorsClient({ initialEditors, availableSpecialties }: BrowseEditorsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [rateRange, setRateRange] = useState<[number, number]>([10, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const [availability, setAvailability] = useState<string>("all");

  // Filter editors based on search and filters
  const filteredEditors = useMemo(() => {
    return initialEditors.filter(editor => {
      // Search filter
      const matchesSearch = !searchTerm || 
        editor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        editor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        editor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      // Specialty filter
      const matchesSpecialties = selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => editor.specialties.includes(s));

      // Rate filter
      const matchesRate = editor.hourly_rate >= rateRange[0] && editor.hourly_rate <= rateRange[1];

      // Availability filter
      const matchesAvailability = availability === "all" || editor.availability_status === availability;

      return matchesSearch && matchesSpecialties && matchesRate && matchesAvailability;
    });
  }, [initialEditors, searchTerm, selectedSpecialties, rateRange, availability]);

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search editors by name, skills, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t space-y-6">
            {/* Specialties */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      selectedSpecialties.includes(specialty)
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-purple-200"
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Hourly Rate</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$</span>
                  <Input
                    type="number"
                    value={rateRange[0]}
                    onChange={(e) => setRateRange([parseInt(e.target.value) || 10, rateRange[1]])}
                    className="w-20"
                    min="10"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$</span>
                  <Input
                    type="number"
                    value={rateRange[1]}
                    onChange={(e) => setRateRange([rateRange[0], parseInt(e.target.value) || 200])}
                    className="w-20"
                    min="10"
                  />
                </div>
                <span className="text-sm text-gray-600">per hour</span>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "available", label: "Available" },
                  { value: "busy", label: "Busy" },
                  { value: "unavailable", label: "Unavailable" }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setAvailability(option.value)}
                    className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                      availability === option.value
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-purple-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {filteredEditors.length} editor{filteredEditors.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Editors Grid */}
      {filteredEditors.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No editors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEditors.map(editor => (
            <Card key={editor.id} className="card-hover group">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {editor.avatar_url ? (
                      <img
                        src={editor.avatar_url}
                        alt={editor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {editor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {editor.name}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(editor.availability_status)}`}>
                        {getAvailabilityText(editor.availability_status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {editor.bio}
                </p>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {editor.specialties.slice(0, 3).map(specialty => (
                      <Badge key={specialty} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                        {specialty}
                      </Badge>
                    ))}
                    {editor.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                        +{editor.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {editor.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {editor.location}
                    </div>
                  )}
                  {editor.experience_level && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {editor.experience_level}
                    </div>
                  )}
                  <div className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${editor.hourly_rate}/hour
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">5.0 (New)</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/editor/${editor.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm">
                      View Profile
                    </Button>
                  </Link>
                  <Button size="sm" className="px-3">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}