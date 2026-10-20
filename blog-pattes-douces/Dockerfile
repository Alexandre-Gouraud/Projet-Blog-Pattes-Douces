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

# ---- Traduction des contenus : conversion des modeles fr<->ar (Python) -------
# Etape jetable, en cache tant que les dependances et le script ne changent pas.
# Python, torch et optimum restent dans cette etape : l'image finale n'a pas Python.
# Image epinglee par empreinte (python:3.12-slim) ; dependances installees avec
# leurs empreintes (--require-hashes), torch CPU depuis l'index PyTorch.
FROM python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1 AS translation-convert
WORKDIR /convert
COPY scripts/requirements-torch.txt scripts/requirements-translation.txt ./scripts/
RUN pip install --no-cache-dir --require-hashes --no-deps \
      --index-url https://download.pytorch.org/whl/cpu -r scripts/requirements-torch.txt \
 && pip install --no-cache-dir --require-hashes -r scripts/requirements-translation.txt
COPY scripts/convert-opus-mt.py ./scripts/
RUN python scripts/convert-opus-mt.py --output /convert/models

# ---- Traduction des contenus : modeles Opus-MT -------------------------------
# Couche separee, en cache tant que le script et le lockfile ne changent pas :
# les ~680 Mo de modeles ne sont pas retelecharges a chaque build.
# Le moteur ONNX Runtime WebAssembly vient du build Next.js (/_next/static/).
FROM deps AS translation
COPY scripts/translation-assets.mjs ./scripts/
# Les modeles fr<->ar viennent de l'etape translation-convert (--no-convert).
RUN node scripts/translation-assets.mjs --no-convert
COPY --from=translation-convert /convert/models/local ./public/models/local

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
COPY --from=translation --chown=node:node /app/public/models ./public/models
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# Pas de droits root dans le conteneur.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
