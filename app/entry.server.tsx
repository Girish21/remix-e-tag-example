import ReactDOMServer from 'react-dom/server'
import type { EntryContext } from 'remix'
import { RemixServer } from 'remix'
import { config } from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  config()
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = ReactDOMServer.renderToString(
    <RemixServer context={remixContext} url={request.url} />
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
