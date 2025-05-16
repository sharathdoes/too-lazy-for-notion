export interface Event {
  id: string
  title: string
  date: string
  time?: string
  description?: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
}
