import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact();

// Detecta se é local (Mantido conforme seu original)
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// URL Base do seu Railway (Mantido conforme seu original)
const RAILWAY_URL = "https://e-commerce-azure-production.up.railway.app";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: isLocalhost
        ? "http://localhost:3001/api/trpc"
        : `${RAILWAY_URL}/api/trpc`,
      transformer: superjson,
      
      // 🛡️ ADICIONADO: Injeção de identidade para o Backend
      headers() {
        const savedUser = localStorage.getItem('@Ecom:user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            return {
              'x-user-id': String(user.id),
              'x-user-role': user.role, // Aqui vai o "admin" que o backend exige
            };
          } catch (e) {
            console.error("Erro ao ler dados de autenticação", e);
          }
        }
        return {};
      },
    }),
  ],
});