export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-3xl font-bold text-primary">5+</div>
        <div className="text-sm text-muted-foreground">African Languages</div>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-3xl font-bold text-primary">STEM</div>
        <div className="text-sm text-muted-foreground">African Innovation</div>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-3xl font-bold text-primary">AI</div>
        <div className="text-sm text-muted-foreground">Learning Technology</div>
      </div>
    </div>
  )
}
