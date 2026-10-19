import type { Metadata } from "next";
import ActivityList from "@/features/activity/components/ActivityList";

export const metadata: Metadata = { title: "Activité" };

export default function ActivityPage() {
  return <ActivityList />;
}
