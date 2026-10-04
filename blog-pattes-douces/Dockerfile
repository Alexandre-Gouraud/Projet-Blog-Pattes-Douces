# syntax=docker/dockerfile:1
# Image de production de Pattes Douces (Next.js en mode standalone).
# Utilisee par compose.yaml (profil "app") : docker compose --profile app up -d --build --wait

# ---- Base : Node.js 24 LTS --------------------------------------------------
FROM node:24-slim AS base
# Prisma a besoin d'OpenSSL pour charger son moteur de requetes.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /app

# ---- Dependances (couche en cache tant que le lockfile ne change pas) --------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Le schema est requis ici : @prisma/client genere le client a l'installation.
COPY prisma ./prisma
# pnpm dans la version exacte du champ "packageManager" de package.json.
RUN corepack enable && corepack install && pnpm install --frozen-lockfile

# ---- Build de production -----------------------------------------------------
FROM deps AS builder
COPY . .
ENV NEXT_OUTPUT_STANDALONE=true
RUN pnpm build

# ---- Image finale : uniquement le serveur autonome ---------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# Pas de droits root dans le conteneur.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
