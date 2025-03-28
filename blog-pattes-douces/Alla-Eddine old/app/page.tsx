// import Image from "next/image";

import {prisma} from "@/src/db/prisma"
import { revalidatePath } from "next/cache"
import Form from "next/form";
import { redirect } from "next/navigation";

// import id_import from "@/src/db/Id_import"

// composants
import RedirectTo from "@/components/redirection";

// laisser en commentaire
// import { redirect } from "next/dist/server/api-utils"
// import { createElement } from "react";


export default async function Home() {

// const  [user_id,sauvegarde_id] = id_import("user_id")

// stocker tout users
const AllUsers= await prisma.user.findMany()


const a= <div>{AllUsers.map((element) => (

   
    <li key={element.id}>{element.pseudo}{"     "}  
    <RedirectTo path="/page_user" nom_page="Page User" id_user={element.id}></RedirectTo>
    </li>
    
  ))}</div>

  return (<><div>
    <h1>Liste des users : </h1>
    <br/>
    {a}
    <br/>
    

    <br/>

    <RedirectTo path="/inscription" nom_page="Inscription" id_user=""></RedirectTo>
    
  </div>
  </>);
}