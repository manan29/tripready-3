'use client'

import { FileText, Plane, CreditCard, Wallet } from 'lucide-react'

interface PlanTabProps {
  trip: any
  documentsCount?: number
  bookingsCount?: number
}

export function PlanTab({ trip, documentsCount = 0, bookingsCount = 0 }: PlanTabProps) {
  const cards = [
    {
      title: 'Documents',
      icon: <FileText className="w-8 h-8" />,
      count: documentsCount,
      label: 'items',
      color: 'bg-blue-50 text-blue-600',
      href: '#documents',
    },
    {
      title: 'Bookings',
      icon: <Plane className="w-8 h-8" />,
      count: bookingsCount,
      label: 'bookings',
      color: 'bg-orange-50 text-orange-600',
      href: '#bookings',
    },
    {
      title: 'Visa',
      icon: <CreditCard className="w-8 h-8" />,
      count: 0,
      label: 'pending',
      color: 'bg-green-50 text-green-600',
      href: '#visa',
    },
    {
      title: 'Budget',
      icon: <Wallet className="w-8 h-8" />,
      count: trip.total_budget || 0,
      label: 'budget',
      prefix: '₹',
      color: 'bg-purple-50 text-purple-600',
      href: '#budget',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 pb-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-lg mb-3">{card.title}</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">
                {card.prefix || ''}
                {card.count}
              </p>
              <p className="text-gray-400 text-sm">{card.label}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
