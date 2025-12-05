import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import type { Job, JobFilters } from '@/types';
import { ArrowRight, Briefcase, Building2, ChevronDown, Clock, Filter, IndianRupee, MapPin, Search, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Skeleton loader for job cards
const JobCardSkeleton: React.FC = () => (
  <Card className="animate-pulse border-border/50 bg-card/50">
    <CardContent className="p-6">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="flex gap-3 mt-4">
            <div className="h-8 bg-muted rounded-full w-24" />
            <div className="h-8 bg-muted rounded-full w-24" />
            <div className="h-8 bg-muted rounded-full w-24" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
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

  return (
    <Link to={`/jobs/${job.id}`} className="block group">
      <Card className="relative overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group-hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-5 h-5 text-primary -translate-x-2 group-hover:translate-x-0 transition-transform duration-300" />
        </div>

        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Company Logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 border border-border/50 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-8 h-8 text-primary/80" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title & Company */}
              <div className="mb-1">
                <h3 className="font-bold font-display text-xl group-hover:text-primary transition-colors truncate pr-8">
                  {job.title}
                </h3>
                {job.company && (
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    {job.company}
                    {job.remote && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Remote</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4 mb-4">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary/60" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-primary/60" />
                  <span className="font-medium text-foreground/80">{formatBudget(job.budget)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary/60" />
                  <span>
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-primary/5 hover:bg-primary/10 text-primary/80 border-primary/10 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
                {(job.skills || []).length > 4 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{job.skills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await api.getJobs({ ...filters, search: searchQuery });
        if (response.data) {
          // Handle both unwrapped array and paginated response
          const jobsData = Array.isArray(response.data) ? response.data : response.data.data;
          setJobs(jobsData || []);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [filters, searchQuery]);

  const popularSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Solidity', 'Rust', 'AWS', 'Web3'
  ];

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-background/50">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Over 1,000+ new jobs added this week</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display mb-6 tracking-tight">
              Find Your Next <br className="hidden sm:block" />
              <span className="gradient-text">Dream Opportunity</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover roles at innovative companies, from fast-growing startups to global tech giants.
              Your career journey starts here.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="bg-card/70 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, skill, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/70"
                  />
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-border/50 mx-2" />
                <Button
                  variant="ghost"
                  className="h-14 px-6 gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                <Button className="h-14 px-8 rounded-xl text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Skill Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    const currentSkills = filters.skills || [];
                    if (currentSkills.includes(skill)) {
                      setFilters({
                        ...filters,
                        skills: currentSkills.filter(s => s !== skill)
                      });
                    } else {
                      setFilters({
                        ...filters,
                        skills: [...currentSkills, skill]
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${filters.skills?.includes(skill)
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <Card className="animate-in fade-in slide-in-from-top-4 border-border/50 bg-card/80 backdrop-blur-sm mb-8">
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <Input
                        placeholder="e.g., New York"
                        value={filters.location || ''}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Min Budget</label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000"
                        value={filters.minBudget || ''}
                        onChange={(e) => setFilters({ ...filters, minBudget: Number(e.target.value) })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Max Budget</label>
                      <Input
                        type="number"
                        placeholder="e.g., 150000"
                        value={filters.maxBudget || ''}
                        onChange={(e) => setFilters({ ...filters, maxBudget: Number(e.target.value) })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.remote ? 'bg-primary border-primary' : 'border-input bg-background'}`}>
                          {filters.remote && <Sparkles className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={filters.remote}
                          onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                          className="hidden"
                        />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">Remote Only</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 pt-6 border-t border-border/50 gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setFilters({})}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Clear All
                    </Button>
                    <Button onClick={() => setShowFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isLoading ? 'Searching jobs...' : `${jobs.length} Jobs Found`}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sort by:</span>
                <select className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer">
                  <option>Newest First</option>
                  <option>Salary: High to Low</option>
                  <option>Relevance</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              // Empty state
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    We couldn't find any jobs matching your criteria. Try adjusting your search or filters.
                  </p>
                  <Button
                    onClick={() => { setFilters({}); setSearchQuery(''); }}
                    variant="outline"
                    className="h-11 px-8"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Load More */}
          {jobs.length > 0 && (
            <div className="mt-12 text-center">
              <Button variant="secondary" size="lg" className="h-12 px-8 rounded-xl">
                Load More Jobs
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Jobs;
