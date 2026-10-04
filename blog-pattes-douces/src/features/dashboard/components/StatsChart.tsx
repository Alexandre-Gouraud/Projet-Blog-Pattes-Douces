"use client";

import { useUserStats } from "@/features/dashboard/hooks/useUserStats";

/** Part de `part` dans `total`, en %, sans division par zero (evite les `NaN%`). */
function percent(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

export default function StatsChart() {
  const { views: totalVues, likes: totalLikes, dislikes: totalDislikes, reactions: totalReactions } =
    useUserStats();

  // Une reaction est soit un like soit un dislike : le total des interactions
  // est donc le total des reactions (et non likes + dislikes + reactions).
  const totalInteractions = totalReactions;
  const likesPercentage = percent(totalLikes, totalInteractions);
  const dislikesPercentage = percent(totalDislikes, totalInteractions);

  // NOTE: un useEffect de donnees factices ecrasait ici les vrais articles.
  // Il a ete retire lors de la restructuration (voir compte rendu).

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Statistiques Visuelles</h1>

      {/* Container des graphiques */}
      <div className="flex space-x-8 justify-between">
        {/* Diagramme Circulaire */}
        <div className="w-1/2 bg-white border border-black shadow-md p-4 rounded-lg flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Répartition des Réactions</h2>
          <div
            className="relative w-64 h-64 rounded-full"
            style={{
              // Sans aucune reaction, le cercle reste gris au lieu d'etre colore.
              background:
                totalInteractions > 0
                  ? `conic-gradient(#4CAF50 0% ${likesPercentage}%, #F44336 ${likesPercentage}% 100%)`
                  : "#E5E7EB",
            }}
          >
            <div className="absolute inset-12 bg-white rounded-full flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold">Total</h3>
              <p className="text-2xl font-bold text-gray-700">{totalInteractions}</p>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
              <span className="text-sm">Likes ({Math.round(likesPercentage)}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-red-500 rounded-full"></span>
              <span className="text-sm">Dislikes ({Math.round(dislikesPercentage)}%)</span>
            </div>
          </div>
        </div>

        {/* Diagramme à Barres */}
        <div className="w-1/2 bg-white border border-black shadow-md p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Évolution par Statistiques</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Vues</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-blue-500 h-6 rounded"
                  style={{
                    width: `${percent(totalVues, totalVues + totalReactions)}%`,
                    maxWidth: "100%",
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalVues}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Likes</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-green-500 h-6 rounded"
                  style={{ width: `${likesPercentage}%`, maxWidth: "100%" }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalLikes}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Dislikes</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-red-500 h-6 rounded"
                  style={{ width: `${dislikesPercentage}%`, maxWidth: "100%" }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalDislikes}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Réactions</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-purple-500 h-6 rounded"
                  style={{
                    width: `${percent(totalReactions, totalVues + totalReactions)}%`,
                    maxWidth: "100%",
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalReactions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
