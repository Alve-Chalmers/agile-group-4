import type { AppRouter } from '@0waste/api';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

import { getApiBaseUrl } from './api-base';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
