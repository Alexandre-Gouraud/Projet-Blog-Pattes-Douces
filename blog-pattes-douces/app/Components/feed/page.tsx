// components/Feed.tsx

import React from 'react';

interface Reaction {
  react1: string[];
  react2: string[];
  react3: string[];
  react4: string[];
}

interface Post {
  _id: { id_article: string };
  post: {
    id_user: string;
    titre: string;
    texte: string;
    image: string;
    date: { $date: string };
    vue: string[];
    reactions: Reaction;
    commentaires: any[];
  };
}

interface FeedProps {
  posts: Post[];
}

const Feed: React.FC<FeedProps> = ({ posts }) => {
  return (
    <div>
      {posts.map((post) => (
        <div key={post._id.id_article} className="post">
          <h2>{post.post.titre}</h2>
          <p>{post.post.texte}</p>
          {post.post.image && <img src={post.post.image} alt="Post image" />}
          <p>Date : {new Date(post.post.date.$date).toLocaleDateString()}</p>
          <p>Vue par : {post.post.vue.join(', ')}</p>
          <div>
            Réactions :
            {Object.keys(post.post.reactions).map((reactKey) => (
              <p key={reactKey}>
                {reactKey}: {post.post.reactions[reactKey].length} réactions
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
