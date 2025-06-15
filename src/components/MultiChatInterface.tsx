
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, RefreshCw, Star, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const MultiChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock LLM models for demonstration
  const models = ['GPT-4', 'Claude-3', 'Gemini-Pro'];

  const generateMockResponse = (message: string, model: string): string => {
    const responses = {
      'GPT-4': `GPT-4 response to "${message}": This is a comprehensive analysis of your question. I'll break it down systematically and provide detailed insights based on my training data.`,
      'Claude-3': `Claude-3 response to "${message}": I appreciate your question. Let me provide a thoughtful and nuanced perspective on this topic, considering multiple viewpoints.`,
      'Gemini-Pro': `Gemini-Pro response to "${message}": Here's my take on your query. I'll combine factual information with creative problem-solving to give you a well-rounded answer.`
    };
    return responses[model as keyof typeof responses] || `Response from ${model}`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    
    // Simulate API calls to multiple LLM providers
    const responses: ChatResponse[] = await Promise.all(
      models.map(async (model, index) => {
        // Simulate network delay
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

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(false);
  };

  const handleRateResponse = (messageId: string, responseId: string, rating: number) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? {
            ...message,
            responses: message.responses.map(response =>
              response.id === responseId ? { ...response, rating } : response
            )
          }
        : message
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-LLM Chat System</h1>
        <p className="text-muted-foreground">เปรียบเทียบคำตอบจาก LLM หลายตัวในครั้งเดียว</p>
      </div>

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
      <div className="space-y-6">
        {messages.map((message) => (
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
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">เริ่มสนทนาโดยพิมพ์คำถามของคุณด้านบน</p>
        </div>
      )}
    </div>
  );
};

export default MultiChatInterface;
