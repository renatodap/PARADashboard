'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Target, Layers, BookOpen,
  Check, ArrowRight, Zap, Brain, Calendar,
  Clock, TrendingUp, Shield, Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'

interface WaitlistResponse {
  success: boolean
  position: number
  referral_code: string
  message?: string
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [signupCount, setSignupCount] = useState(47)
  const [waitlistData, setWaitlistData] = useState<WaitlistResponse | null>(null)
  const [utmParams, setUtmParams] = useState<Record<string, string>>({})

  // Fetch current signup count on mount
  useEffect(() => {
    fetchSignupCount()
  }, [])

  // Extract UTM parameters from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const utm: Record<string, string> = {}

      if (params.get('utm_source')) utm.utm_source = params.get('utm_source')!
      if (params.get('utm_medium')) utm.utm_medium = params.get('utm_medium')!
      if (params.get('utm_campaign')) utm.utm_campaign = params.get('utm_campaign')!
      if (params.get('ref')) utm.referral_code = params.get('ref')!

      // Determine source from UTM or referrer
      if (!utm.utm_source && document.referrer) {
        if (document.referrer.includes('reddit.com')) utm.source = 'reddit_organic'
        else if (document.referrer.includes('facebook.com')) utm.source = 'facebook_organic'
        else utm.source = 'organic'
      } else if (utm.utm_source?.includes('reddit')) {
        utm.source = 'reddit_ad'
      } else if (utm.utm_source?.includes('facebook') || utm.utm_source?.includes('instagram')) {
        utm.source = 'facebook_ad'
      }

