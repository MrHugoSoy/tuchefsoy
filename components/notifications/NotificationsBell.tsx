'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'rating' | 'follow'
  recipe_id: string | null
  from_user_id: string | null
  message: string
  read: boolean
  created_at: string
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const TYPE_ICON: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  rating: '⭐',
  follow: '👤',
}

export default function NotificationsBell() {
  const { user } = useAuth()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [followUsernames, setFollowUsernames] = useState<Record<string, string>>({})
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    loadNotifications()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev])
        setUnread((n) => n + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function loadNotifications() {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data as Notification[])
      setUnread(data.filter((n) => !n.read).length)

      // Load usernames for follow notifications
      const followNotifs = data.filter((n) => n.type === 'follow' && n.from_user_id)
      if (followNotifs.length > 0) {
        const ids = followNotifs.map((n) => n.from_user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', ids)
        if (profiles) {
          const map: Record<string, string> = {}
          profiles.forEach((p) => { map[p.id] = p.username })
          setFollowUsernames(map)
        }
      }
    }
  }

  async function handleOpen() {
    setOpen((v) => !v)
    if (!open && unread > 0) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user!.id)
        .eq('read', false)
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  async function clearAll() {
    if (!user) return
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
    setUnread(0)
  }

  function getHref(n: Notification): string {
    if (n.type === 'follow' && n.from_user_id && followUsernames[n.from_user_id]) {
      return `/perfil/${followUsernames[n.from_user_id]}`
    }
    if (n.recipe_id) return `/recipe/${n.recipe_id}`
    return '/'
  }

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-[#f7f7f7] transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e85d04] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-[#111]">Notificaciones</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-muted hover:text-[#111] transition-colors">
                Limpiar todo
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={getHref(n)}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-[#f7f7f7] transition-colors border-b border-[#f7f7f7] last:border-0 ${
                    !n.read ? 'bg-[#fff5ee]' : ''
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111] leading-snug">{n.message}</p>
                    <p className="text-xs text-muted mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-[#e85d04] rounded-full shrink-0 mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}