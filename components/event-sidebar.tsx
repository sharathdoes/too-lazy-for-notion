"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Edit, Trash, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Event } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface EventSidebarProps {
  events: Event[]
  selectedDate: Date
  removeEvent: (id: string) => void
  onClose: () => void
  addEvent: (event: Event) => void
}

export function EventSidebar({ events, selectedDate, removeEvent, onClose, addEvent }: EventSidebarProps) {
  const [filter, setFilter] = useState<"all" | "date">("date")
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: "",
    time: "",
    description: "",
  })

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd")

  const filteredEvents = events.filter((event) => {
    if (filter === "date") {
      return event.date === selectedDateStr
    }
    return true
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    // Sort by date first
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateA < dateB) return -1
    if (dateA > dateB) return 1

    // Then by time if available
    if (a.time && b.time) {
      return a.time.localeCompare(b.time)
    }

    return 0
  })

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      time: event.time || "",
      description: event.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingEvent || eventForm.title.trim() === "") return

    const updatedEvent: Event = {
      ...editingEvent,
      title: eventForm.title,
      time: eventForm.time,
      description: eventForm.description,
    }

    // Remove the old event and add the updated one
    removeEvent(editingEvent.id)
    addEvent(updatedEvent)

    setIsEditDialogOpen(false)
    setEditingEvent(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={filter === "date" ? "bg-secondary" : ""}
            onClick={() => setFilter("date")}
          >
            Selected Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={filter === "all" ? "bg-secondary" : ""}
            onClick={() => setFilter("all")}
          >
            All Events
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filter === "date" ? `No events for ${format(selectedDate, "MMMM d, yyyy")}` : "No events scheduled"}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{event.title}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEvent(event.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                  {format(parseISO(event.date), "MMMM d, yyyy")}
                  {event.time && ` • ${event.time}`}
                </div>

                {event.description && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-sm">{event.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Event description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
