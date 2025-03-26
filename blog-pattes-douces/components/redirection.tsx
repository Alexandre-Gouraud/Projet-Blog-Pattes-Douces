"use client";

import { useRouter } from "next/navigation";

export default function RedirectTo({ path, nom_page }: { path: string; nom_page: string } ) {
  const router = useRouter();

  function handleRedirect() {
    router.push(path);
  }

  return <button type="button" onClick={handleRedirect}>{nom_page}</button>;
}
