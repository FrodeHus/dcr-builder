import { createFileRoute } from '@tanstack/react-router'
import { storeDcrJson } from '@/server/dcr-share-cache'

export const Route = createFileRoute('/api/dcr')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null)
        if (!body?.json) {
          return new Response('Missing json', { status: 400 })
        }
        const id = storeDcrJson(body.json)
        return new Response(JSON.stringify({ id }), {
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
        })
      },
    },
  },
  component: () => null,
})
