'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, FolderKanban, Layers, BookOpen, Archive, ArrowRight, CheckCircle2 } from 'lucide-react'

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to PARA Autopilot',
    description: 'Your AI-powered productivity system',
    content: (
      <div className="space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-heading font-bold">Let's get you organized!</h2>
          <p className="text-muted-foreground leading-relaxed">
            PARA Autopilot uses AI to help you organize everything in your life using the proven PARA method:
            <strong> Projects</strong>, <strong>Areas</strong>, <strong>Resources</strong>, and <strong>Archives</strong>.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Understanding PARA',
    description: 'The four categories that organize your life',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass border-l-4 border-para-project">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-para-project/10 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-para-project" />
                </div>
                <CardTitle className="text-lg">Projects</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Short-term efforts with clear goals and deadlines. Examples: "Launch website", "Plan vacation"
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-l-4 border-para-area">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-para-area/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-para-area" />
                </div>
                <CardTitle className="text-lg">Areas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ongoing responsibilities to maintain. Examples: "Health", "Finances", "Career development"
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-l-4 border-para-resource">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-para-resource/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-para-resource" />
                </div>
                <CardTitle className="text-lg">Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Topics of interest and reference materials. Examples: "Recipes", "Design inspiration", "Articles to read"
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-l-4 border-para-archive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-para-archive/10 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-para-archive" />
                </div>
                <CardTitle className="text-lg">Archives</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Inactive items from other categories. Keep for reference without cluttering your workspace.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    title: 'AI-Powered Features',
    description: 'Let AI do the heavy lifting',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-para-project/10 to-para-area/10">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-1">Smart Classification</h3>
              <p className="text-sm text-muted-foreground">
                AI automatically categorizes your items into Projects, Areas, Resources, or Archives
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-para-area/10 to-para-resource/10">
            <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-1">Auto-Schedule</h3>
              <p className="text-sm text-muted-foreground">
                AI schedules your tasks across the week based on priority, duration, and your calendar
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-para-resource/10 to-para-archive/10">
            <div className="w-10 h-10 rounded-xl gradient-warning flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-1">Weekly Review</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-generated insights on your productivity, wins, and what to focus on next week
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'You\'re All Set!',
    description: 'Start organizing your life',
    content: (
      <div className="space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-para-project to-para-area flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-heading font-bold">Ready to get started!</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your PARA workspace is ready. Start by adding your first project or letting AI help you organize existing items.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-para-project/10 to-para-area/10">
              <Sparkles className="w-5 h-5 text-para-project" />
              <span className="font-medium">Your productivity journey starts now!</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  function handleNext() {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/dashboard')
    }
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-para-project/10 via-para-area/10 to-para-resource/10">
      <div className="w-full max-w-3xl animate-fadeIn">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <Card className="glass shadow-project">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-heading">{step.title}</CardTitle>
            <CardDescription className="text-base">{step.description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] flex flex-col justify-between">
            <div className="py-8">
              {step.content}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="rounded-2xl"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="rounded-2xl gap-2"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
