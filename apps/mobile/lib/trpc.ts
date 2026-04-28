import type { AppRouter } from "@0waste/api";
import {
    createTRPCProxyClient,
    createTRPCReact,
    httpBatchLink,
} from "@trpc/react-query";
import { getApiBaseUrl } from "./api-base";

export const batchLink = httpBatchLink({
  url: `${getApiBaseUrl()}/trpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const trpc = createTRPCReact<AppRouter>();
export const trpcServer = createTRPCProxyClient<AppRouter>({
  links: [batchLink],
});
