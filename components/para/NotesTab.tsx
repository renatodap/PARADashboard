'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { paraAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react'
import type { PARANote } from '@/types'

interface NotesTabProps {
  itemId: string
  notes: PARANote[]
  onNotesChange: () => void
}

export function NotesTab({ itemId, notes, onNotesChange }: NotesTabProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      showToast.error('Note content is required')
      return
    }

    try {
      await paraAPI.createNote(itemId, newNoteContent)
      setNewNoteContent('')
      setIsAdding(false)
      onNotesChange()
      showToast.success('Note added!')
    } catch (error) {
      showToast.error('Failed to add note')
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) {
      showToast.error('Note content is required')
      return
    }

    try {
      await paraAPI.updateNote(itemId, noteId, editContent)
      setEditingId(null)
      setEditContent('')
      onNotesChange()
      showToast.success('Note updated!')
    } catch (error) {
      showToast.error('Failed to update note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return

    try {
      await paraAPI.deleteNote(itemId, noteId)
      onNotesChange()
      showToast.success('Note deleted')
    } catch (error) {
      showToast.error('Failed to delete note')
    }
  }

  const startEdit = (note: PARANote) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button/Form */}
      {!isAdding ? (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full rounded-2xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      ) : (
        <Card className="glass p-4">
          <div className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note here... (Markdown supported)"
              rows={6}
              autoFocus
              className="w-full glass rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-para-project/50 resize-none font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} className="rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false)
                  setNewNoteContent('')
                }}
                variant="ghost"
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: You can use **bold**, *italic*, and other Markdown formatting
            </p>
          </div>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              {editingId === note.id ? (
                <Card className="glass p-4">
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      autoFocus
                      className="w-full glass rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-para-project/50 resize-none font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateNote(note.id)}
                        className="rounded-xl"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null)
                          setEditContent('')
                        }}
                        variant="ghost"
                        className="rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="glass p-4 hover:bg-white/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm">
                          {note.content}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {new Date(note.created_at).toLocaleString()}
                        {note.updated_at !== note.created_at && (
                          <span className="ml-2">(edited)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => startEdit(note)}
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-muted-foreground hover:text-para-project"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {notes.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No notes yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Add Note" to start documenting
          </p>
        </div>
      )}
    </div>
  )
}
