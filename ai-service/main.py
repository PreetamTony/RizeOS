from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import json
import io
from pypdf import PdfReader
import os 
from typing import Optional, List
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@app.get("/")
def read_root():
    return {"status": "online", "service": "JobMate AI Service"}

@app.post("/analyze-resume")
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    try:
        resume_content = ""

        if file:
            content = await file.read()
            if file.filename.lower().endswith('.pdf'):
                pdf = PdfReader(io.BytesIO(content))
                for page in pdf.pages:
                    resume_content += page.extract_text() + "\n"
            else:
                resume_content = content.decode('utf-8')
        elif text:
            resume_content = text
        else:
             raise HTTPException(status_code=400, detail="No resume provided (file or text required)")

        if not resume_content.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from resume")

        prompt = f"""
        Analyze the following resume text and extract the key skills, experience summary, and provide 3 quick improvement tips.
        Return the response in strict JSON format with the following structure:
        {{
            "skills": ["skill1", "skill2", ...],
            "summary": "Brief professional summary...",
            "tips": ["tip1", "tip2", "tip3"],
            "confidence": 0.95
        }}

        Resume Text:
        {resume_content[:10000]} 
        """
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "You are an expert career coach and resume analyzer. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        print(f"Error analyzing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-job")
async def match_job(request: MatchRequest):
    try:
        prompt = f"""
        Compare the following resume with the job description. Calculate a match score (0-100) and identify matched skills and missing skills.
        Return the response in strict JSON format with the following structure:
        {{
            "score": 85,
            "matchedSkills": ["skill1", "skill2"],
            "missingSkills": ["skill3", "skill4"],
            "recommendations": ["rec1", "rec2"]
        }}

        Resume:
        {request.resume_text}

        Job Description:
        {request.job_description}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "You are an expert ATS system. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        messages = [
            {"role": "system", "content": "You are JobMate AI, a helpful career assistant. You help users with job search, interview prep, and career advice."}
        ]
        
        for msg in request.history:
            messages.append(msg)
            
        messages.append({"role": "user", "content": request.message})

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=False
        )

        return {"message": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class Job(BaseModel):
    id: str
    title: str
    description: str
    skills: List[str] = []

class RecommendationRequest(BaseModel):
    jobs: List[Job]
    profile: str

@app.post("/recommend-jobs")
async def recommend_jobs(request: RecommendationRequest):
    try:
        jobs_text = ""
        for job in request.jobs:
            jobs_text += f"ID: {job.id}\nTitle: {job.title}\nSkills: {', '.join(job.skills)}\nDescription: {job.description[:200]}...\n\n"

        prompt = f"""
        You are an expert career advisor. I will provide a user profile and a list of available jobs.
        Your task is to select the top 3 best matching jobs for this user.
        
        User Profile:
        {request.profile[:2000]}

        Available Jobs:
        {jobs_text}

        Return the response in strict JSON format with the following structure:
        {{
            "recommendations": [
                {{
                    "jobId": "id1",
                    "reason": "Why this is a good match..."
                }},
                ...
            ]
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful job matching assistant. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        print(f"Error recommending jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class RoadmapRequest(BaseModel):
    resume_text: str
    skills: List[str]
    desired_role: str

@app.post("/generate-roadmap")
async def generate_roadmap(request: RoadmapRequest):
    try:
        prompt = f"""
        Create a personalized 3-month career roadmap for a user aspiring to be a "{request.desired_role}".
        
        User Profile:
        - Skills: {', '.join(request.skills)}
        - Resume Summary: {request.resume_text[:1000]}

        The roadmap should be practical, actionable, and focused on bridging skill gaps.
        
        Return the response in strict JSON format with the following structure:
        {{
            "timeline": [
                {{
                    "week": "Week 1-2",
                    "focus": "Topic/Skill",
                    "actionItems": ["item1", "item2"]
                }},
                ... (cover 12 weeks)
            ],
            "skillGaps": ["gap1", "gap2"],
            "courses": [
                {{
                    "title": "Course Name",
                    "platform": "Platform (e.g., Coursera, Udemy)",
                    "link": "#"
                }}
            ],
            "projectIdeas": [
                {{
                    "title": "Project Name",
                    "description": "Brief description"
                }}
            ],
            "trends": ["trend1", "trend2"]
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert career mentor. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        content = completion.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        print(f"Error generating roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class InterviewQuestionRequest(BaseModel):
    resume_text: str
    job_description: str
    difficulty: str
    type: str  

class InterviewEvaluationRequest(BaseModel):
    question: str
    answer: str
    job_description: str

class AptitudeQuestionRequest(BaseModel):
    topic: str
    difficulty: str

class AptitudeEvaluationRequest(BaseModel):
    question: str
    answer: str

@app.post("/generate-interview-question")
async def generate_interview_question(request: InterviewQuestionRequest):
    try:
        prompt = f"""
        Generate 5 distinct {request.difficulty} {request.type} interview questions for a candidate.
        
        Context:
        - Job Description: {request.job_description[:500]}...
        - Resume Summary: {request.resume_text[:500]}...
        
        Return in strict JSON format with a "questions" array:
        {{
            "questions": [
                {{
                    "id": 1,
                    "question": "Question text...",
                    "context": "Why this is relevant..."
                }},
                ...
            ]
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-interview-answer")
async def evaluate_interview_answer(request: InterviewEvaluationRequest):
    try:
        prompt = f"""
        Evaluate the candidate's answer to the interview question.
        
        Question: {request.question}
        Candidate Answer: {request.answer}
        Job Context: {request.job_description[:200]}...
        
        Return in strict JSON format:
        {{
            "score": 85,
            "feedback": "Constructive feedback...",
            "improvements": ["Suggestion 1", "Suggestion 2"],
            "sample_answer": "An ideal answer would be..."
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert interviewer providing feedback. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-aptitude-question")
async def generate_aptitude_question(request: AptitudeQuestionRequest):
    try:
        prompt = f"""
        Generate a single {request.difficulty} aptitude question on the topic: {request.topic}.
        
        Return in strict JSON format:
        {{
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_option": "Option A"
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an aptitude trainer. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-aptitude-answer")
async def evaluate_aptitude_answer(request: AptitudeEvaluationRequest):
    try:
        prompt = f"""
        Evaluate the answer to the aptitude question.
        
        Question: {request.question}
        User Answer: {request.answer}
        
        Return in strict JSON format:
        {{
            "is_correct": true/false,
            "explanation": "Detailed step-by-step solution...",
            "topic_analysis": "This tests your ability to..."
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an aptitude trainer. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
