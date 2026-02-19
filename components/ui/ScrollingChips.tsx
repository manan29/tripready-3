'use client'

interface ScrollingChipsProps {
  chips: string[]
  onChipClick: (chip: string) => void
}

export function ScrollingChips({ chips, onChipClick }: ScrollingChipsProps) {
  // Double the chips for seamless loop
  const allChips = [...chips, ...chips]

  return (
    <div className="relative overflow-hidden py-3 -mx-5">
      <div className="flex gap-3 animate-marquee hover:animate-marquee-paused">
        {allChips.map((chip, index) => (
          <button
            key={`${chip}-${index}`}
            onClick={() => onChipClick(chip)}
            className="flex-shrink-0 px-4 py-2 bg-white/70 backdrop-blur-sm border border-purple-100 rounded-full text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-colors whitespace-nowrap shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
