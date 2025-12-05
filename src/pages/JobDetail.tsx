import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { Job, MatchResult } from '@/types';
import {
  ArrowLeft,
  Bookmark,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Loader2,
  MapPin,
  Share2,
  Sparkles
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await api.getJobById(id);
        if (response.data) {
          setJob(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const [resumeText, setResumeText] = useState('');
  const [isMatching, setIsMatching] = useState(false);

  const handleCalculateMatch = async () => {
    if (!job || !resumeText.trim()) return;

    setIsMatching(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const jobSkills = job.skills || [];
    const resumeLower = resumeText.toLowerCase();

    // Find matched skills
    const matchedSkills = jobSkills.filter(skill =>
      resumeLower.includes(skill.toLowerCase())
    );

    // Find missing skills
    const missingSkills = jobSkills.filter(skill =>
      !resumeLower.includes(skill.toLowerCase())
    );

    // Calculate score based on skills (70%) and keyword overlap (30%)
    const skillScore = jobSkills.length > 0
      ? (matchedSkills.length / jobSkills.length) * 100
      : 0;

    // Simple keyword overlap for description (very basic)
    const jobKeywords = job.description
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 4) // Filter out short words
      .slice(0, 20); // Top 20 keywords

    const matchedKeywords = jobKeywords.filter(word => resumeLower.includes(word));
    const keywordScore = jobKeywords.length > 0
      ? (matchedKeywords.length / jobKeywords.length) * 100
      : 0;

    // Weighted final score
    const finalScore = Math.round((skillScore * 0.7) + (keywordScore * 0.3));

    setMatchResult({
      score: finalScore,
      matchedSkills,
      missingSkills,
      recommendations: []
    });

    setIsMatching(false);
  };

  const formatBudget = (budget: Job['budget']) => {
    if (!budget) return 'Not specified';
    const { min, max, currency, type } = budget;
    const typeLabel = type === 'hourly' ? '/hr' : type === 'annual' ? '/yr' : '';
    if (min && max) {
      return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}${typeLabel}`;
    }
    if (max) return `Up to ${currency}${max.toLocaleString()}${typeLabel}`;
    if (min) return `From ${currency}${min.toLocaleString()}${typeLabel}`;
    return 'Not specified';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <p className="text-muted-foreground mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">
                {job.title}
              </h1>
              {job.company && (
                <p className="text-lg text-muted-foreground">{job.company}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" aria-label="Share">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Save">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
            )}
            {job.remote && (
              <Badge variant="accent">Remote</Badge>
            )}
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{formatBudget(job.budget)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                Posted {new Date(job.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(job.skills || []).map((skill) => (
                    <Badge key={skill} variant="skill" className="text-sm py-1.5 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-28">
              <CardContent className="p-6 space-y-4">
                {job.applicationLink ? (
                  <Button variant="hero" className="w-full" asChild>
                    <a href={job.applicationLink} target="_blank" rel="noopener noreferrer">
                      Apply Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="hero" className="w-full">
                    Apply Now
                  </Button>
                )}

                {/* AI Match Score */}
                {isAuthenticated && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="font-medium">AI Match Score</span>
                    </div>

                    {matchResult ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Match Score</span>
                          <Button variant="ghost" size="sm" onClick={() => setMatchResult(null)} className="h-auto p-0 text-muted-foreground hover:text-foreground">
                            Reset
                          </Button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${matchResult.score >= 80 ? 'bg-success' :
                                matchResult.score >= 50 ? 'bg-warning' : 'bg-destructive'
                                }`}
                              style={{ width: `${matchResult.score}%` }}
                            />
                          </div>
                          <span className={`font-bold text-lg ${matchResult.score >= 80 ? 'text-success' :
                            matchResult.score >= 50 ? 'text-warning' : 'text-destructive'
                            }`}>
                            {matchResult.score}%
                          </span>
                        </div>

                        {matchResult.matchedSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Matched Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {matchResult.matchedSkills.map((skill) => (
                                <Badge key={skill} variant="success" className="text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {matchResult.missingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Missing Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {matchResult.missingSkills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs border-dashed">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                          {matchResult.score >= 80 ? "Great match! You should definitely apply." :
                            matchResult.score >= 50 ? "Good potential. Highlight your transferable skills." :
                              "This role might be a stretch. Consider upskilling."}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Paste your resume or bio to check your compatibility with this role.
                        </p>
                        <textarea
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Paste your resume text or bio here..."
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                        />
                        <Button
                          className="w-full"
                          onClick={handleCalculateMatch}
                          disabled={!resumeText.trim() || isMatching}
                        >
                          {isMatching ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'Check Match Score'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Posted By */}
                {job.postedByUser && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Posted by</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {job.postedByUser.avatarUrl ? (
                          <img
                            src={job.postedByUser.avatarUrl}
                            alt={job.postedByUser.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {job.postedByUser.displayName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{job.postedByUser.displayName}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default JobDetail;
