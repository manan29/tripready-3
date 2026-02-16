'use client'

import { ReactNode } from 'react'

interface IconCircleProps {
  icon: ReactNode
  color?: 'purple' | 'lavender' | 'plum' | 'grape' | 'green' | 'blue' | 'orange' | 'pink'
  size?: 'sm' | 'md' | 'lg'
}

const colorMap = {
  purple: 'bg-purple-500',
  lavender: 'bg-[#B8A5D4]',
  plum: 'bg-[#9B8ABF]',
  grape: 'bg-[#7B6A9F]',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function IconCircle({ icon, color = 'lavender', size = 'md' }: IconCircleProps) {
  return (
    <div className={`${colorMap[color]} ${sizeMap[size]} rounded-full flex items-center justify-center text-white`}>
      <span className={iconSizeMap[size]}>{icon}</span>
    </div>
  )
}
