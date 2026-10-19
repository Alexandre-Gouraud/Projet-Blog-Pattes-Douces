"use client";

import { useRef, useState } from "react";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/FormField";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, login } from "@/lib/api-client";
import { saveSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

type LoginError = "errEmpty" | "errBad" | "errServer";

/**
 * Connexion (DESIGN.md §9.8) : validation a la soumission seulement, erreur
 * dans un bloc role="alert" relie aux deux champs, focus sur le champ a
 * corriger. Le message ne dit pas lequel du pseudo ou du mot de passe est faux.
 */
export default function LoginForm({ notice, next }: { notice: boolean; next: string | null }) {
  const { t, f } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [error, setError] = useState<LoginError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pseudoRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const pseudo = pseudoRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";

    if (!pseudo || !password) {
      setError("errEmpty");
      (pseudo ? passwordRef : pseudoRef).current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await login(pseudo, password);
      saveSession(user);
      toast(f(t.login.welcomeBack, { name: user.pseudo }));
      router.push(next ?? ROUTES.feed);
    } catch (err) {
      const unreachable = err instanceof ApiError && (err.status === 0 || err.status >= 500);
      setError(unreachable ? "errServer" : "errBad");
      pseudoRef.current?.focus();
      setSubmitting(false);
    }
  };

  const invalid = error ? true : undefined;
  const errorId = error ? "connexion-erreur" : undefined;

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-5">
      <PageTitle className="text-center">{t.titles.login}</PageTitle>
      {notice && (
        <p role="status" className="m-0 rounded-xl bg-cream px-4 py-3 font-semibold">
          {t.login.required}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        // POST : meme envoye avant l'hydratation, le mot de passe ne finit jamais dans l'URL.
        method="post"
        noValidate
        className="flex flex-col gap-[18px] rounded-2xl bg-form p-7 shadow-md"
      >
        <p className="m-0 text-sm">{t.login.allRequired}</p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="connexion-pseudo" className="text-[15px] font-semibold">
            {t.login.pseudo}
          </label>
          <input
            ref={pseudoRef}
            id="connexion-pseudo"
            name="pseudo"
            autoComplete="username"
            required
            aria-invalid={invalid}
            aria-describedby={errorId}
            className={fieldClass(Boolean(error))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="connexion-mot-de-passe" className="text-[15px] font-semibold">
            {t.login.password}
          </label>
          <input
            ref={passwordRef}
            id="connexion-mot-de-passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={invalid}
            aria-describedby={errorId}
            className={fieldClass(Boolean(error))}
          />
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="m-0 flex items-start gap-2.5 rounded-[10px] bg-danger-bg px-3.5 py-3 text-[15px] font-semibold text-danger-ink"
          >
            <AlertIcon className="mt-px shrink-0" />
            <span>
              {t.common.error} {t.login[error]}
            </span>
          </p>
        )}
        <Button type="submit" size="lg">
          {t.shell.login}
        </Button>
      </form>
      <p className="m-0 rounded-xl bg-surface px-4 py-3.5 text-center">
        {t.login.firstTime}{" "}
        <Link href={ROUTES.register} className="font-semibold text-link">
          {t.login.signUp}
        </Link>
      </p>
    </div>
  );
}
