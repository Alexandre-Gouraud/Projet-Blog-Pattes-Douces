"use client"; // Les error boundaries doivent etre des Client Components

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-[#996C44]">Une erreur est survenue</h1>
      <p className="text-[#444444]">{error.message || "Erreur inattendue."}</p>
      <button
        onClick={() => retry()}
        className="bg-[#FFB371] text-white px-4 py-2 rounded-lg hover:bg-[#996C44] transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
