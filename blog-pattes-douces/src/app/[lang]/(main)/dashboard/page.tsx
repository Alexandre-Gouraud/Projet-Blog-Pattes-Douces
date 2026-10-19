import type { Metadata } from "next";
import StatsOverview from "@/features/dashboard/components/StatsOverview";
import StatsChart from "@/features/dashboard/components/StatsChart";
import MyArticlesList from "@/features/articles/components/MyArticlesList";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return (
    <>
      <StatsOverview />
      <StatsChart />
      <MyArticlesList />
    </>
  );
}
