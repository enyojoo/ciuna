'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  User,
  MapPin,
  Settings,
  Store,
  Shield,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { getOnboardingSteps, getOnboardingProgress } from '@/lib/onboarding/role-onboarding'

interface OnboardingWizardProps {
  role: UserRole
  onComplete: () => void
}

export function OnboardingWizard({ role, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const steps = getOnboardingSteps(role)
  const progress = getOnboardingProgress(role, completedSteps)
  const currentStepData = steps[currentStep]

  const getStepIcon = (stepId: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      profile: User,
      location: MapPin,
      preferences: Settings,
      store: Store,
      verification: Shield,
      payment: DollarSign,
      documents: FileText,
      availability: Clock,
      permissions: Shield
    }
    return icons[stepId] || User
  }

  const handleNext = async () => {
    setIsLoading(true)
    
    // Mark current step as completed
    const newCompletedSteps = [...completedSteps, currentStepData.id]
    setCompletedSteps(newCompletedSteps)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding complete
      onComplete()
    }
    
    setIsLoading(false)
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  if (!currentStepData) {
    return null
  }

  const StepIcon = getStepIcon(currentStepData.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 w-fit">
              <StepIcon className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
            
            {/* Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Step Content */}
            <div className="space-y-6">
              {currentStepData.id === 'profile' && (
                <ProfileStep />
              )}
              {currentStepData.id === 'location' && (
                <LocationStep />
              )}
              {currentStepData.id === 'preferences' && (
                <PreferencesStep />
              )}
              {currentStepData.id === 'store' && (
                <StoreStep />
              )}
              {currentStepData.id === 'verification' && (
                <VerificationStep />
              )}
              {currentStepData.id === 'payment' && (
                <PaymentStep />
              )}
              {currentStepData.id === 'documents' && (
                <DocumentsStep />
              )}
              {currentStepData.id === 'availability' && (
                <AvailabilityStep />
              )}
              {currentStepData.id === 'permissions' && (
                <PermissionsStep />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {!currentStepData.required && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Setup Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const StepIcon = getStepIcon(step.id)
                const isCompleted = completedSteps.includes(step.id)
                const isCurrent = index === currentStep
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCurrent ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isCompleted ? 'bg-green-100 text-green-600' :
                      isCurrent ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isCompleted ? 'text-green-800' :
                        isCurrent ? 'text-blue-800' :
                        'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Step Components (simplified for now)
function ProfileStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Profile setup form would go here</p>
    </div>
  )
}

function LocationStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Location selection form would go here</p>
    </div>
  )
}

function PreferencesStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Preferences form would go here</p>
    </div>
  )
}

function StoreStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Store setup form would go here</p>
    </div>
  )
}

function VerificationStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Verification form would go here</p>
    </div>
  )
}

function PaymentStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Payment setup form would go here</p>
    </div>
  )
}

function DocumentsStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Document upload form would go here</p>
    </div>
  )
}

function AvailabilityStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Availability setup form would go here</p>
    </div>
  )
}

function PermissionsStep() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Permissions setup form would go here</p>
    </div>
  )
}
