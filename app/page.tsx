"use client"

import { useState } from "react"
import { Calendar } from "@/components/calendar"
import { EventSidebar } from "@/components/event-sidebar"
import { NotesSidebar } from "@/components/notes-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Event, Note } from "@/lib/types"

export default function CalendarApp() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const eventsStorageKey = "calendar-events"
  const notesStorageKey = "calendar-notes"
  const [events, setEvents] = useLocalStorage<Event[]>(eventsStorageKey, [])
  const [notes, setNotes] = useLocalStorage<Note[]>(notesStorageKey, [])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [isMobileNotesOpen, setIsMobileNotesOpen] = useState(false)
  const [isMobileEventsOpen, setIsMobileEventsOpen] = useState(false)

  const addEvent = (event: Event) => {
    setEvents([...events, event])
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const addNote = (note: Note) => {
    setNotes([...notes, note])
  }

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
  }

  const removeNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNote?.id === id) {
      setActiveNote(null)
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Notes Sidebar */}
        <div
          className={`${isMobileNotesOpen ? "fixed inset-0 z-50 bg-background" : "hidden md:block"} w-64 border-r border-border`}
        >
          <NotesSidebar
            notes={notes}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            addNote={addNote}
            updateNote={updateNote}
            removeNote={removeNote}
            onClose={() => setIsMobileNotesOpen(false)}
          />
        </div>

        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Calendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            addEvent={addEvent}
            toggleNotesSidebar={() => setIsMobileNotesOpen(!isMobileNotesOpen)}
            toggleEventsSidebar={() => setIsMobileEventsOpen(!isMobileEventsOpen)}
          />
        </div>

        {/* Events Sidebar */}
        <div
          className={`${isMobileEventsOpen ? "fixed inset-0 z-50 bg-background" : "hidden md:block"} w-72 border-l border-border`}
        >
          <EventSidebar
            events={events}
            selectedDate={selectedDate}
            removeEvent={removeEvent}
            addEvent={addEvent}
            onClose={() => setIsMobileEventsOpen(false)}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}
