import type { Session } from '@supabase/supabase-js'

export function editorNameFromSession(session: Session | null): string {
  const email = session?.user?.email?.toLowerCase() ?? ''
  if (email.includes('lissi')) return 'Lissi'
  if (email.includes('babs')) return 'Babs'
  return session?.user?.email?.split('@')[0] ?? 'Someone'
}
