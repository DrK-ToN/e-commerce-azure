import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact();

// Detecta se é local
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// URL Base do seu Railway (Sem a barra no final)
const RAILWAY_URL = "https://e-commerce-azure-production.up.railway.app";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: isLocalhost
        ? "http://localhost:3001/api/trpc"
        : `${RAILWAY_URL}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
