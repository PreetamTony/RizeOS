# JobMate 2.0 - Decentralized Job & Networking Portal

JobMate 2.0 is a cutting-edge full-stack application that bridges the gap between Web2 recruitment and Web3 payments, enhanced with AI-powered features. It allows users to create professional profiles, post jobs with crypto payments, and find matches using AI.

## 🚀 Features

### 1. Authentication & Profile Management
- **Secure Auth**: JWT-based authentication with secure session management.
- **Rich Profiles**: Users can create detailed profiles with:
  - Professional Title & Bio
  - Social Links (LinkedIn)
  - **AI Skill Extraction**: Upload a resume (PDF/DOCX) to automatically extract and verify skills.
  - **Wallet Integration**: Link MetaMask (EVM) or Phantom (Solana) wallets.

### 2. Job Board & Social Feed
- **Job Posting**: Employers can post detailed job listings.
- **Crypto Payments**: Posting a job requires a small platform fee paid in ETH (EVM) or SOL (Solana).
- **Social Feed**: A professional feed to share insights, updates, and media.
- **Advanced Filtering**: Filter jobs by skills, location, budget, and tags.

### 3. AI Suite
- **Resume Parsing**: Extracts skills and experience from resumes.
- **Job Matching**: Calculates a "Match Score" between a candidate's profile and a job description.
- **Smart Recommendations**: AI-curated job and connection suggestions.
- **Career Roadmap**: Generates a personalized 3-month learning path based on skill gaps.

### 4. Web3 Integration
- **Multi-Chain Support**: Supports both Ethereum (via Ethers.js) and Solana (via Web3.js).
- **Payment Verification**: Backend verifies on-chain transactions before activating job posts.
- **NFT Skill Passport**: (Bonus) Mint verified skills as Soulbound Tokens on Solana.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: React Context API
- **Web3**: `@solana/web3.js`, `ethers`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **File Handling**: Multer (Local storage)
- **AI Service**: Python (FastAPI/Flask) or Node.js integration

## 📂 Project Structure

```
jobmate2.0/
├── src/                # Frontend Source
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages (Feed, Jobs, Profile, etc.)
│   ├── services/       # API and AI service integrations
│   ├── hooks/          # Custom React hooks (useAuth, useWallet, useAI)
│   └── types/          # TypeScript definitions
├── backend/            # Node.js Backend
│   ├── src/
│   │   ├── controllers/# Route logic
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Auth and Upload middleware
│   └── uploads/        # Stored resume/avatar files
└── ai-service/         # Python AI Service (Optional/Microservice)
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Python 3.8+ (for AI service)
- MetaMask or Phantom Wallet extension

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jobmate.git
    cd jobmate2.0
    ```

2.  **Frontend Setup**
    ```bash
    npm install
    # Create .env file
    echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
    npm run dev
    ```

3.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file
    # Add: PORT=5000, MONGO_URI=..., JWT_SECRET=..., ADMIN_WALLET_EVM=..., ADMIN_WALLET_SOLANA=...
    npm run dev
    ```

4.  **AI Service Setup** (Optional)
    ```bash
    cd ai-service
    pip install -r requirements.txt
    python main.py
    ```

## 🔄 User Flow

1.  **Sign Up**: User registers and logs in.
2.  **Profile Setup**: User updates profile, uploads resume to extract skills, and connects wallet.
3.  **Job Search**: User browses jobs, filters by skills, and checks "Match Score".
4.  **Post Job**:
    - Employer fills job details.
    - Clicks "Pay & Post".
    - Signs transaction in Wallet.
    - Backend verifies payment and publishes job.
5.  **Networking**: User posts updates on the Feed and interacts with others.

## 🛡️ Security
- **JWT**: Secure stateless authentication.
- **Password Hashing**: Bcrypt for password encryption.
- **Input Validation**: Mongoose schema validation.
- **Payment Verification**: Server-side verification of blockchain transactions.

---
Built for RizeOS Core Team Internship Assessment.
