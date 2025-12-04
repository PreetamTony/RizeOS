import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Users, 
  Lightbulb,
  Upload,
  Loader2,
  CheckCircle2,
  X,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAI } from '@/hooks/useAI';
import type { MatchResult, SkillExtractionResult } from '@/types';

const AiSuite: React.FC = () => {
  const { 
    extractSkills, 
    isExtracting, 
    extractionError,
    getMatchScore,
    isMatching,
    matchError,
    getRecommendations,
    isLoadingRecommendations,
    recommendationError
  } = useAI();

  // Skill extraction state
  const [extractedSkills, setExtractedSkills] = useState<SkillExtractionResult | null>(null);
  const [resumeText, setResumeText] = useState('');

  // Match scoring state
  const [jobDescription, setJobDescription] = useState('');
  const [profileSummary, setProfileSummary] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<string[] | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await extractSkills(file);
    if (result) {
      setExtractedSkills(result);
    }
  };

  const handleTextExtraction = async () => {
    if (!resumeText.trim()) return;
    
    const result = await extractSkills(undefined, resumeText);
    if (result) {
      setExtractedSkills(result);
    }
  };

  const handleMatchScore = async () => {
    // In a real app, this would use a job ID
    // For demo, we'll use a placeholder approach
    const result = await getMatchScore('demo-job-id', profileSummary || undefined);
    if (result) {
      setMatchResult(result);
    }
  };

  const handleGetRecommendations = async () => {
    const result = await getRecommendations('jobs');
    if (result) {
      setRecommendations(result);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2">
            AI <span className="gradient-text">Suite</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Leverage the power of AI to extract skills from your resume, match with jobs, 
            and get personalized recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Skill Extraction */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Resume Skill Extraction</CardTitle>
              <CardDescription>
                Upload your resume or paste text to automatically extract your skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block mb-2 text-sm font-medium">Upload Resume</label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isExtracting}
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    {isExtracting ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isExtracting ? 'Analyzing...' : 'Click to upload PDF or DOCX'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <textarea
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
                <Button 
                  onClick={handleTextExtraction}
                  disabled={!resumeText.trim() || isExtracting}
                  className="w-full mt-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract Skills
                    </>
                  )}
                </Button>
              </div>

              {/* Results */}
              {extractionError && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {extractionError}
                </div>
              )}

              {extractedSkills && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">
                      Found {extractedSkills.skills.length} skills
                    </span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {Math.round(extractedSkills.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.skills.map((skill) => (
                      <Badge key={skill} variant="skill">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    Add to Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Matching */}
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Job ↔ Applicant Matching</CardTitle>
              <CardDescription>
                Get an AI-powered match score between a job and your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Job Description</label>
                <textarea
                  placeholder="Paste a job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full min-h-[80px] rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Your Profile Summary (optional)</label>
                <Input
                  placeholder="Brief description of your experience..."
                  value={profileSummary}
                  onChange={(e) => setProfileSummary(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleMatchScore}
                disabled={!jobDescription.trim() || isMatching}
                className="w-full"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Calculate Match Score
                  </>
                )}
              </Button>

              {matchError && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {matchError}
                </div>
              )}

              {matchResult && (
                <div className="p-4 rounded-xl bg-card border border-border animate-fade-in">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${matchResult.score * 2.26} 226`}
                          className="text-primary"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                        {matchResult.score}%
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Match Score</h4>
                      <p className="text-sm text-muted-foreground">
                        {matchResult.score >= 80 
                          ? 'Excellent match!' 
                          : matchResult.score >= 60 
                          ? 'Good potential' 
                          : 'Consider upskilling'}
                      </p>
                    </div>
                  </div>

                  {matchResult.matchedSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1 text-success">Matched Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.matchedSkills.map((skill) => (
                          <Badge key={skill} variant="success" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchResult.missingSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1 text-warning">Skills to Develop</p>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missingSkills.map((skill) => (
                          <Badge key={skill} variant="warning" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Smart Suggestions</CardTitle>
              <CardDescription>
                Get personalized job recommendations based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetRecommendations}
                disabled={isLoadingRecommendations}
                className="w-full"
                variant="hero"
              >
                {isLoadingRecommendations ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Finding matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>

              {recommendationError && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {recommendationError}
                </div>
              )}

              {recommendations && (
                <div className="space-y-3 animate-fade-in">
                  {recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              )}

              {!recommendations && !recommendationError && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Click the button above to get AI-powered job recommendations 
                    based on your skills and experience.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiSuite;
