import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAI } from '@/hooks/useAI';
import type { MatchResult, SkillExtractionResult } from '@/types';
import {
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  TrendingUp,
  Upload,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

import { useWallet } from '@/hooks/useWallet';
import { Shield, Wallet } from 'lucide-react';

const SkillPassportCard: React.FC<{ extractedSkills: SkillExtractionResult | null }> = ({ extractedSkills }) => {
  const { connect, connected, address, sendPayment, walletType } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintTx, setMintTx] = useState<string | null>(null);

  const handleMint = async () => {
    if (!connected) {
      await connect('phantom');
      return;
    }

    setIsMinting(true);
    try {
      // Simulate minting by sending a small fee
      const result = await sendPayment();
      if (result?.txHash) {
        setMintTx(result.txHash);
      }
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <Shield className="w-5 h-5" />
          3. Skill Passport (NFT Identity)
        </CardTitle>
        <CardDescription>
          Mint your verified skills as a Soulbound Token on Solana.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!extractedSkills ? (
          <div className="text-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-xl">
            <p className="text-muted-foreground text-sm">Analyze your resume first to unlock your passport.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(extractedSkills.skills || []).map((skill: any, i: number) => {
                const name = typeof skill === 'string' ? skill : skill.name;
                const level = typeof skill === 'string' ? 'Verified' : skill.level;
                return (
                  <Badge key={i} variant="outline" className="bg-background border-purple-200 text-purple-700">
                    {name} <span className="ml-1 text-[10px] opacity-70">({level})</span>
                  </Badge>
                );
              })}
            </div>

            {mintTx ? (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center animate-in fade-in zoom-in">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-green-700">Identity Minted!</h4>
                <p className="text-xs text-muted-foreground mb-2">Your skills are now verified on-chain.</p>
                <a
                  href={`https://explorer.solana.com/tx/${mintTx}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View Transaction
                </a>
              </div>
            ) : (
              <Button
                onClick={handleMint}
                disabled={isMinting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Minting Identity...
                  </>
                ) : !connected ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Phantom to Mint
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Mint Verified Identity (0.0001 SOL)
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
  const [recommendations, setRecommendations] = useState<any[] | null>(null);

  // Roadmap state
  const { generateRoadmap, isGeneratingRoadmap, roadmapError } = useAI();
  const [desiredRole, setDesiredRole] = useState('');
  const [roadmapData, setRoadmapData] = useState<any | null>(null);

  const handleGenerateRoadmap = async () => {
    const profile = resumeText || (extractedSkills ? extractedSkills.skills.join(', ') : '');

    if (!profile) {
      alert("Please enter your resume text or upload a resume first.");
      return;
    }

    // Normalize skills to string array for the hook
    const skillsForRoadmap = extractedSkills?.skills
      ? (extractedSkills.skills.map(s => typeof s === 'string' ? s : s.name))
      : [];

    const result = await generateRoadmap(profile, skillsForRoadmap, desiredRole);
    if (result) {
      setRoadmapData(result);
    }
  };

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
    // Use resume text or extracted skills as profile
    const profile = profileSummary || resumeText || (extractedSkills ? extractedSkills.skills.join(', ') : '');

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    if (!profile.trim()) {
      alert("Please enter your profile summary or upload a resume.");
      return;
    }

    const result = await getMatchScore(jobDescription, profile);
    if (result) {
      setMatchResult(result);
    }
  };

  const handleGetRecommendations = async () => {
    // Use resume text or extracted skills as profile
    const profile = resumeText || (extractedSkills ? extractedSkills.skills.join(', ') : '');

    if (!profile) {
      // Prompt user to enter resume first
      alert("Please enter your resume text or upload a resume first to get recommendations.");
      return;
    }

    const result = await getRecommendations(profile);
    if (result) {
      setRecommendations(result);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Career Suite</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Your personal AI career coach. Start by analyzing your resume, then generate a learning roadmap or find your perfect job match.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Profile & Resume (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1. Profile & Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume to unlock AI features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isExtracting}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer block">
                    {isExtracting ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <span className="text-sm font-medium">Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Upload Resume</span>
                        <span className="text-xs text-muted-foreground mt-1">PDF or DOCX</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    placeholder="Paste resume content..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full min-h-[150px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    onClick={handleTextExtraction}
                    disabled={!resumeText.trim() || isExtracting}
                    className="w-full"
                    variant="secondary"
                  >
                    {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Text'}
                  </Button>
                </div>

                {extractedSkills && (
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-3 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium text-sm">Resume Analyzed</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(extractedSkills.skills || []).slice(0, 10).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(extractedSkills.skills?.length || 0) > 10 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{extractedSkills.skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tools (Span 8) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Tool 1: Career Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  2. Career Roadmap
                </CardTitle>
                <CardDescription>
                  Generate a personalized 3-month growth plan based on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter Desired Role (e.g. Senior Frontend Engineer)"
                    value={desiredRole}
                    onChange={(e) => setDesiredRole(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGenerateRoadmap}
                    disabled={!desiredRole.trim() || isGeneratingRoadmap}
                  >
                    {isGeneratingRoadmap ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate Plan'
                    )}
                  </Button>
                </div>
                {roadmapError && (
                  <p className="text-sm text-red-500">{roadmapError}</p>
                )}
              </CardContent>
            </Card>

            {/* Tool 2: Skill Passport (NFT) */}
            <SkillPassportCard extractedSkills={extractedSkills} />

            {/* Roadmap Result Display */}
            {roadmapData && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Timeline */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {roadmapData.timeline.map((phase: any, i: number) => (
                          <div key={i} className="relative pl-6 border-l-2 border-muted last:border-0">
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
                            <div className="mb-1">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{phase.week}</span>
                              <h4 className="font-medium text-foreground">{phase.focus}</h4>
                            </div>
                            <ul className="space-y-1">
                              {phase.actionItems.map((item: string, j: number) => (
                                <li key={j} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Skill Gaps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {roadmapData.skillGaps.map((gap: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recommended Courses</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {roadmapData.courses.map((course: any, i: number) => (
                          <div key={i} className="text-sm">
                            <div className="font-medium truncate">{course.title}</div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                              <span>{course.platform}</span>
                              <a href={course.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tool 3: Matcher */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    3. Job Fit Analyzer
                  </CardTitle>
                  <CardDescription>Check compatibility with a job description.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    placeholder="Paste job description..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    onClick={handleMatchScore}
                    disabled={!jobDescription.trim() || isMatching}
                    className="w-full"
                    variant="outline"
                  >
                    {isMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate Match'}
                  </Button>

                  {matchResult && (
                    <div className="p-4 rounded-lg bg-muted/50 border mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Match Score</span>
                        <span className={`text-lg font-bold ${matchResult.score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {matchResult.score}%
                        </span>
                      </div>
                      {matchResult.missingSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Missing Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {matchResult.missingSkills.map(skill => (
                              <span key={skill} className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tool 4: Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    4. Smart Suggestions
                  </CardTitle>
                  <CardDescription>Get AI-curated job picks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoadingRecommendations}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoadingRecommendations ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Curating...
                      </>
                    ) : (
                      'Get Recommendations'
                    )}
                  </Button>

                  {recommendations && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {recommendations.map((rec: any, index) => (
                        <div key={index} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="font-medium text-sm mb-1">{rec.title}</div>
                          <div className="text-xs text-muted-foreground mb-2">{rec.company}</div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiSuite;
