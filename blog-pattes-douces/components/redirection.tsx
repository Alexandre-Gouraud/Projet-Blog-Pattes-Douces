"use client";
// pour la redirection de page
import { useRouter } from "next/navigation";

// import id_import from "@/src/db/Id_import";

import { useEffect,useState } from "react";

export default function RedirectTo({ path, nom_page, id_user }: { path: string; nom_page: string; id_user: string} ) {
  
  // redirection de page
  const router = useRouter();

  function handleRedirect() {
    router.push(path);
  }

  // const  [user_id,sauvegarde_id] = id_import("user_id")

  const [user_id, saisie_user_id] = useState('');

  useEffect(() => {

    const storedData = localStorage.getItem("user_id");
    saisie_user_id(storedData ?? "");
  }, []);

  const sauvegarde_id = (new_id: string) => {
    localStorage.setItem('id_user', new_id);
    saisie_user_id(new_id);
  };

    // permet de créer un OnClick event avec plus d'une fonction
  return (
  <button type="button" onClick={()=>{handleRedirect();
    sauvegarde_id(id_user)
  }}>{nom_page}</button>);
}
