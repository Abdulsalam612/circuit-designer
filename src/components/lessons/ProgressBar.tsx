interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  // Tailwind background class for the filled part
  color?: string;
}

const ProgressBar = ({ value, max, className = "", color = "bg-[#2176FF]" }: ProgressBarProps) => {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
    </div>
  )
}

export default ProgressBar
