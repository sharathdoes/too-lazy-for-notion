"use client"

import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthSelectorProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
}

export function MonthSelector({ currentMonth, setCurrentMonth }: MonthSelectorProps) {
  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(Number.parseInt(value))
    setCurrentMonth(newDate)
  }

  return (
    <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 12 }).map((_, i) => {
          const date = new Date(2024, i, 1)
          return (
            <SelectItem key={i} value={i.toString()}>
              {format(date, "MMMM")}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
