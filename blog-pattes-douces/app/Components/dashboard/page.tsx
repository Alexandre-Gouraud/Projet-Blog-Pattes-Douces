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
    <div className="flex flex-wrap gap-6">
      {stats.map((stat) => (
        <div key={stat.id} className="stats intersect:motion-preset-slide-left intersect:motion-ease-spring-bouncier max-sm:w-full">
          <div className="stat">
            <div className="avatar avatar-placeholder">
              <div className={`bg-${stat.id}-20 text-${stat.id} size-10 rounded-full`}>
                <span className={`icon-[tabler--${stat.id}] size-6`}></span>
              </div>
            </div>
            <div className="stat-value mb-1">Order</div>
            <div className="stat-title">{stat.vue.length} of 10,000 orders</div>
            <div
              className="progress bg-success/10 h-2"
              role="progressbar"
              aria-label="Order Progressbar"
              aria-valuenow={stat.vue.length / 100}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-bar progress-success w-3/4"></div>
            </div>
          </div>
        </div>
      ))}

      <div>
        <h2 className="intersect:motion-preset-blur-left intersect:motion-delay-[1000ms] mb-4 text-3xl font-bold">
          Track Your Stats
        </h2>
      </div>
    </div>
  );
}
