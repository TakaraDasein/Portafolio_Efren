import {
  Dumbbell,
  Brain,
  Users,
  Briefcase,
  Palette,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"
import type { Routine } from "../../data/dashboard-store"

/** Config compartida por Rutinas, Calendario e Insights. */
export const categoryConfig: Record<
  Routine["category"],
  { icon: LucideIcon; label: string; color: string }
> = {
  physical: { icon: Dumbbell, label: "Físico", color: "text-white" },
  mental: { icon: Brain, label: "Mental", color: "text-white" },
  social: { icon: Users, label: "Social", color: "text-white" },
  work: { icon: Briefcase, label: "Trabajo", color: "text-white" },
  creative: { icon: Palette, label: "Creativo", color: "text-white" },
  other: { icon: HelpCircle, label: "Otro", color: "text-muted-foreground" },
}

export const difficultyConfig: Record<
  Routine["difficulty"],
  { label: string; hint: string }
> = {
  easy: { label: "Ligera", hint: "Cuesta poco sostenerla" },
  medium: { label: "Media", hint: "Requiere algo de intención" },
  hard: { label: "Exigente", hint: "Cuesta, y por eso pesa más" },
}

export const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
