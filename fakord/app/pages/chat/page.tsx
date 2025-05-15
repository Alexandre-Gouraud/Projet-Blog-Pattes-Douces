"use client"
import Form from "next/form";

import React from "react";
import { useSearchParams } from "next/navigation";

function AjoutText(){

}

export default function Chat() {
    const searchParams = useSearchParams();

    return (
        
        <>
        
        <p>Votre nom user : {searchParams.get("nomUser")}</p>
        <Form action="" className=" shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <input className="bg-cyan-100 text-black p-1 rounded-2xl" name="Message" placeholder="text..." />
            <br/>
            <br/>
            <button type="submit" onClick={AjoutText} className="bg-blue-300 hover:bg-blue-400 text-black border-solid rounded-3xl p-2">Envoyer</button>
        </Form>
        <form></form>
        <h1>Chat</h1>
        <ul className="list-none  border-amber-100 border-2 w-sm">
            {/* break-all sert à faire un saut de ligne quand un mot est trop long pour le cadre définit */}
            <li className="break-all">testsdddddddddddddddddddddbbkhbkbkqsdljsqdkbsdfsdfisdifv 1</li>
            <li className="">test 2</li>
        </ul>
        <script type="text/javascript">
            const text = 'Develop. Preview. Ship.';
            const headerContent = document.createTextNode(text);
        </script>
        
        
        </>
    )
}