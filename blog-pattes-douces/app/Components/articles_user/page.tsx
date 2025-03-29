"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: any[];
  reaction1: any[];
  reaction2: any[];
};

export default function Article_user() {
  const [articles, setArticles] = useState<Article[]>([]);

  const router = useRouter(); 


  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles_user");
        if (!response.ok) throw new Error("Erreur lors du chargement des articles");

        const data: Article[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticles();
  }, []);

  async function supprimer_article(id_article: string) {
    try {
      const response = await fetch(`/api/articles_user/supprimer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id_article }),
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      // mise à jour de la liste et de la page
      setArticles(articles.filter((article) => article.id !== id_article));
      router.refresh(); 
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles du user</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold">{article.titre}</h2>
            <p className="text-gray-700">{article.texte}</p>
            {article.image && (
              <img src={article.image} alt={article.titre} className="mt-2 rounded-md" />
            )}
            <p className="text-sm text-gray-500">
              Publié le {new Date(article.date).toLocaleDateString()}
            </p>

            <div className="flex space-x-4">
              <p className="text-sm text-green-400">Vues : {article.vue.length}</p>
              <p className="text-sm text-blue-400">Like : {article.reaction1.length}</p>
              <p className="text-sm text-red-400">Dislike : {article.reaction2.length}</p>
            </div>

          
            <button
              type="button"
              onClick={() => supprimer_article(article.id)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Supprimer
            </button>

            
          </div>
        ))}
      </div>
      <br/>
      <a href="../Creation_article">
      <button type="button"
       className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >Créer un article</button>
    </a>
    </div>
  );
}
