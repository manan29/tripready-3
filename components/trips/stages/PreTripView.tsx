'use client'

import { useState } from 'react'
import { BentoCard } from '@/components/ui/BentoCard'
import { AlertCircle } from 'lucide-react'
import { PRE_TRIP_STEPS, getTripDayInfo, isPeakSeason, getFlightBookingAdvice } from '@/lib/trip-stages'

interface PreTripViewProps {
  trip: any
  stageData: any
  onUpdateStageData: (data: any) => void
  onOpenStep: (stepId: string) => void
}

export function PreTripView({ trip, stageData, onUpdateStageData, onOpenStep }: PreTripViewProps) {
  const dayInfo = getTripDayInfo(trip.start_date, trip.end_date)
  const completedSteps = stageData?.pre_trip?.completed_steps || []
  const daysUntil = dayInfo.stage === 'pre-trip' ? dayInfo.daysUntil : 0

  // Check if peak season
  const tripStartDate = new Date(trip.start_date)
  const isPeak = isPeakSeason(trip.destination, tripStartDate.getMonth())

  // Flight booking advice
  const flightAdvice = getFlightBookingAdvice(daysUntil, isPeak)

  const progressPercentage = (completedSteps.length / PRE_TRIP_STEPS.length) * 100

  return (
    <div className="space-y-4 pb-4">
      {/* Progress Header */}
      <BentoCard size="medium">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-[#1E293B] text-lg">Trip Preparation</h3>
          <span className="text-[#9333EA] font-bold text-sm">
            {completedSteps.length}/{PRE_TRIP_STEPS.length} Done
          </span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[#9333EA] to-[#A855F7] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-[#64748B] text-sm">
          {daysUntil === 0 ? (
            'Your trip starts today! 🎉'
          ) : daysUntil === 1 ? (
            'Your trip starts tomorrow! 🎊'
          ) : (
            <>
              {daysUntil} days until {trip.destination} ✈️
            </>
          )}
        </p>
      </BentoCard>

      {/* Peak Season Warning */}
      {isPeak && daysUntil > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[16px] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Peak Season Alert</h4>
              <p className="text-amber-800 text-sm mt-1">
                {trip.destination} is in peak season during your travel dates. Book flights & hotels early for best prices!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flight Booking Timing Advice */}
      {!completedSteps.includes('flights') && daysUntil > 0 && (
        <div
          className={`border-2 rounded-[16px] p-4 ${
            flightAdvice.color === 'red'
              ? 'bg-red-50 border-red-200'
              : flightAdvice.color === 'amber'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{flightAdvice.icon}</span>
            <div>
              <h4
                className={`font-semibold text-sm ${
                  flightAdvice.color === 'red'
                    ? 'text-red-900'
                    : flightAdvice.color === 'amber'
                    ? 'text-amber-900'
                    : 'text-green-900'
                }`}
              >
                Flight Booking: {flightAdvice.title}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  flightAdvice.color === 'red'
                    ? 'text-red-800'
                    : flightAdvice.color === 'amber'
                    ? 'text-amber-800'
                    : 'text-green-800'
                }`}
              >
                {flightAdvice.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps - Parallel Access */}
      <div className="space-y-3">
        {PRE_TRIP_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id)

          return (
            <BentoCard key={step.id} size="medium">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => onOpenStep(step.id)}
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1E293B] text-sm">{step.title}</h4>
                    <p className="text-[#64748B] text-xs mt-0.5">{step.description}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newCompletedSteps = isCompleted
                      ? completedSteps.filter((s: string) => s !== step.id)
                      : [...completedSteps, step.id]

                    onUpdateStageData({
                      ...stageData,
                      pre_trip: {
                        ...stageData?.pre_trip,
                        completed_steps: newCompletedSteps,
                      },
                    })
                  }}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    isCompleted
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#F3E8FF] text-[#9333EA] hover:bg-[#9333EA] hover:text-white'
                  }`}
                >
                  {isCompleted ? '✓ Done' : 'Mark Done'}
                </button>
              </div>
            </BentoCard>
          )
        })}
      </div>

      {/* Completion Message */}
      {completedSteps.length === PRE_TRIP_STEPS.length && (
        <div className="bg-gradient-to-r from-[#9333EA] to-[#A855F7] text-white rounded-[20px] p-6 text-center shadow-[0_4px_20px_rgba(147,51,234,0.3)]">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-bold text-xl mb-1">All Set!</h3>
          <p className="text-white/90 text-sm">
            You're fully prepared for your trip to {trip.destination}. Have an amazing journey!
          </p>
        </div>
      )}
    </div>
  )
}
