'use client'

import { useState } from 'react'
import { BentoCard } from '@/components/ui/BentoCard'
import { Timeline } from '@/components/ui/Timeline'
import { AlertCircle } from 'lucide-react'
import { PRE_TRIP_STEPS, getStepStatus, getTripDayInfo, isPeakSeason, getFlightBookingAdvice } from '@/lib/trip-stages'

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

      {/* Workflow Steps - Timeline */}
      <Timeline
        items={PRE_TRIP_STEPS.map((step) => {
          const status = getStepStatus(step.id, completedSteps, daysUntil)
          return {
            id: step.id,
            title: step.title,
            description:
              status === 'locked' && step.id === 'last-minute'
                ? 'Unlocks 7 days before trip'
                : step.description,
            status,
            icon: step.icon,
            onClick: () => onOpenStep(step.id),
          }
        })}
      />

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
