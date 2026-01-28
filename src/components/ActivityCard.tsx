'use client'

import { Activity, BookingMethod } from '@/types/activity'
import { MapPin, Clock, DollarSign, MapPinIcon, ExternalLink, Users } from 'lucide-react'
import Link from 'next/link'
import { TransportCallout } from './TransportCallout'

interface ActivityCardProps {
  activity: Activity
  time?: 'morning' | 'afternoon' | 'evening' | 'night'
  showTime?: boolean
  compact?: boolean
  onAddToPlan?: (activity: Activity) => void
}

export function ActivityCard({
  activity,
  time,
  showTime = true,
  compact = false,
  onAddToPlan
}: ActivityCardProps) {
  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault()
    if (activity.booking_method === 'CHECKFRONT' && activity.booking_url) {
      window.open(activity.booking_url, '_blank')
    } else if (activity.booking_method === 'EXTERNAL_URL' && activity.booking_url) {
      window.open(activity.booking_url, '_blank')
    }
  }

  const timeDisplay = time ? time.charAt(0).toUpperCase() + time.slice(1) : null

  if (compact) {
    return (
      <div className="p-3 bg-arctic-800 border border-arctic-700 rounded-lg hover:border-aurora-green/50 transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-white truncate">{activity.name}</h4>
            {activity.is_family_friendly && (
              <p className="text-xs text-aurora-green mt-1">👨‍👩‍👧‍👦 Family friendly</p>
            )}
          </div>
          {showTime && timeDisplay && (
            <span className="text-xs text-aurora-cyan whitespace-nowrap">{timeDisplay}</span>
          )}
        </div>
        {activity.transport_info && <TransportCallout transport={activity.transport_info} compact />}
      </div>
    )
  }

  return (
    <div className="bg-arctic-800 border border-arctic-700 rounded-lg overflow-hidden hover:border-aurora-green/50 transition">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-arctic-700">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-lg text-white">{activity.name}</h3>
            <p className="text-sm text-aurora-cyan capitalize mt-1">{activity.category.replace('_', ' ')}</p>
          </div>
          {showTime && timeDisplay && (
            <span className="px-3 py-1 bg-aurora-purple/20 text-aurora-purple text-xs font-semibold rounded">
              {timeDisplay}
            </span>
          )}
        </div>

        {/* Family friendly badge */}
        {activity.is_family_friendly && (
          <div className="flex items-center gap-1 text-aurora-green text-xs font-semibold mt-2">
            <Users size={14} />
            Family friendly
            {activity.min_age && (
              <span className="ml-1 text-arctic-300">({activity.min_age}+)</span>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="text-sm text-arctic-100 leading-relaxed mb-4">{activity.description}</p>

        {/* Transport Section */}
        {activity.transport_info && (
          <div className="mb-4 pb-4 border-b border-arctic-700">
            <TransportCallout transport={activity.transport_info} />
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {activity.duration_minutes && (
            <div className="flex items-center gap-2 text-arctic-300">
              <Clock size={16} className="text-aurora-cyan" />
              <span>{activity.duration_minutes} min</span>
            </div>
          )}

          {activity.estimated_cost_nok && (
            <div className="flex items-center gap-2 text-arctic-300">
              <DollarSign size={16} className="text-aurora-green" />
              <span>{activity.estimated_cost_nok} NOK</span>
            </div>
          )}

          {activity.address && (
            <div className="flex items-center gap-2 text-arctic-300 col-span-2">
              <MapPin size={16} className="text-aurora-cyan flex-shrink-0" />
              <span className="truncate text-xs">{activity.address}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {activity.features && activity.features.length > 0 && (
          <div className="mb-4 pb-4 border-b border-arctic-700">
            <div className="flex flex-wrap gap-2">
              {activity.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-arctic-700 text-xs text-aurora-cyan rounded"
                >
                  {feature}
                </span>
              ))}
              {activity.features.length > 3 && (
                <span className="px-2 py-1 bg-arctic-700 text-xs text-arctic-300">
                  +{activity.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* DNA Tags */}
        {activity.dna_tags && activity.dna_tags.length > 0 && (
          <div className="mb-4 pb-4 border-b border-arctic-700">
            <p className="text-xs text-arctic-400 mb-2">Tromsø character:</p>
            <div className="flex flex-wrap gap-1">
              {activity.dna_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-aurora-purple/10 text-aurora-purple text-xs rounded"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        {activity.opening_hours && (
          <div className="mb-4 pb-4 border-b border-arctic-700">
            <p className="text-xs text-arctic-400 mb-2">Hours:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-arctic-300">
              {Object.entries(activity.opening_hours).slice(0, 4).map(([day, hours]) => (
                <div key={day}>
                  <span className="capitalize text-arctic-400">{day.slice(0, 3)}:</span>
                  <span className="ml-2">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {activity.booking_method === 'CHECKFRONT' || activity.booking_method === 'EXTERNAL_URL' ? (
            <button
              onClick={handleBooking}
              className="flex-1 bg-aurora-green hover:bg-aurora-green/90 text-arctic-900 font-semibold py-2 px-4 rounded transition"
            >
              Book Now
              <ExternalLink className="inline ml-2" size={16} />
            </button>
          ) : activity.booking_method === 'DROP_IN' ? (
            <div className="flex-1 bg-aurora-cyan/20 text-aurora-cyan font-semibold py-2 px-4 rounded text-center text-sm">
              Walk-in available
            </div>
          ) : null}

          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(activity)}
              className="flex-1 bg-aurora-purple/20 hover:bg-aurora-purple/30 text-aurora-purple font-semibold py-2 px-4 rounded transition"
            >
              Add to Plan
            </button>
          )}
        </div>

        {/* Website Link */}
        {activity.website && (
          <Link
            href={activity.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-center text-xs text-aurora-cyan hover:text-aurora-cyan/80 transition"
          >
            Visit website →
          </Link>
        )}
      </div>
    </div>
  )
}
