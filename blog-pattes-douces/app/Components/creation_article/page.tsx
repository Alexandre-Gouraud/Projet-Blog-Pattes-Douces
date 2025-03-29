import prisma from "@/src/db/prisma1"
import { revalidatePath } from "next/cache";
import Form from "next/form";
import { redirect } from "next/navigation";


export default function Creation_article() {

  async function createPost(formData: FormData) {
    "use server";
    // récupère les valeurs des inputs
    const titre = formData.get("titre") as string;
    const texte = formData.get("texte") as string;

  
    await prisma.article.create({
      data: {
        id_user:"67e171b2681e5e20719952c4",
      titre, 
      texte,
      image:null,
      
      vue:[],
      reaction1:[],
      reaction2:[],
      commentaires:[]
      },
    });

     
   

    revalidatePath("/Articles_users");
    redirect("/Articles_users");

  
  }
 
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau post</h1>
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