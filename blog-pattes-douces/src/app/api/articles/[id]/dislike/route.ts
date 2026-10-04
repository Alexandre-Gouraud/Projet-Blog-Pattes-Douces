import { toggleReaction } from "@/lib/reactions";

export async function POST(req: Request, { params }: RouteContext<"/api/articles/[id]/dislike">) {
    const { id } = await params;
    return toggleReaction(req, id, "reaction2");
}
