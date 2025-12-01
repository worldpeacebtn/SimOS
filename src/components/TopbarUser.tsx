// src/components/TopbarUser.tsx
import React from 'react'

export function TopbarUser({ user }: { user: any }) {
  if (!user) return <div>Guest</div>
  return <div style={{padding:'0 12px'}}>Logged: {user.email ?? user.user_metadata?.name ?? user.id}</div>
}