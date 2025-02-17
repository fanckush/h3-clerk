import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { eventHandler, fromNodeMiddleware, getRequestProtocol } from 'h3'
import type { H3Event, EventHandler, NodeMiddleware } from 'h3'
import type { ClerkOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/clerk-sdk-node'

// needed until https://github.com/nuxt/nuxt/issues/23348 is resolved
const fixProtoHeaderInDevMode = (event: H3Event) => {
  if (process.env.NODE_ENV === 'development') {
    event.node.req.headers['x-forwarded-proto'] = getRequestProtocol(event)
  }
}

export function withClerkMiddleware(options?: ClerkOptions) {
  return eventHandler({
    onRequest: [
      fixProtoHeaderInDevMode,
      fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth
    },
  })
}

export function withClerkAuth(handler: EventHandler, options?: ClerkOptions) {
  return eventHandler({
    onRequest: [
      fixProtoHeaderInDevMode,
      fromNodeMiddleware(ClerkExpressWithAuth(options) as NodeMiddleware),
    ],
    async handler(event) {
      // @ts-expect-error: Clerk Node attaches auth object to req.auth
      event.context.auth = event.node.req.auth

      return handler(event)
    },
  })
}

export { Clerk, clerkClient, createClerkClient } from '@clerk/clerk-sdk-node'

declare module 'h3' {
  interface H3EventContext {
    auth: SignedInAuthObject | SignedOutAuthObject
  }
}
