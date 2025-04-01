import React from "react";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: string[];
  reaction1: string[];
  reaction2: string[];
  auteurId: string;
  
  auteur: {
    id: string;
    pseudo: string;
  };
};

type User = {
  id: string;
  pseudo: string;
};

export default function Posts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/article");
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        } else {
          console.error("Failed to fetch articles");
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      if (pseudo) {
        try {
          const response = await fetch("/api/get_userid", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pseudo }),
          });
          if (response.ok) {
            const data = await response.json();
            setUserId(data.user_id);
          } else {
            console.error("Failed to fetch user ID");
          }
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
    };
    fetchUserId();
  }, [pseudo]);

  // Filter articles by the logged-in user's ID
  const userArticles = articles.filter((article) => article.auteurId === userId);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Vos articles</h1>
      <div className="space-y-6">
        {userArticles.map((article) => (
          <div key={article.id} className="border p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{article.titre}</h2>
            <p className="text-gray-700">{article.texte}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
