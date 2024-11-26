import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import * as React from 'react'

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  progress?: number;
  metric?: string;
  subtitle: string;
  gradient: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  progress, 
  metric, 
  subtitle,
  gradient 
}: StatsCardProps) {
  return (
    <Card className="relative group overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className="absolute inset-[1px] bg-black rounded-lg" />
      <div className="relative">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
          <div className={`text-white bg-gradient-to-r ${gradient} p-2 rounded-lg`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          {progress !== undefined && (
            <div className="mt-2">
              <Progress 
                value={progress} 
                className="bg-[#1a1a1a]" 
                indicatorClassName={`bg-gradient-to-r ${gradient}`}
              />
            </div>
          )}
          {metric && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-400">{subtitle}</p>
              <p className={`text-sm font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {metric}
              </p>
            </div>
          )}
          {progress !== undefined && (
            <p className="text-xs text-gray-400 mt-2">
              {progress}% of monthly goal
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
} 