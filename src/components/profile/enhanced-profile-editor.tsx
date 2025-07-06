'use client';

import { useState, useRef } from 'react';
import { useEnhancedProfile } from '@/hooks/useThemeCustomization';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import { ProtectedButton } from '@/components/ui/protected-button';
import { 
  User, 
  Briefcase, 
  Award, 
  Video, 
  FileText, 
  MapPin, 
  DollarSign,
  Plus,
  X,
  Star,
  Upload,
  ExternalLink
} from 'lucide-react';

interface SkillInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder: string;
  maxSkills?: number;
}

function SkillInput({ skills, onSkillsChange, placeholder, maxSkills = 10 }: SkillInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addSkill = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim()) && skills.length < maxSkills) {
      onSkillsChange([...skills, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addSkill}
          disabled={!inputValue.trim() || skills.includes(inputValue.trim()) || skills.length >= maxSkills}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {skills.length}/{maxSkills} skills added
      </p>
    </div>
  );
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  tags: string[];
  featured: boolean;
}

interface CaseStudyEditorProps {
  caseStudies: CaseStudy[];
  onCaseStudiesChange: (studies: CaseStudy[]) => void;
  canEdit: boolean;
  currentTier: SubscriptionTier;
}

function CaseStudyEditor({ caseStudies, onCaseStudiesChange, canEdit, currentTier }: CaseStudyEditorProps) {
  const [editingStudy, setEditingStudy] = useState<CaseStudy | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const addNewStudy = () => {
    const newStudy: CaseStudy = {
      id: Date.now().toString(),
      title: '',
      description: '',
      tags: [],
      featured: false
    };
    setEditingStudy(newStudy);
    setIsAdding(true);
  };

  const saveStudy = (study: CaseStudy) => {
    if (isAdding) {
      onCaseStudiesChange([...caseStudies, study]);
    } else {
      onCaseStudiesChange(caseStudies.map(s => s.id === study.id ? study : s));
    }
    setEditingStudy(null);
    setIsAdding(false);
  };

  const deleteStudy = (id: string) => {
    onCaseStudiesChange(caseStudies.filter(s => s.id !== id));
  };

  if (!canEdit) {
    return (
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <FileText className="w-5 h-5" />
            Case Studies
          </CardTitle>
          <CardDescription>Showcase detailed project case studies</CardDescription>
        </CardHeader>
        <CardContent>
          <UpgradePrompt
            variant="card"
            feature="case_studies"
            currentTier={currentTier}
            requiredTier="featured"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Case Studies
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Featured Only
          </Badge>
        </CardTitle>
        <CardDescription>Showcase detailed project case studies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {caseStudies.map((study) => (
          <div key={study.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{study.title}</h4>
                {study.featured && (
                  <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingStudy(study)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteStudy(study.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{study.description}</p>
            <div className="flex flex-wrap gap-1">
              {study.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <Button onClick={addNewStudy} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Case Study
        </Button>

        {editingStudy && (
          <CaseStudyEditDialog
            study={editingStudy}
            onSave={saveStudy}
            onCancel={() => {
              setEditingStudy(null);
              setIsAdding(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface CaseStudyEditDialogProps {
  study: CaseStudy;
  onSave: (study: CaseStudy) => void;
  onCancel: () => void;
}

function CaseStudyEditDialog({ study, onSave, onCancel }: CaseStudyEditDialogProps) {
  const [editedStudy, setEditedStudy] = useState<CaseStudy>(study);

  const handleSave = () => {
    if (editedStudy.title.trim() && editedStudy.description.trim()) {
      onSave(editedStudy);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg">
          {study.title ? 'Edit Case Study' : 'Add New Case Study'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="study-title">Title</Label>
          <Input
            id="study-title"
            value={editedStudy.title}
            onChange={(e) => setEditedStudy({ ...editedStudy, title: e.target.value })}
            placeholder="Project title"
          />
        </div>

        <div>
          <Label htmlFor="study-description">Description</Label>
          <Textarea
            id="study-description"
            value={editedStudy.description}
            onChange={(e) => setEditedStudy({ ...editedStudy, description: e.target.value })}
            placeholder="Detailed project description, challenges, solutions, and results..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="study-url">Project URL (optional)</Label>
          <Input
            id="study-url"
            value={editedStudy.projectUrl || ''}
            onChange={(e) => setEditedStudy({ ...editedStudy, projectUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Tags</Label>
          <SkillInput
            skills={editedStudy.tags}
            onSkillsChange={(tags) => setEditedStudy({ ...editedStudy, tags })}
            placeholder="Add project tags..."
            maxSkills={5}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={editedStudy.featured}
            onChange={(e) => setEditedStudy({ ...editedStudy, featured: e.target.checked })}
          />
          <Label htmlFor="featured">Mark as featured</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!editedStudy.title.trim() || !editedStudy.description.trim()}>
            Save
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnhancedProfileEditor() {
  const { tier } = useSubscription();
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    canUseVideoIntro,
    canUseCaseStudies,
    canUseEnhancedBio
  } = useEnhancedProfile();

  const [formData, setFormData] = useState({
    bio_headline: profile?.bio_headline || '',
    bio_description: profile?.bio_description || '',
    bio_experience: profile?.bio_experience || '',
    bio_achievements: profile?.bio_achievements || '',
    skills_primary: profile?.skills_primary || [],
    skills_secondary: profile?.skills_secondary || [],
    expertise_level: profile?.expertise_level || 'intermediate',
    years_experience: profile?.years_experience || '',
    intro_video_url: profile?.intro_video_url || '',
    intro_video_title: profile?.intro_video_title || '',
    intro_video_description: profile?.intro_video_description || '',
    case_studies: profile?.case_studies || [],
    current_position: profile?.current_position || '',
    company: profile?.company || '',
    location: profile?.location || '',
    availability_status: profile?.availability_status || 'available',
    per_video_rate: profile?.per_video_rate || '',
    show_rates: profile?.show_rates || false
  });

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading profile editor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Enhanced Bio
            {canUseEnhancedBio && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Pro+
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Create a compelling professional bio with multiple sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canUseEnhancedBio ? (
            <>
              <div>
                <Label htmlFor="bio_headline">Professional Headline</Label>
                <Input
                  id="bio_headline"
                  value={formData.bio_headline}
                  onChange={(e) => handleInputChange('bio_headline', e.target.value)}
                  placeholder="Senior Video Editor & Motion Graphics Designer"
                />
              </div>

              <div>
                <Label htmlFor="bio_description">About Me</Label>
                <Textarea
                  id="bio_description"
                  value={formData.bio_description}
                  onChange={(e) => handleInputChange('bio_description', e.target.value)}
                  placeholder="Tell your story, showcase your passion, and highlight what makes you unique..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="bio_experience">Experience & Expertise</Label>
                <Textarea
                  id="bio_experience"
                  value={formData.bio_experience}
                  onChange={(e) => handleInputChange('bio_experience', e.target.value)}
                  placeholder="Detail your professional experience, key projects, and areas of expertise..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="bio_achievements">Achievements & Recognition</Label>
                <Textarea
                  id="bio_achievements"
                  value={formData.bio_achievements}
                  onChange={(e) => handleInputChange('bio_achievements', e.target.value)}
                  placeholder="Awards, certifications, notable accomplishments..."
                  rows={3}
                />
              </div>
            </>
          ) : (
            <UpgradePrompt
              variant="card"
              feature="enhanced_bio"
              currentTier={tier}
              requiredTier="pro"
            />
          )}
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_position">Current Position</Label>
              <Input
                id="current_position"
                value={formData.current_position}
                onChange={(e) => handleInputChange('current_position', e.target.value)}
                placeholder="Video Editor"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Creative Studios Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="New York, NY"
              />
            </div>
            <div>
              <Label htmlFor="years_experience">Years Experience</Label>
              <Input
                id="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="expertise_level">Expertise Level</Label>
              <select
                id="expertise_level"
                value={formData.expertise_level}
                onChange={(e) => handleInputChange('expertise_level', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                      <Label htmlFor="per_video_rate">Per Video Rate</Label>
        <Input
          id="per_video_rate"
          type="number"
          value={formData.per_video_rate}
          onChange={(e) => handleInputChange('per_video_rate', parseFloat(e.target.value))}
                placeholder="75"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="show_rates"
                checked={formData.show_rates}
                onChange={(e) => handleInputChange('show_rates', e.target.checked)}
              />
              <Label htmlFor="show_rates">Show rates on profile</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Skills</Label>
            <p className="text-sm text-gray-600 mb-2">Your main areas of expertise</p>
            <SkillInput
              skills={formData.skills_primary}
              onSkillsChange={(skills) => handleInputChange('skills_primary', skills)}
              placeholder="Add primary skill..."
              maxSkills={8}
            />
          </div>

          <div>
            <Label>Secondary Skills</Label>
            <p className="text-sm text-gray-600 mb-2">Additional skills and competencies</p>
            <SkillInput
              skills={formData.skills_secondary}
              onSkillsChange={(skills) => handleInputChange('skills_secondary', skills)}
              placeholder="Add secondary skill..."
              maxSkills={12}
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Introduction
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Featured Only
            </Badge>
          </CardTitle>
          <CardDescription>
            Add a personal video introduction to showcase your personality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canUseVideoIntro ? (
            <>
              <div>
                <Label htmlFor="intro_video_title">Video Title</Label>
                <Input
                  id="intro_video_title"
                  value={formData.intro_video_title}
                  onChange={(e) => handleInputChange('intro_video_title', e.target.value)}
                  placeholder="Hi, I'm [Your Name]"
                />
              </div>

              <div>
                <Label htmlFor="intro_video_url">Video URL</Label>
                <Input
                  id="intro_video_url"
                  value={formData.intro_video_url}
                  onChange={(e) => handleInputChange('intro_video_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label htmlFor="intro_video_description">Video Description</Label>
                <Textarea
                  id="intro_video_description"
                  value={formData.intro_video_description}
                  onChange={(e) => handleInputChange('intro_video_description', e.target.value)}
                  placeholder="Brief description of your video introduction..."
                  rows={2}
                />
              </div>
            </>
          ) : (
            <UpgradePrompt
              variant="card"
              feature="video_introduction"
              currentTier={tier}
              requiredTier="featured"
            />
          )}
        </CardContent>
      </Card>

      {/* Case Studies */}
      <CaseStudyEditor
        caseStudies={formData.case_studies}
        onCaseStudiesChange={(studies) => handleInputChange('case_studies', studies)}
        canEdit={canUseCaseStudies}
        currentTier={tier}
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="min-w-32"
        >
          {isSaving ? (
            <>
              <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
} 