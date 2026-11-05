// Event start as a local Date from { date: 'YYYY-MM-DD', time: '05:00 PM IST' | '17:00' }. No time → 09:00.
export function eventStart({ date, time = '' }) {
  const m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(time)
  let h = 9
  let min = 0
  if (m) {
    h = m[3] ? (+m[1] % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0) : +m[1]
    min = +m[2]
  }
  return new Date(`${date}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`)
}
