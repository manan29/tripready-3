'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Check, Lock, AlertCircle, ChevronRight } from 'lucide-react'
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
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-lg">Trip Preparation</h3>
          <span className="text-purple-600 font-bold text-sm">
            {completedSteps.length}/{PRE_TRIP_STEPS.length} Done
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-gray-500 text-sm">
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
      </GlassCard>

      {/* Peak Season Warning */}
      {isPeak && daysUntil > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
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
          className={`border-2 rounded-xl p-4 ${
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

      {/* Workflow Steps */}
      <div className="space-y-3">
        {PRE_TRIP_STEPS.map((step) => {
          const status = getStepStatus(step.id, completedSteps, daysUntil)
          const isLocked = status === 'locked'
          const isCompleted = status === 'completed'
          const isInProgress = status === 'in-progress'

          return (
            <GlassCard
              key={step.id}
              onClick={() => !isLocked && onOpenStep(step.id)}
              className={`cursor-pointer transition-all ${
                isCompleted
                  ? 'bg-green-50 border-2 border-green-200'
                  : isInProgress
                  ? 'border-2 border-purple-500 shadow-md'
                  : isLocked
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-100'
                      : isInProgress
                      ? 'bg-purple-100'
                      : isLocked
                      ? 'bg-gray-100'
                      : 'bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{step.title}</h3>
                    {isInProgress && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{step.description}</p>
                  {isLocked && step.id === 'last-minute' && (
                    <p className="text-gray-400 text-xs mt-1">Unlocks 7 days before trip</p>
                  )}
                </div>

                {/* Arrow */}
                {!isLocked && (
                  <ChevronRight
                    className={`w-5 h-5 flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}
                  />
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Completion Message */}
      {completedSteps.length === PRE_TRIP_STEPS.length && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 text-center">
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
