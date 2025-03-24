// import Image from "next/image";

import { Prisma, PrismaClient } from "@prisma/client";

import {prisma} from "@/src/db/prisma"

import { createElement } from "react";


export default async function Home() {

const AllUsers= await prisma.user.findMany()

const a= <div>{AllUsers.map((element) => (
    <li key={element.id}>{element.pseudo}</li>
  ))}</div>

  return (<><div>
    <h1>Liste des users : </h1>
    <br/>
    {a}
    <br/>
    <h1>Ajouter un user:</h1>
  </div>
  </>);
}
