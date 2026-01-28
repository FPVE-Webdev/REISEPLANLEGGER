'use client'

import { Activity } from '@/types/activity'
import { ActivityCard } from './ActivityCard'
import { Cloud, Sun, Moon, DollarSign } from 'lucide-react'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

interface ActivityByTime {
  morning: Activity[]
  afternoon: Activity[]
  evening: Activity[]
  night: Activity[]
}

interface DailyItineraryProps {
  activities: Activity[]
  date?: Date
  totalBudget?: number
  weatherIcon?: 'sun' | 'cloud' | 'snow'
  weatherDescription?: string
  onAddToPlan?: (activity: Activity) => void
  onRemoveActivity?: (activityId: string) => void
}

export function DailyItinerary({
  activities,
  date = new Date(),
  totalBudget,
  weatherIcon,
  weatherDescription,
  onAddToPlan,
  onRemoveActivity
}: DailyItineraryProps) {
  // Group activities by time of day
  const groupedActivities: ActivityByTime = {
    morning: [],
    afternoon: [],
    evening: [],
    night: []
  }

  activities.forEach((activity) => {
    // Try to extract time from activity or use simple logic
    const timeOfDay = (activity as any).timeOfDay || 'afternoon'
    if (groupedActivities[timeOfDay as TimeOfDay]) {
      groupedActivities[timeOfDay as TimeOfDay].push(activity)
    } else {
      groupedActivities.afternoon.push(activity)
    }
  })

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getWeatherIcon = () => {
    switch (weatherIcon) {
      case 'sun':
        return <Sun className="text-yellow-400" size={24} />
      case 'snow':
        return <Cloud className="text-blue-200" size={24} />
      case 'cloud':
      default:
        return <Cloud className="text-gray-400" size={24} />
    }
  }

  const calculateCost = () => {
    return activities.reduce((sum, a) => sum + (a.estimated_cost_nok || 0), 0)
  }

  const dayColor: Record<TimeOfDay, string> = {
    morning: 'aurora-cyan',
    afternoon: 'aurora-green',
    evening: 'aurora-purple',
    night: 'aurora-pink'
  }

  const dayEmoji: Record<TimeOfDay, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌅',
    night: '🌙'
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-arctic-700">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{formatDate(date)}</h2>
            <p className="text-sm text-arctic-300 mt-1">Your daily adventure awaits</p>
          </div>
          <div className="text-right">
            {weatherIcon && (
              <div className="mb-2 flex items-center justify-end gap-2">
                {getWeatherIcon()}
                {weatherDescription && (
                  <span className="text-sm text-arctic-300">{weatherDescription}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Budget Summary */}
        {activities.length > 0 && (
          <div className="flex items-center gap-3 bg-arctic-800 rounded-lg p-4 w-fit">
            <DollarSign size={20} className="text-aurora-green" />
            <div>
              <p className="text-xs text-arctic-400">Estimated daily cost</p>
              <p className="text-lg font-bold text-aurora-green">
                {totalBudget ? totalBudget : calculateCost()} NOK
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time-grouped Activities */}
      {activities.length === 0 ? (
        <div className="text-center py-12 px-4 bg-arctic-800/50 rounded-lg border border-arctic-700">
          <Moon className="mx-auto mb-3 text-arctic-500" size={32} />
          <h3 className="text-arctic-300 font-semibold mb-2">No activities planned yet</h3>
          <p className="text-sm text-arctic-400">
            Start building your itinerary by adding activities below
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.keys(groupedActivities) as TimeOfDay[]).map((time) => {
            const timeActivities = groupedActivities[time]

            if (timeActivities.length === 0) {
              return null
            }

            return (
              <div key={time}>
                {/* Time Section Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-arctic-700">
                  <span className="text-2xl">{dayEmoji[time]}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">{time}</h3>
                    <p className="text-xs text-arctic-400">
                      {timeActivities.length} activit{timeActivities.length > 1 ? 'ies' : 'y'}
                    </p>
                  </div>
                </div>

                {/* Activities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {timeActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative"
                    >
                      <ActivityCard
                        activity={activity}
                        time={time}
                        onAddToPlan={onAddToPlan}
                      />
                      {onRemoveActivity && (
                        <button
                          onClick={() => onRemoveActivity(activity.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition"
                          title="Remove from itinerary"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer - Quick actions */}
      {activities.length > 0 && (
        <div className="mt-8 pt-6 border-t border-arctic-700 flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-aurora-green/20 hover:bg-aurora-green/30 text-aurora-green rounded font-semibold transition text-sm">
            Share Itinerary
          </button>
          <button className="px-4 py-2 bg-aurora-purple/20 hover:bg-aurora-purple/30 text-aurora-purple rounded font-semibold transition text-sm">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-aurora-cyan/20 hover:bg-aurora-cyan/30 text-aurora-cyan rounded font-semibold transition text-sm">
            Adjust Plan
          </button>
        </div>
      )}
    </div>
  )
}
