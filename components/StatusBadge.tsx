type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offered' | 'Rejected'

const statusStyles: Record<ApplicationStatus, string> = {
  Applied: 'bg-emerald-500/20 text-emerald-400',
  Interviewing: 'bg-blue-500/20 text-blue-400',
  Offered: 'bg-amber-500/20 text-amber-400',
  Rejected: 'bg-rose-500/20 text-rose-400'
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[status]}`}>
      {status}
    </span>
  )
} 