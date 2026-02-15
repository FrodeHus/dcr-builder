import { useState } from 'react'
import { ArrowRight, Gauge, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [animate, setAnimate] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-12 text-center">
          {/* Logo/Title Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Data Collection Rule Builder
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate Azure Data Collection Rules (DCRs) from your JSON data.
              Fast, accurate, and built for modern Azure deployments.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Quick & Easy</h3>
                <p className="text-sm text-muted-foreground">
                  Paste your JSON and get a DCR in seconds. No complex
                  configuration needed.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Smart Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically infers column types and detects dates with
                  precision.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Gauge className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Full Control</h3>
                <p className="text-sm text-muted-foreground">
                  Edit schemas, destinations, and transformations with an
                  intuitive editor.
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-6 py-4">
            <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <h4 className="font-semibold">Paste JSON</h4>
                <p className="text-muted-foreground">
                  Paste your JSON sample directly or provide an API endpoint
                </p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <h4 className="font-semibold">Configure</h4>
                <p className="text-muted-foreground">
                  Refine the generated schema and set up your destinations
                </p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <h4 className="font-semibold">Deploy</h4>
                <p className="text-muted-foreground">
                  Copy the DCR JSON and deploy to your Azure environment
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-14 px-8 text-lg gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground/60 pt-8">
            We won't show this again on your next visit
          </p>
        </div>
      </div>
    </div>
  )
}
