'use client'

interface Props {
  onClick: () => void
  loading: boolean
  hidden:  boolean
}

export default function LoadMoreButton({ onClick, loading, hidden }: Props) {
  if (hidden) return null

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Cargando…' : 'Cargar más'}
      </button>
    </div>
  )
}
