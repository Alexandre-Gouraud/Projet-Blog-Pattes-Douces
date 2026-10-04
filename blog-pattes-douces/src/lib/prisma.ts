import { PrismaClient, type Prisma } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Champs d'un utilisateur qu'une reponse d'API peut exposer.
 * Ne jamais inclure une relation utilisateur avec `true` : cela renverrait
 * aussi `password` (hash) et `email`.
 */
export const publicUserSelect = {
  id: true,
  pseudo: true,
} satisfies Prisma.UserSelect;
