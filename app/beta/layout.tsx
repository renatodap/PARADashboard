import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PARA Autopilot Beta - AI-Powered Productivity",
  description: "Join the beta for PARA Autopilot. Get lifetime free access as an early user. AI-powered task scheduling, auto-classification, and weekly insights using the PARA method.",
  keywords: ["PARA method", "productivity", "AI", "task management", "Claude", "automation"],
  openGraph: {
    title: "PARA Autopilot Beta - AI-Powered Productivity",
    description: "Join 50 beta users getting lifetime free access to AI-powered productivity",
    type: "website",
  },
}

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
