"use client";
import prisma from "@/src/db/prisma1";
import { notFound } from "next/navigation";

import { useEffect, useState } from "react";



// import id_import from "@/src/db/Id_import";

// let id_user = sessionStorage.getItem('id_user')

  

export default async function User() {

  //  const [user_id,sauvegarde_id] = id_import("user_id")

  const [user_id, saisie_user_id] = useState('');

  useEffect(() => {
    const id_user_stock = localStorage.getItem("user_id");
    saisie_user_id(id_user_stock ?? "");
  }, []);
 
  const User = await prisma.user.findFirst({
    where: {id:   user_id}
  });

  if (!User) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <article className="max-w-2xl space-y-4 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-4xl font-bold mb-8 text-[#333333]">{User.mail}</h1>
        <p className="text-gray-600 text-center">by {User.password}</p>
        <div className="prose prose-gray mt-8">
          {User.bio || "No content available."}
        </div>
      </article>
    </div>
  );
}