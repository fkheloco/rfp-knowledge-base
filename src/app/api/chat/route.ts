import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, context, orgId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Mock AI response - in production you'd call OpenAI API here
    const response = generateMockResponse(message, context)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

function generateMockResponse(message: string, context: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('bio') || lowerMessage.includes('biography')) {
    return `I'd be happy to help you draft a bio! Based on your request, here's a professional bio:

**Professional Bio (200 words)**

[Name] is a seasoned professional with extensive experience in [field/specialty]. With a strong background in [relevant skills/technologies], they bring valuable expertise to every project they undertake.

Their career spans [X] years in [industry], where they have consistently delivered high-quality results and demonstrated exceptional problem-solving abilities. [Name] holds a [degree/certification] from [institution] and has specialized training in [relevant areas].

Throughout their career, [Name] has successfully [key achievements or projects]. They are known for their [key strengths] and ability to [specific capabilities]. Their expertise includes [list of specialties or technologies].

[Name] is passionate about [relevant interests or goals] and is committed to [professional values or mission]. They thrive in collaborative environments and are known for their excellent communication skills and attention to detail.

When not working, [Name] enjoys [personal interests] and is actively involved in [community activities or professional organizations].

*Note: Please replace the bracketed placeholders with specific information about the person you're writing about. You can find relevant details in your knowledge base or provide them directly.*`
  }

  if (lowerMessage.includes('company') || lowerMessage.includes('companies')) {
    if (context.includes('Companies in your database')) {
      return `Based on your database, here are the companies you have on record:

${context}

Would you like me to help you:
- Generate a summary of your company capabilities?
- Draft a company profile for a specific organization?
- Create a proposal section highlighting your company strengths?
- Analyze your company portfolio for RFP opportunities?`
    } else {
      return `I can help you with information about companies in your knowledge base. Here are some things I can assist with:

- **Company Profiles**: Generate detailed company profiles for RFP submissions
- **Capability Summaries**: Create summaries of your company's services and expertise
- **Project Histories**: Compile relevant project experience for proposals
- **Team Compositions**: Highlight key personnel and their qualifications

To get specific information, I'll need to access your database. Make sure you're logged in and have the proper permissions. Would you like me to help you with any of these tasks?`
    }
  }

  if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
    if (context.includes('Projects in your database')) {
      return `Here are the projects from your database:

${context}

I can help you:
- Create project summaries for proposals
- Generate case studies highlighting successful outcomes
- Match project experience to RFP requirements
- Draft project descriptions that showcase your capabilities

What specific project information would you like me to help you with?`
    } else {
      return `I can help you work with project information from your knowledge base. Here's what I can do:

- **Project Summaries**: Create compelling project descriptions for proposals
- **Case Studies**: Develop detailed case studies showcasing your success
- **Experience Matching**: Align your project history with RFP requirements
- **Value Propositions**: Highlight project outcomes and client benefits

To access your project data, make sure you're properly authenticated. What type of project information do you need help with?`
    }
  }

  if (lowerMessage.includes('proposal') || lowerMessage.includes('rfp')) {
    return `I can help you create compelling RFP responses! Here are some areas where I can assist:

**Proposal Writing Support:**
- **Executive Summaries**: Craft compelling overviews that grab attention
- **Company Profiles**: Develop detailed capability statements
- **Team Bios**: Create professional biographies for key personnel
- **Project Descriptions**: Write engaging case studies and project summaries
- **Technical Approaches**: Help structure technical solution descriptions

**Content Generation:**
- **Past Performance**: Compile relevant project experience
- **Qualifications**: Highlight certifications, licenses, and capabilities
- **Differentiators**: Emphasize unique strengths and competitive advantages
- **Compliance**: Ensure responses meet all RFP requirements

**What I need from you:**
- Specific RFP requirements or questions
- Target audience and project scope
- Key differentiators you want to highlight
- Any specific formatting or length requirements

What section of your proposal would you like me to help you with?`
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return `I'm your AI assistant for the RFP Knowledge Base! Here's how I can help you:

**📊 Data Management:**
- Answer questions about your companies, people, and projects
- Generate summaries and reports from your database
- Help organize and categorize your information

**✍️ Content Creation:**
- Draft professional bios and company profiles
- Create project descriptions and case studies
- Generate proposal sections and RFP responses
- Write capability statements and qualifications

**🔍 Analysis & Insights:**
- Analyze your database for RFP opportunities
- Match your capabilities to project requirements
- Identify gaps in your knowledge base
- Suggest improvements to your records

**📝 Proposal Support:**
- Help structure RFP responses
- Generate executive summaries
- Create technical approach descriptions
- Develop past performance narratives

**💡 Getting Started:**
- Try asking about your data: "What companies do we have?"
- Request content generation: "Draft a bio for [person name]"
- Ask for help: "Help me write a proposal section about our team"

What would you like to work on today?`
  }

  // Default response
  return `I understand you're asking about "${message}". I'm here to help you with your RFP Knowledge Base!

Here are some ways I can assist you:

- **Generate Content**: Bios, company profiles, project descriptions
- **Answer Questions**: About your companies, people, and projects
- **Proposal Help**: RFP responses, capability statements, case studies
- **Data Analysis**: Insights from your knowledge base

Could you be more specific about what you'd like me to help you with? For example:
- "Draft a 200-word bio for [person name]"
- "What companies do we have in our database?"
- "Help me write a proposal section about our capabilities"

I'm ready to help!`
}
