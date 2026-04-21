import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@0waste/api';

export const trpc = createTRPCReact<AppRouter>();
