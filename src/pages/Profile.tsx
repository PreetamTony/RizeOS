import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useAI } from '@/hooks/useAI';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import {
  Edit2,
  FileText,
  Linkedin,
  Loader2,
  Mail,
  Save,
  Sparkles,
  Upload,
  User,
  Wallet,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { connected, address } = useWallet();
  const { extractSkills, isExtracting } = useAI();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setDisplayName(user.displayName || '');
      setTitle(user.title || '');
      setBio(user.bio || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setSkills(user.skills || []);
    }
  }, [user]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file); // Store file for upload on save

    // Optional: Still extract skills for immediate feedback
    const result = await extractSkills(file);
    if (result) {
      const extractedSkills = result.skills || [];
      // Ensure we have strings
      const skillStrings = extractedSkills.map((s: any) => typeof s === 'string' ? s : s.name);

      const newSkills = [...new Set([...skills, ...skillStrings])];
      setSkills(newSkills);
      toast({
        title: "Skills extracted!",
        description: `Found ${skillStrings.length} skills from your resume.`,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.updateUserProfile({
        fullName,
        displayName,
        title,
        bio,
        linkedinUrl,
        skills,
        walletAddress: address || undefined,
        resume: resumeFile || undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await refreshUser();
      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName || '');
    setDisplayName(user?.displayName || '');
    setBio(user?.bio || '');
    setLinkedinUrl(user?.linkedinUrl || '');
    setSkills(user?.skills || []);
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your professional profile and settings
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-foreground">
                    {displayName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-4 w-full">
                {/* Name */}
                <div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="johndoe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Professional Title</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold font-display">
                        {fullName || displayName || 'Unnamed User'}
                      </h2>
                      {title && (
                        <p className="text-lg text-primary font-medium">{title}</p>
                      )}
                      {fullName && displayName && fullName !== displayName && (
                        <p className="text-muted-foreground">@{displayName}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email || 'No email'}</span>
                </div>

                {/* LinkedIn */}
                {isEditing ? (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">LinkedIn URL</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                ) : linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn Profile</span>
                  </a>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself, your experience, and what you're looking for..."
                className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-line">
                {bio || 'No bio added yet.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Skills
              </CardTitle>
              {isEditing && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={isExtracting}
                  />
                  <Button variant="outline" size="sm" disabled={isExtracting} asChild>
                    <span>
                      {isExtracting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Extract from Resume
                    </span>
                  </Button>
                </label>
              )}
            </div>
            <CardDescription>
              Your professional skills and expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
            )}

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="skill"
                    className={`text-sm py-1.5 px-3 ${isEditing ? 'pr-1.5' : ''}`}
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1.5 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Resume */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
            <CardDescription>
              Your uploaded resume for job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.resumeUrl ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${user.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      View Uploaded Resume
                    </a>
                    <p className="text-sm text-muted-foreground">
                      {resumeFile ? `New file selected: ${resumeFile.name}` : 'Uploaded previously'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${user.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">
                  {resumeFile ? `Selected: ${resumeFile.name}` : 'No resume uploaded'}
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <div className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}>
                    <Upload className="w-4 h-4 mr-2" />
                    {resumeFile ? 'Change Resume' : 'Upload Resume'}
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connected Wallet
            </CardTitle>
            <CardDescription>
              Your linked cryptocurrency wallet for payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connected && address ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-mono text-sm">{address}</p>
                    <p className="text-sm text-success">Connected</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">No wallet connected</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a href="/connect-wallet">Connect</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
