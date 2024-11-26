import * as React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-[#1a1a1a] p-3 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
} 