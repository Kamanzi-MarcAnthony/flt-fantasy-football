import { DateTime } from 'luxon'

export const MATCHDAY_TIMEZONE = 'Africa/Kampala'

const DAY_MAP = {
  Sunday: 7,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

const getMatchdaySchedule = (matchDay, matchTime) => {
  const targetWeekday = DAY_MAP[matchDay]

  if (!targetWeekday) {
    throw new Error('Invalid match day')
  }

  const [hour, minute] = matchTime.split(':').map(Number)

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error('Invalid match time')
  }

  const now = DateTime.now().setZone(MATCHDAY_TIMEZONE)

  /*
   * Determine which calendar occurrence we're dealing with.
   *
   * If today is before the configured match day,
   * use this week's match day.
   *
   * If today is the match day, use today.
   *
   * If today is after the match day, use next week's.
   */
  let daysUntil = targetWeekday - now.weekday

  if (daysUntil < 0) {
    daysUntil += 7
  }

  const matchDate = now
    .plus({ days: daysUntil })
    .startOf('day')
    .set({
      hour,
      minute,
      second: 0,
      millisecond: 0,
    })

  /*
   * Midnight immediately after the match day.
   */
  const closeDate = matchDate
    .startOf('day')
    .plus({ days: 1 })

const transferOpenDate = matchDate
  .startOf('day')
  .minus({ days: 6 })

const transferCloseDate = matchDate.minus({ hours: 4 })

return {
  now,
  matchDate,
  closeDate,
  transferOpenDate,
  transferCloseDate,
}
}

export const getMatchdayStatus = (matchDay, matchTime) => {
  const {
    now,
    matchDate,
    closeDate,
    transferOpenDate,
    transferCloseDate,
  } = getMatchdaySchedule(matchDay, matchTime)

  let status = 'UPCOMING'

  if (now >= matchDate && now < closeDate) {
    status = 'ACTIVE'
  }

  let transferStatus = 'OPEN'

if (now >= transferCloseDate && now < closeDate) {
  transferStatus = 'CLOSED'
}

  /*
   * If we're past today's scheduled matchday,
   * calculate the next occurrence.
   *
   * Example:
   * Friday 11:59 PM → ACTIVE
   * Saturday 12:00 AM → next Friday UPCOMING
   *
   * The schedule returned by getMatchdaySchedule on Saturday
   * will already point to the following Friday.
   */

  return {
    status,
    transferStatus,
    now,
    matchDate,
    closeDate,
    transferOpenDate,
    transferCloseDate,
  }
}

export const getMatchdayDate = (matchDay, matchTime) => {
  return getMatchdayStatus(matchDay, matchTime)
}

export const isMatchdayActive = (matchDay, matchTime) => {
  const { status } = getMatchdayStatus(
    matchDay,
    matchTime,
  )

  return status === 'ACTIVE'
}