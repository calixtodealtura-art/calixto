export default function LoadingProductos() {
  return (
    <div className="min-h-screen bg-ivory">
      <div
        className="px-8 md:px-20 py-14 border-b border-cream-warm"
        style={{ backgroundColor: '#fff0dc' }}
      >
        <div className="h-3 w-32 bg-cream-warm rounded mb-3" />
        <div className="h-8 w-64 bg-cream-warm rounded" />
      </div>

      <div className="px-8 md:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-cream-warm" />
              <div className="p-5 border-t border-cream-warm space-y-2">
                <div className="h-2 w-16 bg-cream-warm rounded" />
                <div className="h-5 w-3/4 bg-cream-warm rounded" />
                <div className="h-3 w-full bg-cream-warm rounded" />
                <div className="h-6 w-1/3 bg-cream-warm rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
