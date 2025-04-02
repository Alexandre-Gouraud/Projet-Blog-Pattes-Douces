import prisma from "@/src/db/prisma1"
// import { revalidatePath } from "next/cache";
import Form from "next/form";
import { redirect } from "next/navigation";
import React, { useState, useEffect } from "react";

// const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
export default function Creation_article() {

  async function createPost(formData: FormData) {
    "use server";
    // récupère les valeurs des inputs
    const titre = formData.get("titre") as string;
    const texte = formData.get("texte") as string;
 
    const [userId, setUserId] = useState<string | null>(null);

  // Fetch userId from localStorage after the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);
  
    await prisma.article.create({
      data: {
        titre,
        texte,
        image: undefined,
        vue: [],
        reaction1: [],
        reaction2: [],
        auteur: {
          connect: { id: userId as string},
        },
      },
    });

     
   

    // revalidatePath("/Profil");
    // redirect("/Profil");

  
  }
 
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau post : {userId ?? "erreur"}</h1>
      <Form action={createPost} className="space-y-6">
        {/* titre */}
        <div>
          <label htmlFor="titre" className="block text-lg mb-2">
            titre
          </label>
          <input
            type="text"
            id="titre"
            name="titre"
            placeholder="titre..."
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* texte */}
        <div>
          <label htmlFor="texte" className="block text-lg mb-2">
            texte
          </label>
          <textarea
            id="texte"
            name="texte"
            placeholder="texte..."
            rows={6}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <a href="../Articles_users">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
        >
          Créer
        </button>
        </a>
      </Form>
    </div>
  );
}