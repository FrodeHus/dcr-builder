import { createFileRoute } from '@tanstack/react-router'
import { getDcrJson, setDcrJson } from '@/server/dcr-share-cache'

export const Route = createFileRoute('/api/dcr/$id')({
  server: {
    handlers: {
      GET: ({ params }) => {
        const json = getDcrJson(params.id)
        if (!json) {
          return new Response('Not found', { status: 404 })
        }
        return new Response(json, {
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
        })
      },
      PUT: async ({ params, request }) => {
        const body = await request.json().catch(() => null)
        if (!body?.json) {
          return new Response('Missing json', { status: 400 })
        }
        setDcrJson(params.id, body.json)
        return new Response(null, { status: 204 })
      },
    },
  },
  component: () => null,
})
