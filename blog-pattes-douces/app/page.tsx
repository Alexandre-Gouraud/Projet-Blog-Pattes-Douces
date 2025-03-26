// import Image from "next/image";

import {prisma} from "@/src/db/prisma"
import { revalidatePath } from "next/cache"
import Form from "next/form";
import { redirect } from "next/navigation";

// composants
import RedirectTo from "@/components/redirection";

// laisser en commentaire
// import { redirect } from "next/dist/server/api-utils"
// import { createElement } from "react";


export default async function Home() {
// Affichage des users
const AllUsers= await prisma.user.findMany()

const a= <div>{AllUsers.map((element) => (
    <li key={element.id}>{element.pseudo}</li>
  ))}</div>


// Ajouter des users
let nom_user = ""

if (!(prisma.user.findFirst({where:{pseudo:nom_user}}))){

  const user_create =  prisma.user.create({
    data:{
      pseudo: nom_user.toString(), 
      bio:'d',
      mail:'d',
      password:'d'
    }
  })
}

async function InscriptionRedirect(){
  revalidatePath("/inscription")
  redirect("/inscription")
}

  return (<><div>
    <h1>Liste des users : </h1>
    <br/>
    {a}
    <br/>
    <h1>Ajouter un user:</h1>
    <label htmlFor="nom">Name:</label>
    <input type="text" id="nom" name="nom" value={nom_user}/>

    <br/>

    <RedirectTo path="/inscription" nom_page="Inscription"></RedirectTo>
    
  </div>
  </>);
}