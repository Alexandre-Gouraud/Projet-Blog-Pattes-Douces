"use client";
import { useEffect, useState } from "react";

type Stats = {
  id: string;
  vue: any[];
  reaction1: any[];
  reaction2: any[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard"); // fetch pour l'API dashboard
        if (!response.ok) throw new Error("Erreur lors du chargement des stats");

        const data: Stats[] = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center items-center min-h-screen">
      <div className="stats intersect:motion-preset-slide-left intersect:motion-ease-spring-bouncier max-sm:w-full bg-white p-4 rounded-lg shadow-md">
        <div className="stat">
        <div className="avatar avatar-placeholder">
          <div className="bg-success/20 text-success size-10 rounded-full">
          <span className="icon-[tabler--package] size-6"></span>
          </div>
        </div>
        <div className="stat-value mb-1">Nombre de réactions</div>
        <div className="stat-title">5</div>
        <div
          className="progress bg-success/10 h-2 rounded-full"
          role="progressbar"
          aria-label="Order Progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar progress-success w-3/4 bg-green-600 rounded-full"></div>
        </div>
        </div>
      </div>

      <div className="stats intersect:motion-preset-slide-left intersect:motion-delay-[400ms] intersect:motion-ease-spring-bouncier max-sm:w-full bg-white p-4 rounded-lg shadow-md">
        <div className="stat">
        <div className="avatar avatar-placeholder">
          <div className="bg-warning/20 text-warning size-10 rounded-full">
          <span className="icon-[tabler--cash] size-6"></span>
          </div>
        </div>
        <div className="stat-value mb-1">Nombre de Commentaires</div>
        <div className="stat-title">5</div>
        <div
          className="progress bg-warning/10 h-2 rounded-full"
          role="progressbar"
          aria-label="Revenue Progressbar"
          aria-valuenow={45}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar progress-warning w-2/5 bg-yellow-600 rounded-full"></div>
        </div>
        </div>
      </div>

      <div className="stats intersect:motion-preset-slide-left intersect:motion-delay-[800ms] intersect:motion-ease-spring-bouncier max-sm:w-full bg-white p-4 rounded-lg shadow-md">
        <div className="stat">
        <div className="avatar avatar-placeholder">
          <div className="bg-error/20 text-error size-10 rounded-full">
          <span className="icon-[tabler--credit-card] size-6"></span>
          </div>
        </div>
        <div className="stat-value mb-1">Invoice</div>
        <div className="stat-title">$18,200 of $25,000</div>
        <div
          className="progress bg-error/10 h-2 rounded-full"
          role="progressbar"
          aria-label="Invoice Progressbar"
          aria-valuenow={73}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar progress-error w-[73%] bg-red-600 rounded-full"></div>
        </div>
        </div>
      </div>
      </div>
    </>
  );
}
