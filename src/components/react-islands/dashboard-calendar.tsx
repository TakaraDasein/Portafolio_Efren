"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useDashboard } from "../../data/dashboard-store"
import { X, Plus } from "lucide-react"
import { categoryConfig } from "./dashboard-routines"

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const hours = Array.from({ length: 14 }, (_, i) => i + 7)

export default function DashboardCalendar() {
  const { data, addCalendarEvent, deleteCalendarEvent } = useDashboard()
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventColor, setNewEventColor] = useState("#ffffff")

  const colorOptions = ["#ffffff", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#262626"]

  const handleSlotClick = (day: number, hour: number) => {
    const existing = data.calendarEvents.find((e) => e.day === day && e.hour === hour)
    if (existing) return
    setSelectedSlot({ day, hour })
    setNewEventTitle("")
  }

  const handleAddEvent = () => {
    if (newEventTitle.trim() && selectedSlot) {
      addCalendarEvent({
        day: selectedSlot.day,
        hour: selectedSlot.hour,
        title: newEventTitle.trim(),
        color: newEventColor,
      })
      setSelectedSlot(null)
      setNewEventTitle("")
    }
  }

  const getEventForSlot = (day: number, hour: number) => {
    return data.calendarEvents.find((e) => e.day === day && e.hour === hour)
  }

  // weekDays column 0 = Lunes, but Routine.daysOfWeek follows JS getDay() (0 = Domingo)
  const getRoutineForSlot = (dayIndex: number, hour: number) => {
    const jsDay = (dayIndex + 1) % 7
    return data.routines.find(
      (r) => !r.paused && r.hour === hour && r.daysOfWeek.includes(jsDay),
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="font-sans text-4xl font-light tracking-tight">
          <span className="italic text-white">Calendario</span> Semanal
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
          {data.calendarEvents.length} eventos programados
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="border border-white/10 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-px bg-white/5">
              <div className="bg-background p-4 border-b border-white/10">
                <span className="font-mono text-xs text-muted-foreground">HORA</span>
              </div>
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-background p-4 border-b border-white/10 text-center"
                >
                  <span className="font-mono text-xs text-muted-foreground">{day}</span>
                </div>
              ))}

              {hours.map((hour) => (
                <div key={`row-${hour}`} style={{ display: "contents" }}>
                  <div className="bg-background p-4 border-r border-white/10">
                    <span className="font-mono text-xs text-muted-foreground">{hour}:00</span>
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const event = getEventForSlot(dayIndex, hour)
                    const routine = !event ? getRoutineForSlot(dayIndex, hour) : undefined
                    const RoutineIcon = routine ? categoryConfig[routine.category].icon : null
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        onClick={() => handleSlotClick(dayIndex, hour)}
                        className="bg-background p-2 border-r border-white/10 min-h-[60px] hover:bg-white/5 transition-colors cursor-pointer relative group"
                      >
                        {event ? (
                          <div
                            className="h-full border-l-2 px-2 py-1 relative"
                            style={{
                              backgroundColor: event.color + "20",
                              borderColor: event.color,
                            }}
                          >
                            <p className="font-mono text-[10px]" style={{ color: event.color }}>
                              {event.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteCalendarEvent(event.id)
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white hover:text-gray-300" />
                            </button>
                          </div>
                        ) : routine && RoutineIcon ? (
                          <div className="h-full border-l-2 border-dashed border-white/20 px-2 py-1 flex items-center gap-1.5">
                            <RoutineIcon
                              className={`w-3 h-3 shrink-0 ${categoryConfig[routine.category].color}`}
                            />
                            <p className="font-mono text-[9px] text-muted-foreground truncate">
                              {routine.name}
                            </p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-white/50" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Color legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-l-2 border-dashed border-white/20" />
          <span className="font-mono text-[10px] text-muted-foreground">
            Rutina programada
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
          Eventos por color:
        </span>
        {colorOptions.map((color) => {
          const count = data.calendarEvents.filter((e) => e.color === color).length
          return (
            <div key={color} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>

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
            className="bg-background border border-white p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-sans text-2xl font-light mb-6">
              Nuevo <span className="italic text-white">Evento</span>
            </h3>

            <div className="mb-6">
              <p className="font-mono text-xs text-muted-foreground mb-2">
                {weekDays[selectedSlot.day]} • {selectedSlot.hour}:00
              </p>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                placeholder="Título del evento..."
                autoFocus
                className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewEventColor(color)}
                    className={`w-8 h-8 rounded-sm border-2 transition-all ${
                      newEventColor === color
                        ? "border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle.trim()}
                className="flex-1 px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}
