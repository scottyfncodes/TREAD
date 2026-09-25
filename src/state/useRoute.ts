import { useCallback, useEffect, useState } from 'react'

/**
 * Hash routing, so the same build works at a GitHub Pages project path,
 * from the home screen, or offline, with no server rewrites.
 */
export type Route =
  | { name: 'home' }
  | { name: 'explore'; category: string | null }
  | { name: 'region'; id: string }
  | { name: 'adventure'; id: string }
  | { name: 'trips' }
  | { name: 'trip'; id: string }
  | { name: 'plan'; id: string | null }
  | { name: 'ready'; id: string; stop: string | null }
  | { name: 'garage' }
  | { name: 'vehicle'; id: string | null }
  | { name: 'location' }
  | { name: 'profile' }

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '')
  const [head, tail, third] = path.split('/')
  const id = tail ? decodeURIComponent(tail) : null
  switch (head) {
    case 'explore':
      return { name: 'explore', category: id }
    case 'region':
      return id ? { name: 'region', id } : { name: 'explore', category: null }
    case 'adventure':
      return id ? { name: 'adventure', id } : { name: 'explore', category: null }
    case 'trips':
      return { name: 'trips' }
    case 'trip':
      return id ? { name: 'trip', id } : { name: 'trips' }
    case 'plan':
      return { name: 'plan', id }
    case 'ready':
      return id ? { name: 'ready', id, stop: third ? decodeURIComponent(third) : null } : { name: 'trips' }
    case 'garage':
      return { name: 'garage' }
    case 'vehicle':
      return { name: 'vehicle', id: id === 'new' ? null : id }
    case 'location':
      return { name: 'location' }
    case 'profile':
      return { name: 'profile' }
    default:
      return { name: 'home' }
  }
}

export type Go = (path: string) => void

export function useRoute(): [Route, Go, () => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseRoute(location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback<Go>((path) => {
    location.hash = path.startsWith('#') ? path : `#/${path}`
    window.scrollTo(0, 0)
  }, [])

  const back = useCallback(() => {
    if (history.length > 1) history.back()
    else location.hash = '#/'
  }, [])

  return [route, go, back]
}
