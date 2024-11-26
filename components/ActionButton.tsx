import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  className?: string;
}

export function ActionButton({ icon, onClick, tooltip, className }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "hover:bg-[#262626] transition-colors",
        className
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-4 w-4">{icon}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Button>
  );
} 