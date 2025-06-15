
import React from 'react';
import ChatMessage from './ChatMessage';

interface ChatResponse {
  id: string;
  content: string;
  model: string;
  timestamp: Date;
  rating?: number;
}

interface ChatMessageData {
  id: string;
  user: string;
  responses: ChatResponse[];
  timestamp: Date;
}

interface MessageListProps {
  messages: ChatMessageData[];
  searchQuery: string;
  copiedId: string | null;
  onRateResponse: (messageId: string, responseId: string, rating: number) => void;
  onCopyResponse: (content: string, responseId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  searchQuery,
  copiedId,
  onRateResponse,
  onCopyResponse
}) => {
  // Filter messages based on search query
  const filteredMessages = messages.filter(message =>
    message.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.responses.some(response => 
      response.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 overflow-auto space-y-6">
      {filteredMessages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          copiedId={copiedId}
          onRateResponse={onRateResponse}
          onCopyResponse={onCopyResponse}
        />
      ))}

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'ไม่พบผลการค้นหา' : 'เริ่มสนทนาโดยพิมพ์คำถามของคุณด้านบน'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
