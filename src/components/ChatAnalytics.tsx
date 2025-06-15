
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, MessageSquare, Award } from 'lucide-react';

interface AnalyticsProps {
  totalMessages: number;
  totalResponses: number;
  modelStats: Array<{
    model: string;
    count: number;
    avgRating: number;
    totalRating: number;
  }>;
  topRatedResponses: Array<{
    model: string;
    rating: number;
    content: string;
    timestamp: Date;
  }>;
}

const ChatAnalytics: React.FC<AnalyticsProps> = ({
  totalMessages,
  totalResponses,
  modelStats,
  topRatedResponses
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนคำถาม</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนคำตอบ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คะแนนเฉลี่ย</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelStats.length > 0 
                ? (modelStats.reduce((acc, stat) => acc + stat.avgRating, 0) / modelStats.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สถิติตาม LLM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modelStats.map((stat) => (
              <div key={stat.model} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Badge variant="outline">{stat.model}</Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.count} คำตอบ
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{stat.avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({stat.totalRating} คะแนน)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            คำตอบที่ได้คะแนนสูงสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRatedResponses.slice(0, 5).map((response, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge>{response.model}</Badge>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < response.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {response.content}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  {response.timestamp.toLocaleString('th-TH')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatAnalytics;
