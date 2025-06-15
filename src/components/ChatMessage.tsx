
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import ResponseCard from './ResponseCard';

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

interface ChatMessageProps {
  message: ChatMessage;
  copiedId: string | null;
  onRateResponse: (messageId: string, responseId: string, rating: number) => void;
  onCopyResponse: (content: string, responseId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  copiedId,
  onRateResponse,
  onCopyResponse
}) => {
  return (
    <Card className="w-full">
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
              <ResponseCard
                response={response}
                messageId={message.id}
                copiedId={copiedId}
                onRateResponse={onRateResponse}
                onCopyResponse={onCopyResponse}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatMessage;
