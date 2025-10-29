import React from 'react'

interface CryptoStatusProps {
  loading?: boolean
  error?: string | null
  success?: boolean
}

export function CryptoStatus({ loading, error, success }: CryptoStatusProps) {
  if (loading) {
    return <div style={{ color: '#3b82f6' }}>Processing...</div>
  }

  if (error) {
    return <div style={{ color: '#ef4444' }}>Error: {error}</div>
  }

  if (success) {
    return <div style={{ color: '#10b981' }}>Success!</div>
  }

  return null
}

