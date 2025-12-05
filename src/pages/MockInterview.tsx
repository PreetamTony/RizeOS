import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/useAI';
import { BrainCircuit, CheckCircle2, Lightbulb, Loader2, MessageSquare, Target, Upload } from 'lucide-react';
import React, { useState } from 'react';

const MockInterview: React.FC = () => {
    const {
        generateInterviewQuestion,
        evaluateInterviewAnswer,
        isInterviewLoading,
        generateAptitudeQuestion,
        evaluateAptitudeAnswer,
        isAptitudeLoading,
        extractSkills
    } = useAI();

    // Interview State
    const [resumeText, setResumeText] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [interviewType, setInterviewType] = useState('Technical');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<any>(null);

    // Aptitude State
    const [aptitudeTopic, setAptitudeTopic] = useState('Quantitative');
    const [aptitudeDifficulty, setAptitudeDifficulty] = useState('Medium');
    const [aptitudeQuestion, setAptitudeQuestion] = useState<any>(null);
    const [aptitudeAnswer, setAptitudeAnswer] = useState('');
    const [aptitudeFeedback, setAptitudeFeedback] = useState<any>(null);

    const handleStartInterview = async () => {
        if (!resumeText && !jobDesc) {
            alert("Please provide resume text or job description.");
            return;
        }
        const res = await generateInterviewQuestion(resumeText, jobDesc, difficulty, interviewType);
        if (res && res.questions) {
            setQuestions(res.questions);
            setCurrentQuestionIndex(0);
            setCurrentQuestion(res.questions[0]);
            setFeedback(null);
            setUserAnswer('');
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setCurrentQuestion(questions[nextIndex]);
            setFeedback(null);
            setUserAnswer('');
        } else {
            // Finished
            alert("Interview Completed! Great job.");
            setQuestions([]);
            setCurrentQuestion(null);
        }
    };

    const handleSubmitInterviewAnswer = async () => {
        if (!userAnswer.trim()) return;
        const res = await evaluateInterviewAnswer(currentQuestion.question, userAnswer, jobDesc);
        if (res) setFeedback(res);
    };

    const handleStartAptitude = async () => {
        const q = await generateAptitudeQuestion(aptitudeTopic, aptitudeDifficulty);
        if (q) {
            setAptitudeQuestion(q);
            setAptitudeFeedback(null);
            setAptitudeAnswer('');
        }
    };

    const handleSubmitAptitudeAnswer = async () => {
        if (!aptitudeAnswer.trim()) return;
        const res = await evaluateAptitudeAnswer(aptitudeQuestion.question, aptitudeAnswer);
        if (res) setAptitudeFeedback(res);
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Mock Interview & Practice</h1>
                    <p className="text-muted-foreground text-lg">
                        Sharpen your skills with AI-driven mock interviews and aptitude tests.
                    </p>
                </div>

                <Tabs defaultValue="interview" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="interview">Mock Interview</TabsTrigger>
                        <TabsTrigger value="aptitude">Aptitude Practice</TabsTrigger>
                    </TabsList>

                    {/* MOCK INTERVIEW TAB */}
                    <TabsContent value="interview" className="space-y-6">
                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* Setup Column */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Interview Setup</CardTitle>
                                        <CardDescription>Configure your session</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Job Description</Label>
                                            <Textarea
                                                placeholder="Paste job description..."
                                                value={jobDesc}
                                                onChange={(e) => setJobDesc(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Resume</Label>
                                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const res = await extractSkills(file);
                                                            if (res && res.summary) {
                                                                setResumeText(res.summary);
                                                            } else if (res && res.skills) {
                                                                // Fallback if no summary
                                                                setResumeText(`Skills: ${res.skills.map(s => typeof s === 'string' ? s : s.name).join(', ')}`);
                                                            }
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {resumeText ? "Resume Uploaded (Click to replace)" : "Upload Resume (PDF)"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative flex items-center py-2">
                                                <span className="w-full border-t" />
                                                <span className="px-2 text-xs text-muted-foreground uppercase bg-background">Or</span>
                                                <span className="w-full border-t" />
                                            </div>
                                            <Textarea
                                                placeholder="Paste resume summary..."
                                                value={resumeText}
                                                onChange={(e) => setResumeText(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Difficulty</Label>
                                                <Select value={difficulty} onValueChange={setDifficulty}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Easy">Easy</SelectItem>
                                                        <SelectItem value="Medium">Medium</SelectItem>
                                                        <SelectItem value="Hard">Hard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select value={interviewType} onValueChange={setInterviewType}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Technical">Technical</SelectItem>
                                                        <SelectItem value="Behavioral">Behavioral</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button onClick={handleStartInterview} disabled={isInterviewLoading} className="w-full">
                                            {isInterviewLoading ? <Loader2 className="animate-spin mr-2" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                                            Generate Question
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Interaction Column */}
                            <div className="lg:col-span-8 space-y-6">
                                {currentQuestion ? (
                                    <Card className="border-primary/20">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline">{interviewType} - {difficulty}</Badge>
                                                <Badge variant="secondary">Question {currentQuestion.id} of 5</Badge>
                                            </div>
                                            <CardTitle className="text-xl mt-2">{currentQuestion.question}</CardTitle>
                                            <CardDescription>{currentQuestion.context}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Your Answer</Label>
                                                <Textarea
                                                    placeholder="Type your answer here..."
                                                    value={userAnswer}
                                                    onChange={(e) => setUserAnswer(e.target.value)}
                                                    className="min-h-[150px]"
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <Button onClick={handleSubmitInterviewAnswer} disabled={isInterviewLoading || !userAnswer.trim() || !!feedback}>
                                                    {isInterviewLoading ? <Loader2 className="animate-spin mr-2" /> : 'Submit Answer'}
                                                </Button>

                                                {feedback && (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => {
                                                            // Move to next question
                                                            const nextId = currentQuestion.id + 1;
                                                            // We need to store the full list of questions in state to do this properly
                                                            // For now, let's assume we have a way to get the next one.
                                                            // See the state update below.
                                                            handleNextQuestion();
                                                        }}
                                                    >
                                                        {currentQuestion.id < 5 ? 'Next Question' : 'Finish Interview'}
                                                    </Button>
                                                )}
                                            </div>

                                            {feedback && (
                                                <div className="mt-6 p-6 bg-muted/50 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-semibold text-lg">Feedback</h3>
                                                        <Badge className={feedback.score >= 70 ? "bg-green-500" : "bg-yellow-500"}>
                                                            Score: {feedback.score}/100
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-4">{feedback.feedback}</p>

                                                    <div className="space-y-2 mb-4">
                                                        <h4 className="font-medium text-sm">Key Improvements:</h4>
                                                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                            {feedback.improvements?.map((imp: string, i: number) => (
                                                                <li key={i}>{imp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="bg-background p-4 rounded-lg border">
                                                        <h4 className="font-medium text-sm mb-2 text-primary">Sample Answer:</h4>
                                                        <p className="text-sm text-muted-foreground italic">{feedback.sample_answer}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
                                        <BrainCircuit className="w-12 h-12 mb-4 opacity-50" />
                                        <p>Configure your interview settings and click "Generate Question" to start.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* APTITUDE TAB */}
                    <TabsContent value="aptitude" className="space-y-6">
                        <div className="grid lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Aptitude Setup</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Topic</Label>
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="e.g. Boat Problems, Time & Work, Logical Reasoning"
                                                    value={aptitudeTopic}
                                                    onChange={(e) => setAptitudeTopic(e.target.value)}
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {['Quantitative', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'].map((t) => (
                                                        <Badge
                                                            key={t}
                                                            variant="outline"
                                                            className="cursor-pointer hover:bg-secondary"
                                                            onClick={() => setAptitudeTopic(t)}
                                                        >
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Difficulty</Label>
                                            <Select value={aptitudeDifficulty} onValueChange={setAptitudeDifficulty}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Easy">Easy</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="Hard">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleStartAptitude} disabled={isAptitudeLoading || !aptitudeTopic} className="w-full">
                                            {isAptitudeLoading ? <Loader2 className="animate-spin mr-2" /> : <Target className="mr-2 h-4 w-4" />}
                                            Get Question
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-8">
                                {aptitudeQuestion ? (
                                    <Card>
                                        <CardHeader>
                                            <Badge variant="secondary" className="w-fit mb-2">{aptitudeTopic}</Badge>
                                            <CardTitle className="text-lg">{aptitudeQuestion.question}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {aptitudeQuestion.options && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {aptitudeQuestion.options.map((opt: string, i: number) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => setAptitudeAnswer(opt)}
                                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${aptitudeAnswer === opt
                                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                                : 'hover:bg-muted/50'
                                                                }`}
                                                        >
                                                            <span className="font-medium">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <Button onClick={handleSubmitAptitudeAnswer} disabled={isAptitudeLoading || !aptitudeAnswer}>
                                                    {isAptitudeLoading ? <Loader2 className="animate-spin mr-2" /> : 'Check Answer'}
                                                </Button>
                                                <Button variant="outline" onClick={handleStartAptitude} disabled={isAptitudeLoading}>
                                                    Next Question
                                                </Button>
                                            </div>

                                            {aptitudeFeedback && (
                                                <div className={`mt-6 p-6 rounded-xl border ${aptitudeFeedback.is_correct ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {aptitudeFeedback.is_correct ? (
                                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                        ) : (
                                                            <Lightbulb className="w-6 h-6 text-red-600" />
                                                        )}
                                                        <h3 className={`font-bold ${aptitudeFeedback.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                                                            {aptitudeFeedback.is_correct ? 'Correct!' : 'Incorrect'}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-foreground/80 mb-4">{aptitudeFeedback.explanation}</p>
                                                    <div className="text-xs text-muted-foreground">
                                                        <strong>Analysis:</strong> {aptitudeFeedback.topic_analysis}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
                                        <Target className="w-12 h-12 mb-4 opacity-50" />
                                        <p>Select a topic and difficulty to start practicing.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default MockInterview;