      setUtmParams(utm)
    }
  }, [])

  const fetchSignupCount = async () => {
    try {
      const response = await fetch('/api/waitlist')
      if (response.ok) {
        const data = await response.json()
        setSignupCount(data.total_signups || 47)
      }
    } catch (error) {
      console.error('Failed to fetch signup count:', error)
    }
  }

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...utmParams
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setWaitlistData(data)
        setSubmitted(true)
        setEmail('')
        // Refresh signup count
        fetchSignupCount()
        showToast.success('Welcome to the waitlist!')
      } else {
        showToast.error(data.error || 'Failed to join waitlist')
      }
    } catch (error) {
      console.error('Waitlist signup failed:', error)
      showToast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyReferralLink = () => {
    if (waitlistData?.referral_code) {
      const link = `${window.location.origin}/landing?ref=${waitlistData.referral_code}`
      navigator.clipboard.writeText(link)
      showToast.success('Referral link copied!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-para-project/5 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-para-project/10 via-transparent to-para-area/10" />

        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-para-project/10 border border-para-project/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-para-project" />
              <span className="text-sm font-medium text-para-project">
                Built for ADHD brains
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Stop Fighting Your Brain.
              <br />
              <span className="bg-gradient-to-r from-para-project to-para-area bg-clip-text text-transparent">
                Let AI Organize Everything.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              PARA Autopilot auto-categorizes your life so you never manually file again.
              Built for ADHD brains that can't stick with manual systems.
            </p>

            {/* Waitlist Form */}
            {!submitted ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleWaitlistSignup}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-2xl bg-background border-2 border-border focus:border-para-project focus:outline-none text-lg"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-para-project to-para-area text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 rounded-2xl p-8 max-w-lg mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                  You're on the list!
                </p>
                <p className="text-lg text-green-600 dark:text-green-400 mb-6">
                  You're <span className="font-bold">#{waitlistData?.position}</span> in line
                </p>

                {/* Referral Section */}
                <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                    🎁 Want to skip the line?
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                    Refer 3 friends and get immediate access
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/landing?ref=${waitlistData?.referral_code}`}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-black/30 border border-green-300 rounded-lg font-mono"
                    />
                    <Button
                      onClick={copyReferralLink}
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-green-600 dark:text-green-400">
                  Check your email for next steps!
                </p>
              </motion.div>
            )}

            {/* Social Proof */}
            <p className="text-sm text-muted-foreground">
              Join <span className="font-semibold text-para-project">{signupCount}</span> people on the waitlist
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
              You've tried PARA.
              <br />
              <span className="text-muted-foreground">You gave up in 2 weeks.</span>
            </h2>
            <p className="text-xl text-center text-muted-foreground mb-16">
              Here's why everyone gives up on manual PARA:
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pain Point 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-3xl p-8 border-2 border-border hover:border-para-project/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  Manual Filing is Exhausting
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every capture requires a decision: "Is this a Project or an Area?"
                  By day 5, decision fatigue kills your system.
                </p>
              </motion.div>

              {/* Pain Point 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-3xl p-8 border-2 border-border hover:border-para-project/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  Maintenance is Relentless
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Weekly reviews take 30 minutes. Skip one week → system decays.
                  You can't keep up when life gets busy.
                </p>
              </motion.div>

              {/* Pain Point 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-3xl p-8 border-2 border-border hover:border-para-project/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  Your Brain Doesn't Cooperate
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  ADHD brains can't persist with manual organization.
                  It's not laziness. It's working memory deficits.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-b from-para-project/5 to-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
              What if your productivity system
              <br />
              <span className="bg-gradient-to-r from-para-project to-para-area bg-clip-text text-transparent">
                maintained itself?
              </span>
            </h2>
            <p className="text-xl text-center text-muted-foreground mb-16">
              PARA Autopilot uses AI to do what your brain can't
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-3xl p-8 border-2 border-para-project/20 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-para-project to-para-area flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  Auto-Categorization
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  AI sorts every task, note, and file into Projects/Areas/Resources/Archives.
                </p>
                <p className="text-para-project font-semibold">
                  Zero manual filing. Zero decisions.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-3xl p-8 border-2 border-para-area/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  AI Insights
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Analyzes 30 days of patterns: "You're most productive Tuesday mornings."
                </p>
                <p className="text-para-area font-semibold">
                  Proactive alerts before problems arise.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-3xl p-8 border-2 border-para-resource/20 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-para-resource to-para-archive flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  Zero Maintenance
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Weekly reviews auto-generate. Stale items auto-archive.
                </p>
                <p className="text-para-resource font-semibold">
                  The system maintains itself while you work.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
              How It Works
            </h2>

            <div className="space-y-16">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-3">
                    Capture Anything
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Press ⌘K. Type "Finish Q4 report by Friday."
                    AI extracts the task, deadline, and priority automatically.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-para-area to-para-resource flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-3">
                    AI Sorts Everything
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Classifies as Project. Links to existing work. Suggests next actions.
                    No manual filing required.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-para-resource to-para-archive flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-3">
                    Stay Organized
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Weekly reviews auto-generate. AI surfaces what needs attention.
                    Your system maintains itself.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-para-project/5 to-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
              Early Access Pricing
            </h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-10 border-2 border-para-project shadow-[0_0_50px_rgba(124,58,237,0.2)]"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-para-project/10 border border-para-project/20 mb-4">
                  <Sparkles className="w-4 h-4 text-para-project" />
                  <span className="text-sm font-medium text-para-project">
                    Limited to first 100 users
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-5xl font-bold">$10</span>
                  <span className="text-2xl text-muted-foreground">/month</span>
                </div>

                <p className="text-lg text-para-project font-semibold mb-2">
                  50% off forever
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  Regular price: $20/month
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Unlimited captures',
                  'AI auto-categorization',
                  'Weekly reviews',
                  'AI insights & alerts',
                  'Google Calendar sync',
                  'Cancel anytime'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-para-project to-para-area text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Join Waitlist for Early Access
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              {[
                {
                  q: "Is this just another todo app?",
                  a: "No. Todo apps make you manually organize. PARA Autopilot auto-categorizes everything using AI. You never manually file again."
                },
                {
                  q: "What if I already use Notion for PARA?",
                  a: "Great! This adds an AI layer on top. We integrate with Notion (coming soon) to auto-categorize your Notion pages."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. No commitment. Cancel with one click. We'll even refund your first month, no questions asked."
                },
                {
                  q: "Who is this for?",
                  a: "ADHD/neurodivergent professionals who've tried PARA and gave up. Time-starved executives who can't maintain manual systems. Anyone who captures but never organizes."
                },
                {
                  q: "How does the AI work?",
                  a: "We use Claude AI to analyze your captures and classify them into Projects/Areas/Resources/Archives. It learns from your patterns and gets smarter over time."
                }
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-border pb-8"
                >
                  <h3 className="text-xl font-heading font-bold mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-background to-para-project/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to stop fighting your brain?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join {signupCount} people getting early access
            </p>

            {!submitted ? (
              <form
                onSubmit={handleWaitlistSignup}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-2xl bg-background border-2 border-border focus:border-para-project focus:outline-none text-lg"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-para-project to-para-area text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Joining...' : 'Get Early Access'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-2xl p-6 max-w-md mx-auto">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  You're on the list!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Check your email for next steps.
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-6">
              Early access opens this Friday. Limited to 100 users. $10/month forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-sm">
              © 2025 PARA Autopilot. Built for humans with ADHD.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-para-project transition-colors">Privacy</a>
              <a href="#" className="hover:text-para-project transition-colors">Terms</a>
              <a href="#" className="hover:text-para-project transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
