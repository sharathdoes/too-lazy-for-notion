"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Plus, Save, Trash, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Note } from "@/lib/types"
import { cn } from "@/lib/utils"

interface NotesSidebarProps {
  notes: Note[]
  activeNote: Note | null
  setActiveNote: (note: Note | null) => void
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  removeNote: (id: string) => void
  onClose: () => void
}

export function NotesSidebar({
  notes,
  activeNote,
  setActiveNote,
  addNote,
  updateNote,
  removeNote,
  onClose,
}: NotesSidebarProps) {
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setActiveNote(null)
        setIsEditing(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setActiveNote])

  const handleAddNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
    }

    addNote(newNote)
    setActiveNote(newNote)
    setEditedTitle(newNote.title)
    setEditedContent(newNote.content)
    setIsEditing(true)
  }

  const handleSelectNote = (note: Note) => {
    setActiveNote(note)
    setEditedTitle(note.title)
    setEditedContent(note.content)
    setIsEditing(false)
  }

  const handleSaveNote = () => {
    if (!activeNote) return

    const updatedNote: Note = {
      ...activeNote,
      title: editedTitle,
      content: editedContent,
      updatedAt: new Date().toISOString(),
    }

    updateNote(updatedNote)
    setIsEditing(false)
  }

  const handleDeleteNote = () => {
    if (!activeNote) return
    removeNote(activeNote.id)
  }

  return (
    <div
      ref={sidebarRef}
      className="flex flex-col h-full w-[260px] overflow-hidden min-w-0 max-w-full"
      style={{ maxWidth: 260 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold truncate">Notes</h2>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={handleAddNote}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden min-w-0">
        <ScrollArea className="flex-1 border-b border-border min-w-0">
          <div className="p-2 space-y-1">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No notes yet</div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "p-2 rounded cursor-pointer hover:bg-secondary/50",
                    activeNote?.id === note.id && "bg-secondary",
                  )}
                  onClick={() => handleSelectNote(note)}
                  style={{ wordBreak: "break-word" }}
                >
                  <div className="font-medium truncate">{note.title}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(note.createdAt), "MMM d, yyyy")}</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {activeNote && (
          <div className="p-4 flex-1 flex flex-col overflow-hidden min-w-0">
            {isEditing ? (
              <>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mb-2"
                  placeholder="Note title"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                />
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 resize-none"
                  placeholder="Write your note here..."
                  style={{ minWidth: 0, maxWidth: "100%" }}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNote}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-medium text-lg mb-2 truncate" style={{ minWidth: 0, maxWidth: "100%" }}>
                  {activeNote.title}
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  {format(new Date(activeNote.createdAt), "MMMM d, yyyy")}
                </div>
                <div
                  className="flex-1 whitespace-pre-wrap overflow-y-auto"
                  style={{ minWidth: 0, maxWidth: "100%", wordBreak: "break-word" }}
                >
                  {activeNote.content || <span className="text-muted-foreground">No content</span>}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteNote}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
