
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Send, RefreshCw, Star, Copy, Check, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ProjectSidebar from './ProjectSidebar';
import ChatAnalytics from './ChatAnalytics';

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

  // Filter messages based on search query
  const filteredMessages = messages.filter(message =>
    message.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.responses.some(response => 
      response.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ProjectSidebar
          projects={projects.map(p => ({
            id: p.id,
            name: p.name,
            messageCount: p.messages.length,
            avgRating: p.messages.length > 0 
              ? p.messages.flatMap(m => m.responses)
                  .filter(r => r.rating)
                  .reduce((sum, r, _, arr) => sum + (r.rating || 0) / arr.length, 0)
              : 0,
            lastUpdated: p.lastUpdated
          }))}
          currentProject={currentProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onExportData={handleExportData}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <div className="flex items-center gap-2 p-4 border-b">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">
                Multi-LLM Chat System
              </h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-4 pt-4">
                <TabsList>
                  <TabsTrigger value="chat">แชท</TabsTrigger>
                  <TabsTrigger value="analytics">สถิติ</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4 space-y-4">
                {/* Input Section */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="พิมพ์คำถามของคุณที่นี่..."
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !inputMessage.trim()}
                        className="px-6"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages Section */}
                <div className="flex-1 overflow-auto space-y-6">
                  {filteredMessages.map((message) => (
                    <Card key={message.id} className="w-full">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          <div className="flex items-center justify-between">
                            <span>คำถาม: {message.user}</span>
                            <Badge variant="outline">
                              {message.timestamp.toLocaleTimeString('th-TH')}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* ... keep existing code (Tabs and responses rendering) */}
                        <Tabs defaultValue="0" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            {message.responses.map((response, index) => (
                              <TabsTrigger key={response.id} value={index.toString()}>
                                <div className="flex items-center gap-2">
                                  {response.model}
                                  {response.rating && (
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < response.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {message.responses.map((response, index) => (
                            <TabsContent key={response.id} value={index.toString()}>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <Badge>{response.model}</Badge>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleCopyResponse(response.content, response.id)}
                                        >
                                          {copiedId === response.id ? (
                                            <Check className="h-4 w-4" />
                                          ) : (
                                            <Copy className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {response.content}
                                    </p>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">ให้คะแนน:</span>
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <Button
                                          key={rating}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRateResponse(message.id, response.id, rating)}
                                        >
                                          <Star
                                            className={`h-4 w-4 ${
                                              response.rating && rating <= response.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredMessages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchQuery ? 'ไม่พบผลการค้นหา' : 'เริ่มสนทนาโดยพิมพ์คำถามของคุณด้านบน'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="flex-1 p-4">
                <ChatAnalytics {...analytics} />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MultiChatInterface;
