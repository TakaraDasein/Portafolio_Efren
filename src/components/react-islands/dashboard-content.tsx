"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Calendar, X, Plus } from "lucide-react"

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM - 8 PM

interface Event {
  id: string
  day: number
  hour: number
  title: string
  color: string
}

export default function DashboardContent() {
  const [events, setEvents] = useState<Event[]>([
    { id: "1", day: 0, hour: 9, title: "Daily Standup", color: "#39cbe3" },
    { id: "2", day: 2, hour: 14, title: "Client Meeting", color: "#ef4444" },
  ])
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null)
  const [newEventTitle, setNewEventTitle] = useState("")

  const handleSlotClick = (day: number, hour: number) => {
    setSelectedSlot({ day, hour })
    setNewEventTitle("")
  }

 const handleAddEvent = () => {
    if (newEventTitle.trim() && selectedSlot) {
      const newEvent: Event = {
        id: Date.now().toString(),
        day: selectedSlot.day,
        hour: selectedSlot.hour,
        title: newEventTitle.trim(),
        color: "#39cbe3"
      }
      setEvents([...events, newEvent])
      setSelectedSlot(null)
      setNewEventTitle("")
    }
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
  }

  const getEventForSlot = (day: number, hour: number) => {
    return events.find(e => e.day === day && e.hour === hour)
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center border-b border-white/10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <Calendar className="w-12 h-12 text-cyan-500" />
          </motion.div>

          <h1 className="font-sans text-4xl md:text-6xl font-light tracking-tight mb-4">
            <span className="italic text-cyan-500">Calendario</span>
          </h1>
        </motion.div>

        <a href="/"
          className="absolute top-8 left-8 md:left-12 font-mono text-xs tracking-wider text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          VOLVER
        </a>
      </section>

      {/* Calendar Section */}
      <section className="py-24 px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Calendar Grid */}
          <div className="border border-white/10 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-px bg-white/5">
                {/* Header */}
                <div className="bg-background p-4 border-b border-white/10">
                  <span className="font-mono text-xs text-muted-foreground">HORA</span>
                </div>
                {weekDays.map((day) => (
                  <div key={day} className="bg-background p-4 border-b border-white/10 text-center">
                    <span className="font-mono text-xs text-muted-foreground">{day}</span>
                  </div>
                ))}

                {/* Time Slots */}
                {hours.map((hour) => (
                  <>
                    <div key={`hour-${hour}`} className="bg-background p-4 border-r border-white/10">
                      <span className="font-mono text-xs text-muted-foreground">{hour}:00</span>
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const event = getEventForSlot(dayIndex, hour)
                      return (
                        <div
                          key={`${day}-${hour}`}
                          onClick={() => !event && handleSlotClick(dayIndex, hour)}
                          className="bg-background p-2 border-r border-white/10 min-h-[60px] hover:bg-cyan-500/5 transition-colors cursor-pointer relative group"
                        >
                          {event ? (
                            <div 
                              className="h-full border-l-2 px-2 py-1 relative"
                              style={{ 
                                backgroundColor: event.color + '20',
                                borderColor: event.color
                              }}
                            >
                              <p className="font-mono text-[10px]" style={{ color: event.color }}>
                                {event.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteEvent(event.id)
                                }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-red-500 hover:text-red-400" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-4 h-4 text-cyan-500/50" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Add Event Modal */}
      {selectedSlot !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedSlot(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background border border-cyan-500 p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-sans text-2xl font-light mb-6">
              Nuevo <span className="italic text-cyan-500">Evento</span>
            </h3>
            
            <div className="mb-6">
              <p className="font-mono text-xs text-muted-foreground mb-2">
                {weekDays[selectedSlot.day]} • {selectedSlot.hour}:00
              </p>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
                placeholder="Título del evento..."
                autoFocus
                className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle.trim()}
                className="flex-1 px-6 py-3 bg-cyan-500 text-black font-mono text-xs tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                AGREGAR
              </button>
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-6 py-3 border border-white/20 font-mono text-xs tracking-wider hover:border-white/50 transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
