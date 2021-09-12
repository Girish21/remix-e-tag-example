import type { LinksFunction, MetaFunction } from 'remix'
import { Meta, Links, Scripts, usePendingLocation, LiveReload } from 'remix'
import { Outlet } from 'react-router-dom'

import rootStyles from './styles/index.css'
import useScrollPosition from './util/hooks/useScrollPosition'

export let meta: MetaFunction = () => {
  return {
    viewport: 'width=device-width,initial-scale=1.0',
    'color-scheme': 'dark',
  }
}

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: rootStyles }]
}

const Overlay = () => {
  const pending = usePendingLocation()

  if (!pending) {
    return null
  }

  return <div className='fixed z-50 inset-0 bg-white bg-opacity-25' />
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='dark'>
      <head>
        <meta charSet='utf-8' />
        <link rel='icon' href='/favicon.png' type='image/png' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Overlay />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default function App() {
  useScrollPosition()

  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  )
}
