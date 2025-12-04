import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Link as LinkIcon,
  Plus,
  X,
  Loader2,
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWallet } from '@/hooks/useWallet';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

type PaymentStatus = 'idle' | 'waiting' | 'submitted' | 'verifying' | 'verified' | 'failed';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { connected, address, sendPayment, chain } = useWallet();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [budgetType, setBudgetType] = useState<'hourly' | 'fixed' | 'annual'>('annual');
  const [applicationLink, setApplicationLink] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handlePayAndSubmit = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to post a job",
        variant: "destructive",
      });
      navigate('/connect-wallet');
      return;
    }

    try {
      // Step 1: Initiate payment
      setPaymentStatus('waiting');
      
      const result = await sendPayment();
      if (!result) {
        throw new Error('Payment failed');
      }
      
      setTxHash(result.txHash);
      setPaymentStatus('submitted');

      // Step 2: Verify payment
      setPaymentStatus('verifying');
      const verifyResponse = await api.verifyPayment(result.txHash, chain!);
      
      if (verifyResponse.error || verifyResponse.data?.status !== 'verified') {
        throw new Error(verifyResponse.error || 'Payment verification failed');
      }
      
      setPaymentStatus('verified');

      // Step 3: Submit job
      setIsSubmitting(true);
      const jobResponse = await api.createJob({
        title,
        description,
        company: company || undefined,
        requiredSkills: skills,
        budget: {
          min: budgetMin ? Number(budgetMin) : undefined,
          max: budgetMax ? Number(budgetMax) : undefined,
          currency: '$',
          type: budgetType,
        },
        location: location || undefined,
        remote: isRemote,
        tags,
        applicationLink: applicationLink || undefined,
        status: 'active',
      });

      if (jobResponse.error) {
        throw new Error(jobResponse.error);
      }

      toast({
        title: "Job posted successfully!",
        description: "Your job listing is now live.",
      });

      navigate('/jobs');

    } catch (error) {
      setPaymentStatus('failed');
      toast({
        title: "Failed to post job",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && description.trim() && skills.length > 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">
            Post a <span className="gradient-text">Job</span>
          </h1>
          <p className="text-muted-foreground">
            Create a job listing and reach thousands of talented professionals
          </p>
        </div>

        {/* Wallet Status Banner */}
        {!connected && (
          <Card className="mb-6 bg-warning/10 border-warning/30">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-warning shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Wallet connection required</p>
                <p className="text-sm text-muted-foreground">
                  You need to connect a wallet to pay the platform fee and post your job.
                </p>
              </div>
              <Button onClick={() => navigate('/connect-wallet')}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Fill in the details about the position you're hiring for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., Senior React Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="e.g., Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Description <span className="text-destructive">*</span>
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[150px] rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            </div>

            {/* Location & Remote */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Type</label>
                <div className="flex items-center gap-4 h-11">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRemote}
                      onChange={(e) => setIsRemote(e.target.checked)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Remote OK</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget / Salary</label>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Min"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value as 'hourly' | 'fixed' | 'annual')}
                  className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="annual">Per Year</option>
                  <option value="hourly">Per Hour</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Required Skills <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="skill" className="gap-1 pr-1">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Application Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://..."
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Optional external link where candidates can apply
              </p>
            </div>

            {/* Payment Status */}
            {paymentStatus !== 'idle' && (
              <Card className={`${
                paymentStatus === 'verified' ? 'bg-success/10 border-success/30' :
                paymentStatus === 'failed' ? 'bg-destructive/10 border-destructive/30' :
                'bg-primary/5 border-primary/20'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {paymentStatus === 'waiting' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span>Waiting for wallet confirmation...</span>
                      </>
                    )}
                    {paymentStatus === 'submitted' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span>Transaction submitted — waiting for confirmation...</span>
                      </>
                    )}
                    {paymentStatus === 'verifying' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span>Payment verified — posting job...</span>
                      </>
                    )}
                    {paymentStatus === 'verified' && (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="text-success">Payment verified!</span>
                      </>
                    )}
                    {paymentStatus === 'failed' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <span className="text-destructive">Payment failed. Please try again.</span>
                      </>
                    )}
                  </div>
                  {txHash && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      TX: {txHash.slice(0, 20)}...{txHash.slice(-8)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Platform Fee</p>
                  <p className="text-sm text-muted-foreground">
                    Only 0.00001 ETH required (testnet)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">0.00001 ETH</p>
                  <p className="text-xs text-muted-foreground">≈ $0.03</p>
                </div>
              </div>
              
              <Button
                variant="hero"
                className="w-full"
                onClick={handlePayAndSubmit}
                disabled={!isFormValid || !connected || isSubmitting || paymentStatus !== 'idle' && paymentStatus !== 'failed'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : !connected ? (
                  <>
                    <Wallet className="w-5 h-5" />
                    Connect Wallet to Post
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5" />
                    Pay & Post Job
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PostJob;
