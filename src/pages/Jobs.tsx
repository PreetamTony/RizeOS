import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Briefcase, DollarSign, Clock, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Job, JobFilters } from '@/types';
import api from '@/services/api';

// Skeleton loader for job cards
const JobCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-20" />
            <div className="h-6 bg-muted rounded w-24" />
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
    <Link to={`/jobs/${job.id}`}>
      <Card hover className="group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Title & Company */}
              <h3 className="font-semibold font-display text-lg group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              {job.company && (
                <p className="text-muted-foreground text-sm mb-3">{job.company}</p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.remote && (
                  <Badge variant="accent" className="text-xs">Remote</Badge>
                )}
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatBudget(job.budget)}</span>
                </div>
              </div>
              
              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="skill" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.requiredSkills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.requiredSkills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(job.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
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
          setJobs(response.data.data);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2">
            Find Your Next <span className="gradient-text">Opportunity</span>
          </h1>
          <p className="text-muted-foreground">
            Browse through thousands of jobs from innovative companies worldwide
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <Button 
              variant="outline" 
              className="h-12 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Quick Skill Filters */}
          <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filters.skills?.includes(skill)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input 
                      placeholder="e.g., New York, Remote"
                      value={filters.location || ''}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Budget</label>
                    <Input 
                      type="number"
                      placeholder="e.g., 50000"
                      value={filters.minBudget || ''}
                      onChange={(e) => setFilters({ ...filters, minBudget: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Budget</label>
                    <Input 
                      type="number"
                      placeholder="e.g., 150000"
                      value={filters.maxBudget || ''}
                      onChange={(e) => setFilters({ ...filters, maxBudget: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.remote}
                        onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Remote Only</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-border gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setFilters({})}
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
        <div className="space-y-4">
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
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find more opportunities
                </p>
                <Button onClick={() => { setFilters({}); setSearchQuery(''); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Load More */}
        {jobs.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More Jobs
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Jobs;
