import React from "react";
import Image from "next/image";

// Définition de l'interface pour un post
interface PostProps {
  text: string;
}

// Composant Post réutilisable
const Post: React.FC<PostProps> = ({ text }) => {
  return (
    <div className="Post border p-4 rounded-lg shadow-md bg-white">
      <p className="mt-2 text-gray-700">{text}</p>
    </div>
  );
};

export default function Home() {
  // Tableau des posts
  const posts: PostProps[] = [
    {
      text: "The cat's meow is her way of communicating with people. Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong."
    },
    {
      text: "Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong. Meowing is an interesting vocalization in that adult cats don't actually meow at each other, just at people."
    },
    {
      text: "The cat's meow is her way of communicating with people. Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong."
    },
    {
      text: "The cat's meow is her way of communicating with people. Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong."
    },
    {
      text: "Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong. Meowing is an interesting vocalization in that adult cats don't actually meow at each other, just at people."
    },
    {
      text: "The cat's meow is her way of communicating with people. Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong."
    },
    {
      text: "The cat's meow is her way of communicating with people. Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong."
    },
    {
      text: "Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong. Meowing is an interesting vocalization in that adult cats don't actually meow at each other, just at people."
    },
    {
      text: "The cat's meow is her way of communicating with people. Cats meow for many reasons—to say hello, to ask for things, and to tell us when something's wrong."
    }
  ];

  return (
    <div className="Home p-4">
      <div className="posts grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (<Post key={index} {...post} />))}
      </div>
    </div>
  );
}
