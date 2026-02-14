import { createFileRoute } from '@tanstack/react-router'
import { getDcrJson } from '@/server/dcr-share-cache'

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
    },
  },
  component: () => null,
})
