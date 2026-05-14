export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">We&apos;ll be back soon</h1>
      <p className="max-w-md text-muted-foreground">
        Ciuna is temporarily unavailable while we perform maintenance. Please try again later.
      </p>
    </div>
  )
}
