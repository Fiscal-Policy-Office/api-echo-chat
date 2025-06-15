import * as React from 'react';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ProjectSidebar from './ProjectSidebar';
import ChatAnalytics from './ChatAnalytics';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface ChatResponse {
  id: string;
  content: string;
  model: string;
  timestamp: Date;
  rating?: number;
}

interface ChatMessage {
  id: string;
  user: string;
  responses: ChatResponse[];
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

const MultiChatInterface = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('chat-projects', []);
  const [currentProjectId, setCurrentProjectId] = useLocalStorage<string | null>('current-project', null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const { toast } = useToast();

  // Mock LLM models for demonstration
  const models = ['GPT-4', 'Claude-3', 'Gemini-Pro'];

  const currentProject = projects.find(p => p.id === currentProjectId);
  const messages = currentProject?.messages || [];

  // Analytics calculations
  const analytics = useMemo(() => {
    const allMessages = projects.flatMap(p => p.messages);
    const allResponses = allMessages.flatMap(m => m.responses);
    
    const modelStats = models.map(model => {
      const modelResponses = allResponses.filter(r => r.model === model);
      const ratedResponses = modelResponses.filter(r => r.rating);
      const totalRating = ratedResponses.reduce((sum, r) => sum + (r.rating || 0), 0);
      
      return {
        model,
        count: modelResponses.length,
        avgRating: ratedResponses.length > 0 ? totalRating / ratedResponses.length : 0,
        totalRating
      };
    });

    const topRatedResponses = allResponses
      .filter(r => r.rating && r.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map(r => ({
        model: r.model,
        rating: r.rating!,
        content: r.content,
        timestamp: r.timestamp
      }));

    return {
      totalMessages: allMessages.length,
      totalResponses: allResponses.length,
      modelStats,
      topRatedResponses
    };
  }, [projects]);

  const generateMockResponse = (message: string, model: string): string => {
    const responses = {
      'GPT-4': `GPT-4 response to "${message}": This is a comprehensive analysis of your question. I'll break it down systematically and provide detailed insights based on my training data.`,
      'Claude-3': `Claude-3 response to "${message}": I appreciate your question. Let me provide a thoughtful and nuanced perspective on this topic, considering multiple viewpoints.`,
      'Gemini-Pro': `Gemini-Pro response to "${message}": Here's my take on your query. I'll combine factual information with creative problem-solving to give you a well-rounded answer.`
    };
    return responses[model as keyof typeof responses] || `Response from ${model}`;
  };

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    
    toast({
      title: "สร้างโปรเจคสำเร็จ",
      description: `โปรเจค "${name}" ถูกสร้างแล้ว`
    });
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Create default project if none exists
    let projectId = currentProjectId;
    if (!projectId) {
      const defaultProject: Project = {
        id: 'default',
        name: 'General Chat',
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      setProjects(prev => [...prev, defaultProject]);
      projectId = 'default';
      setCurrentProjectId(projectId);
    }

    setIsLoading(true);
    
    const responses: ChatResponse[] = await Promise.all(
      models.map(async (model, index) => {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return {
          id: `${Date.now()}-${index}`,
          content: generateMockResponse(inputMessage, model),
          model,
          timestamp: new Date()
        };
      })
    );

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: inputMessage,
      responses,
      timestamp: new Date()
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            messages: [...project.messages, newMessage],
            lastUpdated: new Date()
          }
        : project
    ));

    setInputMessage('');
    setIsLoading(false);
  };

  const handleRateResponse = (messageId: string, responseId: string, rating: number) => {
    if (!currentProjectId) return;

    setProjects(prev => prev.map(project => 
      project.id === currentProjectId
        ? {
            ...project,
            messages: project.messages.map(message => 
              message.id === messageId 
                ? {
                    ...message,
                    responses: message.responses.map(response =>
                      response.id === responseId ? { ...response, rating } : response
                    )
                  }
                : message
            ),
            lastUpdated: new Date()
          }
        : project
    ));
  };

  const handleCopyResponse = async (content: string, responseId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(responseId);
      toast({
        title: "คัดลอกแล้ว",
        description: "คัดลอกข้อความไปยังคลิปบอร์ดแล้ว",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกข้อความได้",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      projects,
      exportDate: new Date().toISOString(),
      analytics
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "ส่งออกข้อมูลสำเร็จ",
      description: "ไฟล์ถูกบันทึกแล้ว"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    if (currentProjectId === projectId) {
      setCurrentProjectId(updatedProjects[0]?.id || null);
    }
    
    toast({
      title: "Project deleted",
      description: "The project has been successfully deleted.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4 py-2">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 p-4">
              <MessageList
                messages={messages}
                onRatingChange={handleRateResponse}
                onCopy={handleCopyResponse}
                copiedId={copiedId}
                searchQuery={searchQuery}
              />
              <MessageInput
                value={inputMessage}
                onChange={setInputMessage}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                models={models}
                onKeyPress={handleKeyPress}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="p-4">
              <ChatAnalytics {...analytics} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Responsive Sidebar */}
        <SidebarInset className="w-[300px] border-l bg-background">
          <div className="p-4 h-full">
            <ProjectSidebar
              projects={projects}
              currentProjectId={currentProjectId}
              onCreateProject={handleCreateProject}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
            />
          </div>
        </SidebarInset>

        {/* Sidebar Toggle Button */}
        <SidebarTrigger asChild>
          <button className="fixed right-4 top-4 z-50 rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </SidebarTrigger>
      </div>
    </SidebarProvider>
  );
};

export default MultiChatInterface;
