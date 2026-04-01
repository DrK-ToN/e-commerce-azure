import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export const trpc = createTRPCReact();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      // AJUSTE: Se o backend está na 3001, o link local deve ser 3001
      url: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/trpc' 
        : '/api/trpc',
      transformer: superjson,
    }),
  ],
});