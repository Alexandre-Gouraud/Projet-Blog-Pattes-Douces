import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { articleId, pseudo } = req.query;

    if (!articleId || typeof articleId !== 'string' || !pseudo || typeof pseudo !== 'string') {
        return res.status(400).json({ error: 'ID de l\'article ou pseudo invalide' });
    }

    try {
        // Récupérer l'ID de l'utilisateur à partir de son pseudo
        const user = await prisma.user.findUnique({
            where: { pseudo },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Récupérer l'article et vérifier l'auteur
        const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { auteurId: true },
        });

        if (!article) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        const isAuthor = article.auteurId === user.id;

        return res.status(200).json({ isAuthor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}
