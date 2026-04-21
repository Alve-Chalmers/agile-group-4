import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@0waste/api';

import { getApiBaseUrl } from './api-base';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/trpc`,
    }),
  ],
});
