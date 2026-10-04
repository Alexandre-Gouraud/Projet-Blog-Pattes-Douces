# 📌 Projet Blog Pattes Douces

Blog communautaire ecrit avec Next.js 16 et MongoDB.

Le code de l'application se trouve dans **`blog-pattes-douces/`**.
Toute la documentation (installation, variables d'environnement, structure,
API) est dans [`blog-pattes-douces/README.md`](blog-pattes-douces/README.md).

## Demarrage rapide

```bash
git clone https://github.com/Alexandre-git-SDV/Projet-Blog-Pattes-Douces.git
cd Projet-Blog-Pattes-Douces/blog-pattes-douces
pnpm install
cp .env.example .env    # .env n'est jamais commite ; BLOB_READ_WRITE_TOKEN pour publier
pnpm db:up              # MongoDB local en replica set (Docker), requis par Prisma
pnpm db:push            # cree les index de la base
pnpm dev                # http://localhost:3000
```

Prerequis : Node.js 24, pnpm 10, Docker. Details et problemes frequents :
[`blog-pattes-douces/README.md`](blog-pattes-douces/README.md#demarrage).

## 📄 Licence

Ce projet est sous licence MIT.
