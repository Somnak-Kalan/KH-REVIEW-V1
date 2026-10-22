import React from 'react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

const CountdownTimer = ({ startDate, endDate, schedule, status, onExpired }) => {


    const scheduleLower = (schedule || '').toString().trim().toLowerCase()
    const isPublishImmediately = schedule?.type.trim().toLowerCase() === 'publishimmediately'


    const calculateTimeLeft = () => {
        const now = dayjs()

        //  if publish immediately and NO endDate => never expire
        const hasEndDate = !!endDate && dayjs(endDate).isValid()
        if (isPublishImmediately && !hasEndDate) {
            return { infinite: true } // means LIVE forever
        }

        const start = dayjs(startDate)
        const end = dayjs(endDate)

        // if still invalid (not immediate case)
        if (!start.isValid() || !end.isValid()) {
            return { expired: false, invalid: true }
        }

        if (now.isBefore(start)) {
            // Pending → before start
            const diffMs = start.diff(now)
            const d = dayjs.duration(diffMs)

            const totalSeconds = Math.max(0, Math.floor(d.asSeconds()))
            const days = Math.floor(totalSeconds / 86400)
            const hours = Math.floor((totalSeconds % 86400) / 3600)
            const minutes = Math.floor((totalSeconds % 3600) / 60)
            const seconds = totalSeconds % 60

            return {
                pending: true,
                days,
                hours,
                minutes,
                seconds,
            }
        } else if (now.isAfter(end) || now.isSame(end)) {
            // Already ended
            return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
        } else {
            // Ongoing → show remaining time until end
            const diffMs = end.diff(now)
            const d = dayjs.duration(diffMs)

            const totalSeconds = Math.max(0, Math.floor(d.asSeconds()))
            const days = Math.floor(totalSeconds / 86400)
            const hours = Math.floor((totalSeconds % 86400) / 3600)
            const minutes = Math.floor((totalSeconds % 3600) / 60)
            const seconds = totalSeconds % 60

            if (totalSeconds <= 0)
                return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }

            return { days, hours, minutes, seconds }
        }
    }

    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft())

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, [])
        return () => clearInterval(timer)
    }, [startDate, endDate, schedule])

    //  call onExpired only once (prevent spam)
    const firedRef = React.useRef(false)
    React.useEffect(() => {
        //  if infinite, never call onExpired

        if (timeLeft?.infinite) return

        if (timeLeft?.expired && !firedRef.current) {
            firedRef.current = true
            if (typeof onExpired === 'function') onExpired()
        }
    }, [timeLeft?.expired, timeLeft?.infinite, onExpired])

    //  publish immediately + no end date => show LIVE (no expiry)
    if (timeLeft?.infinite) {
        return <p className="text-xs text-green-600 font-semibold">Live</p>
    }

    // Pending state
    if (timeLeft?.pending) {
        return (
            <p className="text-xs text-yellow-600 font-semibold">
                Time Left : {timeLeft.days} days, {timeLeft.hours} hours,{' '}
                {timeLeft.minutes} minutes, {timeLeft.seconds} seconds
            </p>
        )
    }

    // Expired state
    if (timeLeft?.expired) {
        return <p className="text-xs text-red-600 font-semibold">Ended</p>
    }

    // Invalid but not expired (no endDate not immediate)
    if (timeLeft?.invalid) {
        return <p className="text-xs text-gray-500 font-semibold">-</p>
    }
    // Ongoing state
    return (
        <p className="text-xs text-green-600 font-semibold">
            {scheduleLower !== 'immediately' && scheduleLower !== 'publishimmediately' && (
                <>
                    Time Left: {timeLeft.days} days, {timeLeft.hours} hours,{' '}
                    {timeLeft.minutes} minutes, {timeLeft.seconds} seconds
                </>
            )}
            {(scheduleLower === 'immediately' || scheduleLower === 'publishimmediately') && (
                <>
                    Time Left: {timeLeft.days} days, {timeLeft.hours} hours,{' '}
                    {timeLeft.minutes} minutes, {timeLeft.seconds} seconds
                </>
            )}
        </p>
    )
}

export default CountdownTimer
