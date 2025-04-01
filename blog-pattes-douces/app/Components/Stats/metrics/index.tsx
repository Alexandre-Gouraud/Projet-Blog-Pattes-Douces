"use client";
import React from "react";
import Badge from "../../ui/badge/Badge";
// import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@tabler/icons-react";
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

export default function Dashboard() {
  const [auteurId, setAuteurId] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);

  const user_id = localStorage.getItem("user_id") || ""; // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
  // Vérifier si l'utilisateur est connecté
  if (!user_id) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Vous n'êtes pas connecté</h1>
        <p className="text-gray-500">Veuillez vous connecter pour voir vos statistiques.</p>
      </div>
    );
  }
  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const fetchAuteurId = async () => {
      try {
        const response = await fetch("/api/auteurId?user_id"); // 
        if (!response.ok) throw new Error("Erreur lors du chargement de l'auteur ID");
        
        const data = await response.json();
        setAuteurId(data.user_id);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAuteurId();
  }, []);

  // Récupérer uniquement les articles de cet utilisateur
  useEffect(() => {
    if (!auteurId) return; // Attendre que l'auteurId soit chargé

    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/article?authorId=${auteurId}`);
        if (!response.ok) throw new Error("Erreur lors du chargement des articles");
        
        const data: Article[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticles();
  }, [auteurId]); // Dépendance : recharge quand auteurId est défini

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <div className="text-gray-800 size-6 dark:text-white/90" />
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Vues</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">3,782</h4>
                    </div>
                    <Badge color="success">11.01%</Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <div className="text-gray-800 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Orders</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">5,359</h4>
                    </div>

                    <Badge color="error">9.05%</Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
