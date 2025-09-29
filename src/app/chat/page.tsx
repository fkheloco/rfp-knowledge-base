'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Get user's organization for context
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData) throw new Error('User not found')

      // Fetch relevant data based on the query
      const query = input.toLowerCase()
      let contextData = ''

      if (query.includes('company') || query.includes('companies')) {
        const { data: companies } = await supabase
          .from('companies')
          .select('*')
          .eq('org_id', userData.org_id)
          .limit(10)
        
        contextData = `Companies in your database:\n${JSON.stringify(companies, null, 2)}\n\n`
      }

      if (query.includes('person') || query.includes('people') || query.includes('resume')) {
        const { data: people } = await supabase
          .from('people')
          .select('*')
          .eq('org_id', userData.org_id)
          .limit(10)
        
        contextData += `People in your database:\n${JSON.stringify(people, null, 2)}\n\n`
      }

      if (query.includes('project') || query.includes('projects')) {
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('org_id', userData.org_id)
          .limit(10)
        
        contextData += `Projects in your database:\n${JSON.stringify(projects, null, 2)}\n\n`
      }

      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: contextData,
          orgId: userData.org_id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const examplePrompts = [
    "Draft a 200-word bio for Maya Alvarez",
    "What companies do we have in our database?",
    "Generate a project summary for our recent work",
    "Help me write a proposal section about our team",
    "What are our key specialties and capabilities?"
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Chat Assistant</h1>
        <p className="text-slate-600">Get AI-powered help with your RFP knowledge base</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example Prompts</CardTitle>
              <CardDescription>
                Try these to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => setInput(prompt)}
                >
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Start a conversation with your AI assistant</p>
                    <p className="text-sm">Ask about your data, generate content, or get help with RFPs</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-slate-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-slate-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your RFP knowledge base..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
