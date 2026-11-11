import { eventStart } from './eventStart.js'

const day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Event to announce: the spotlight if it's still ahead, else the soonest one that hasn't passed today.
export function nextEvent(events, now = new Date()) {
  const upcoming = events
    .filter((e) => e?.date && day(eventStart(e)) >= day(now))
    .sort((a, b) => eventStart(a) - eventStart(b))
  return upcoming.find((e) => e.isSpotlight) || upcoming[0] || null
}

export function untilLabel(start, now = new Date()) {
  const days = Math.round((day(start) - day(now)) / 86400000)
  return days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`
}
