import React from 'react'

export default function Status({ a }) {
  return (
    <div className="flex space-x-2">
        {/* Accept button only if pending */}
        {a.status === status && (
            <button
            onClick={() => updateStatus(a._id, "accepted")}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
            Accept
            </button>
        )}
        <button
            onClick={() => updateStatus(a._id, "rescheduled")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
            Reschedule
        </button>
        <button
            onClick={() => updateStatus(a._id, "declined")}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
            Decline
        </button>
    </div>
  )
}
