"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Calendar, Brain, Zap, CheckCircle2, ArrowRight } from "lucide-react"

export default function BetaLandingPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beta/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'landing_page'
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        console.error('Failed to submit beta signup')
        // Still show success for UX (could improve with error handling)
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting beta signup:', error)
      // Still show success for UX (could improve with error handling)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-para-project/5 via-para-area/5 to-para-resource/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-para-project/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-para-area/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-para-project/10 border border-para-project/20 mb-8">
            <Sparkles className="w-4 h-4 text-para-project" />
            <span className="text-sm font-medium text-para-project">
              Beta Access - Limited Spots Available
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-para-project via-para-area to-para-resource bg-clip-text text-transparent">
            PARA Autopilot
          </h1>

          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 mb-4 font-semibold">
            AI-Powered Productivity on Autopilot
          </p>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12">
            Stop manually organizing your life. Let AI auto-classify your projects,
            schedule your tasks, and generate weekly insights—all using the proven PARA method.
          </p>

          {/* CTA Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700
                           focus:border-para-project focus:ring-4 focus:ring-para-project/20
                           transition-all duration-300"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="px-8 py-4 h-auto"
                >
                  {loading ? "Joining..." : "Join Beta"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                🎉 First 50 beta users get <strong>lifetime free access</strong>
              </p>
            </form>
          ) : (
            <Card className="max-w-md mx-auto p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
              <p className="text-slate-600 dark:text-slate-400">
                We'll email you when your beta access is ready.
                Check your inbox in the next 48 hours.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          What Makes PARA Autopilot Special?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <Card className="p-8 hover:shadow-project transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-para-project/10 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-para-project" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Auto-Classification</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Add anything—AI instantly categorizes it into Projects, Areas, Resources, or Archives.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-8 hover:shadow-area transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-para-area/10 flex items-center justify-center mb-6">
              <Calendar className="w-7 h-7 text-para-area" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Auto-Scheduling</h3>
            <p className="text-slate-600 dark:text-slate-400">
              AI schedules tasks across your week, avoiding conflicts and respecting your energy levels.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-8 hover:shadow-resource transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-para-resource/10 flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-para-resource" />
            </div>
            <h3 className="text-xl font-bold mb-3">Weekly AI Reviews</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Every Monday, get an AI-generated review with insights, wins, and focus areas.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-8 hover:shadow-archive transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-para-archive/10 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-para-archive" />
            </div>
            <h3 className="text-xl font-bold mb-3">Natural Language</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Just say "Schedule meeting prep Thursday 2pm"—AI understands and creates tasks.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Three Steps to Productivity Autopilot
          </h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Add Your Stuff</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Import from Notion, Todoist, or start fresh. Add projects, tasks, resources—whatever's on your mind.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Let AI Organize</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Click "Auto-Classify" and watch AI sort everything into the right PARA categories. Then click "Auto-Schedule" for optimal task timing.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Review & Improve</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Get weekly AI reviews with personalized insights: "You're most productive Tuesday mornings" or "This task keeps rolling over—let's break it down."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Simple, Transparent Pricing
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Beta */}
          <Card className="p-8 border-4 border-para-project relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 bg-para-project text-white text-sm font-bold rounded-full">
              BETA
            </div>
            <h3 className="text-3xl font-bold mb-2">Beta Access</h3>
            <div className="text-5xl font-bold mb-6">
              Free
              <span className="text-xl text-slate-500"> forever*</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Unlimited PARA items</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>AI classification & scheduling</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Weekly AI reviews</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Lifetime grandfathered pricing</span>
              </li>
            </ul>
            <p className="text-sm text-slate-500">
              *First 50 users get free lifetime access
            </p>
          </Card>

          {/* Standard */}
          <Card className="p-8">
            <h3 className="text-3xl font-bold mb-2">Standard</h3>
            <div className="text-5xl font-bold mb-6">
              $12
              <span className="text-xl text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Everything in Beta</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Calendar integrations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Notion/Todoist sync</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Advanced insights</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Mobile apps</span>
              </li>
            </ul>
            <p className="text-sm text-slate-500">
              Available after beta period
            </p>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-para-project to-para-area py-24 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Put Your Productivity on Autopilot?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join 50 beta users getting lifetime free access to PARA Autopilot
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-white/30 bg-white/10
                           placeholder-white/70 text-white
                           focus:border-white focus:ring-4 focus:ring-white/30
                           transition-all duration-300"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="px-8 py-4 h-auto bg-white text-para-project hover:bg-slate-100"
                >
                  {loading ? "Joining..." : "Join Beta"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Welcome to the beta!</h3>
              <p className="opacity-90">
                Check your email for next steps.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2025 PARA Autopilot. Powered by Claude Haiku 4.5.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Built with the PARA method by Tiago Forte
          </p>
        </div>
      </footer>
    </div>
  )
}
