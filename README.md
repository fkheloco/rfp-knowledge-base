# RFP Knowledge Base

A comprehensive knowledge management system for RFP (Request for Proposal) responses, built with Next.js 14, Supabase, and AI-powered content generation.

## Features

- **Multi-tenant Architecture**: Isolated data per organization
- **AI-Powered Content Generation**: Upload documents and automatically extract structured data
- **Comprehensive Record Management**: Manage companies, people, and projects
- **Real-time Chat Assistant**: AI-powered help for content creation and RFP responses
- **Status Tracking**: Track verification status from AI-Generated to Client Verified
- **Modern UI**: Clean, responsive interface built with shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **UI Components**: shadcn/ui, Radix UI
- **AI Integration**: OpenAI API (for content generation and chat)
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone https://github.com/fkheloco/rfp-knowledge-base.git
cd rfp-knowledge-base
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the migration to create the database schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Set up Supabase Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `documents`
3. Set the bucket to public if you want direct access to files

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **organizations**: Multi-tenant organization data
- **users**: User accounts linked to organizations
- **companies**: Company profiles and capabilities
- **people**: Individual profiles with bios and specialties
- **projects**: Project history and case studies

All tables include Row Level Security (RLS) to ensure data isolation between organizations.

## Features Overview

### Dashboard
- Overview of records and status counts
- Quick access to common tasks
- Recent activity feed

### Records Management
- Airtable-like interface for browsing records
- Filtering and search capabilities
- Inline editing and status updates

### File Upload & AI Processing
- Upload PDF, DOC, DOCX, and TXT files
- Automatic extraction of structured data using AI
- Status tracking from AI-Generated to Client Verified

### AI Chat Assistant
- Context-aware responses based on your data
- Content generation for bios, profiles, and proposals
- RFP response assistance

### Detail Views
- Comprehensive record editing
- Copy-to-clipboard functionality for generated content
- Status management and verification workflow

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway)

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the API routes

## Usage

1. **Sign Up**: Create an account and organization
2. **Upload Documents**: Add resumes, company profiles, or project documents
3. **Review AI-Generated Content**: Check and edit automatically extracted data
4. **Use Chat Assistant**: Get help with content generation and RFP responses
5. **Manage Records**: Browse, edit, and organize your knowledge base

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@purelystartup.com or create an issue in the GitHub repository.