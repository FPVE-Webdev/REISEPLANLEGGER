'use client';

import { cn } from '@/lib/utils';
import type { DayPlan } from '@/types/trip';

interface DayCardProps {
  day: DayPlan;
}

export function DayCard({ day }: DayCardProps) {
  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-arctic-800 rounded-2xl border border-arctic-700 overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-4 border-b border-arctic-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-primary">Day {day.day}</h3>
            <p className="text-sm text-foreground/80 capitalize">{formattedDate}</p>
          </div>
          {day.theme && (
            <div className="text-sm font-medium text-foreground/70 bg-arctic-700/50 px-3 py-1 rounded-full">
              {day.theme}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Activities Timeline */}
        <div className="space-y-4 mb-6">
          {day.activities.map((activity, index) => (
            <div key={index} className="flex gap-4">
              {/* Timeline Connector */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                {index < day.activities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent min-h-[60px]" />
                )}
              </div>

              {/* Activity Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="text-sm text-primary font-medium mb-1">{activity.time}</div>
                    <h4 className="font-semibold text-lg">{activity.title}</h4>
                  </div>
                  {activity.cost > 0 && (
                    <div className="text-sm font-medium text-primary whitespace-nowrap">
                      {activity.cost.toLocaleString('en-US')} NOK
                    </div>
                  )}
                </div>

                <p className="text-sm text-foreground/80 mb-3">{activity.description}</p>

                <div className="flex flex-wrap gap-3 text-sm">
                  {activity.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{activity.location}</span>
                    </div>
                  )}

                  {activity.duration && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{activity.duration}</span>
                    </div>
                  )}

                  {activity.bookingRequired && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Booking required</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dining */}
        {(day.dining.lunch || day.dining.dinner) && (
          <div className="border-t border-arctic-700 pt-4 mb-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              Food
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {day.dining.lunch && (
                <div className="bg-arctic-700/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Lunch</div>
                  <div className="font-medium">{day.dining.lunch}</div>
                </div>
              )}
              {day.dining.dinner && (
                <div className="bg-arctic-700/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Dinner</div>
                  <div className="font-medium">{day.dining.dinner}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aurora Info */}
        {day.aurora && day.aurora.probability > 40 && (
          <div className="border-t border-arctic-700 pt-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🌌</span>
                Aurora chance
              </h4>

              <div className="space-y-3">
                {/* Probability Meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Probability</span>
                    <span className="text-sm font-semibold text-primary">
                      {day.aurora.probability}%
                    </span>
                  </div>
                  <div className="w-full bg-arctic-700 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        day.aurora.probability >= 70
                          ? 'bg-green-500'
                          : day.aurora.probability >= 50
                          ? 'bg-primary'
                          : 'bg-yellow-500'
                      )}
                      style={{ width: `${day.aurora.probability}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Best time</div>
                    <div className="font-medium">{day.aurora.bestTime}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Recommended location</div>
                    <div className="font-medium">{day.aurora.location}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
