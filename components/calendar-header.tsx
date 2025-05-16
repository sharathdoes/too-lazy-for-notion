export function CalendarHeader() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="grid grid-cols-7 border-b border-border">
      {days.map((day) => (
        <div key={day} className="py-2 text-center font-medium text-sm">
          {day}
        </div>
      ))}
    </div>
  )
}
