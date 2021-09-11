import * as React from 'react'
import { useLocation } from 'react-router'

const useScrollPosition = (): void => {
  const scrollPositon = React.useRef(new Map<string, number>())
  const { key } = useLocation()

  React.useEffect(() => {
    const { current: map } = scrollPositon

    if (map.has(key)) {
      window.scrollTo(0, map.get(key)!)
    } else {
      window.scrollTo(0, 0)
    }
  }, [key])

  React.useEffect(() => {
    const listener = () => {
      const { current: map } = scrollPositon

      map.set(key, window.screenY)
    }

    window.addEventListener('scroll', listener, { passive: true })

    return () => window.removeEventListener('scroll', listener)
  }, [key])
}

export default useScrollPosition
