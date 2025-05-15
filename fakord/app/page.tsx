'use client'
import Form from 'next/form'
import MediaThemeTailwindAudio from "player.style/tailwind-audio/react"
// import { url } from "inspector"
// import Link from "next/link"

export default function Home() {
  return (
  <>
  <div className="w-full max-w-xs  text-xl bg-[url(./imagesAudio/pearTetoDance.gif)] bg-no-repeat bg-cover bg-center">
  
  <br/>
   <Form action="/pages/chat" className=" shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <h1>Veuillez saisir le nom de votre user</h1>
      <input className="bg-cyan-100 text-lime-500 p-1 rounded-2xl" name="nomUser" />
  
      <br/>
      <br/>
      <button type="submit" className="bg-green-300 hover:bg-green-400 text-black border-solid rounded-3xl p-2">Confirmer</button>
    </Form>

    <MediaThemeTailwindAudio style={{width: "100%"}}>
        <audio
          slot="media"
          src= "/audio/TetoPearSong.mp3"
          playsInline
          autoPlay
          crossOrigin="anonymous"
        ></audio>
      </MediaThemeTailwindAudio>
    </div>

  </>)

}