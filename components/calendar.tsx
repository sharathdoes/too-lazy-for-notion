"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, Menu, CalendarDays, Plus, Search, Calendar as CalendarIcon, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Event } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CalendarHeader } from "@/components/calendar-header"
import { MonthSelector } from "@/components/month-selector"
import { MiniCalendar } from "@/components/mini-calendar"

interface CalendarProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  events: Event[]
  addEvent: (event: Event) => void
  toggleNotesSidebar: () => void
  toggleEventsSidebar: () => void
}

export function Calendar({
  selectedDate,
  setSelectedDate,
  events,
  addEvent,
  toggleNotesSidebar,
  toggleEventsSidebar,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()))
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    description: "",
  })
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isMiniCalendarOpen, setIsMiniCalendarOpen] = useState(false)

  // Help dialog state and "Don't ask again" logic
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [dontAskAgain, setDontAskAgain] = useState(false)

  // On mount, check localStorage for "dontAskAgain" flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dontAsk = localStorage.getItem("calendarHelpDontAskAgain")
      if (dontAsk === "true") {
        setDontAskAgain(true)
        setIsHelpOpen(false)
      } else {
        setIsHelpOpen(true)
      }
    }
  }, [])

  // When user checks "Don't ask again", persist to localStorage and block dialog
  const handleDontAskAgainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setDontAskAgain(checked)
    if (checked) {
      localStorage.setItem("calendarHelpDontAskAgain", "true")
      setIsHelpOpen(false)
    } else {
      localStorage.removeItem("calendarHelpDontAskAgain")
    }
  }

  // If blocked, prevent opening help dialog
  const handleOpenHelp = () => {
    if (!dontAskAgain) {
      setIsHelpOpen(true)
    }
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(startOfMonth(new Date()))
    setSelectedDate(new Date())
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  // Get the start of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart)
  // Get the end of the week containing the last day of the month  
  const calendarEnd = endOfWeek(monthEnd)
  // Get all days between start and end
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handleAddEvent = () => {
    if (newEvent.title.trim() === "") return

    const event: Event = {
      id: crypto.randomUUID(),
      title: newEvent.title,
      time: newEvent.time,
      description: newEvent.description,
      date: format(selectedDate, "yyyy-MM-dd"),
      completed: false,
    }

    addEvent(event)
    setNewEvent({ title: "", time: "", description: "" })
    setIsAddEventOpen(false)
  }

  const hasEventOnDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return events.some((event) => event.date === dateString)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleNotesSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthSelector currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
          <Button variant="outline" onClick={() => setIsMiniCalendarOpen(true)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-[200px] pl-8" />
          </div> */}
          <Button variant="ghost" size="icon" onClick={toggleEventsSidebar} className="md:hidden">
            <CalendarDays className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* <div className="hidden md:block w-48 border-r border-border p-2">
          <MiniCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div> */}

        <div className="flex-1">
          <CalendarHeader />
          <div className="grid grid-cols-7 h-[calc(100%-2rem)]">
            {daysInMonth.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate)
              const hasEvent = hasEventOnDate(day)

              return (
                <div
                  key={i}
                  className={cn(
                    "border border-border min-h-[100px] p-2 relative",
                    !isSameMonth(day, currentMonth) && "bg-muted/20 text-muted-foreground",
                  )}
                  onClick={() => {
                    setSelectedDate(day)
                    // Only toggle sidebar on mobile
                    if (window.innerWidth < 768) {
                      toggleEventsSidebar()
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setSelectedDate(day)
                    setIsAddEventOpen(true)
                  }}
                >
                  <div
                    className={cn(
                      "flex justify-center items-center w-8 h-8 rounded-full",
                      isSelected && "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  {hasEvent && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="h-1 w-1 rounded-full bg-primary mx-auto"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Button
        className="absolute bottom-4 right-4 rounded-full h-12 w-12 shadow-lg md:hidden"
        onClick={() => setIsAddEventOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Button
        className="absolute bottom-20 right-4 rounded-full h-12 w-12 shadow-lg bg-red-500 hover:bg-red-600 text-white"
        onClick={handleOpenHelp}
        disabled={dontAskAgain}
        title={dontAskAgain ? "Help dialog is blocked (Don't ask again)" : undefined}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddEvent}>Add Event</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMiniCalendarOpen} onOpenChange={setIsMiniCalendarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
          </DialogHeader>
          <div className="hidden md:block border-r border-border p-2">
            <MiniCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How it works</DialogTitle>
            <DialogDescription>
              Learn how to use the calendar effectively
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>To add a new event, right-click on any day in the calendar.</p>
            <div className="flex items-center mt-4">
              <input
                id="dont-ask-again"
                type="checkbox"
                checked={dontAskAgain}
                onChange={handleDontAskAgainChange}
                className="mr-2"
              />
              <label htmlFor="dont-ask-again" className="text-sm select-none cursor-pointer">
                Don't show again
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
