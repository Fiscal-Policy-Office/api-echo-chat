
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, Check } from 'lucide-react';

interface ChatResponse {
  id: string;
  content: string;
  model: string;
  timestamp: Date;
  rating?: number;
}

interface ResponseCardProps {
  response: ChatResponse;
  messageId: string;
  copiedId: string | null;
  onRateResponse: (messageId: string, responseId: string, rating: number) => void;
  onCopyResponse: (content: string, responseId: string) => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  messageId,
  copiedId,
  onRateResponse,
  onCopyResponse
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge>{response.model}</Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyResponse(response.content, response.id)}
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
                onClick={() => onRateResponse(messageId, response.id, rating)}
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
  );
};

export default ResponseCard;
