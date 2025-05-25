import { useState } from 'react'

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' }
] as const

export type DateRange = typeof DATE_RANGES[number]['value']

interface DateRangePickerProps {
  value: DateRange
  onChange: (value: DateRange) => void
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex space-x-2">
      {DATE_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            value === range.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
} 