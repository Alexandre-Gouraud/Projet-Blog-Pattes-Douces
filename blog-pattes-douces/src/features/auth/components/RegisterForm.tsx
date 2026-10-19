"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { FormField, fieldClass } from "@/components/ui/FormField";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import type { Dictionary } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";
import { ApiError, login, register } from "@/lib/api-client";
import { saveSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import { LIMITS, SPECIES, isEmail, passwordIssue } from "@/lib/validation";

type Field = "pseudo" | "email" | "bio" | "password" | "confirm";
type MessageKey = {
  [K in keyof Dictionary]: Dictionary[K] extends string ? K : never;
}[keyof Dictionary];
type Errors = Partial<Record<Field, MessageKey>>;

const ORDER: Field[] = ["pseudo", "email", "bio", "password", "confirm"];
const fieldId = (field: Field) => `inscription-${field}`;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  const pseudo = values.pseudo.trim();
  if (pseudo.length < LIMITS.pseudo.min || pseudo.length > LIMITS.pseudo.max) errors.pseudo = "errPseudoLength";
  if (!isEmail(values.email.trim())) errors.email = "errEmail";
  if (values.bio.trim().length > LIMITS.biographie) errors.bio = "errBioLong";
  const issue = passwordIssue(values.password);
  if (issue) errors.password = `password_${issue}`;
  if (!values.confirm || values.confirm !== values.password) errors.confirm = "errConfirm";
  return errors;
}

/**
 * Inscription (DESIGN.md §9.8) : champs obligatoires signales, aides et
 * erreurs reliees a chaque champ, validation a la soumission et focus sur le
 * premier champ en erreur. Le compte cree, le membre est connecte directement.
 */
export default function RegisterForm() {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showErrors = (next: Errors) => {
    setErrors(next);
    const first = ORDER.find((field) => next[field]);
    if (first) document.getElementById(fieldId(first))?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const read = (name: string) => String(form.get(name) ?? "");
    const values: Record<Field, string> = {
      pseudo: read("pseudo"),
      email: read("mail"),
      bio: read("biographie"),
      password: read("password"),
      confirm: read("confirmPassword"),
    };

    setServerError(false);
    const invalid = validate(values);
    if (Object.keys(invalid).length > 0) {
      showErrors(invalid);
      return;
    }

    setSubmitting(true);
    const pseudo = values.pseudo.trim();
    try {
      await register({
        pseudo,
        mail: values.email.trim(),
        biographie: values.bio.trim(),
        espece: read("espece"),
        password: values.password,
      });
      const { user } = await login(pseudo, values.password);
      saveSession(user);
      toast(t.welcome(user.pseudo));
      router.push(ROUTES.feed);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.status === 409) {
        showErrors(/e-?mail/i.test(err.message) ? { email: "errEmailTaken" } : { pseudo: "errPseudoTaken" });
      } else {
        setErrors({});
        setServerError(true);
      }
    }
  };

  const message = (field: Field) => (errors[field] ? t[errors[field]] : undefined);

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-5">
      <PageTitle className="text-center">{t.registerTitle}</PageTitle>
      <form
        onSubmit={handleSubmit}
        // POST : meme envoye avant l'hydratation, le mot de passe ne finit jamais dans l'URL.
        method="post"
        noValidate
        className="flex flex-col gap-[18px] rounded-2xl bg-form p-7 shadow-md"
      >
        <p className="m-0 text-sm">{t.starRequired}</p>
        <FormField id={fieldId("pseudo")} label={t.petName} help={t.pseudoHelp} error={message("pseudo")} errorPrefix={t.error}>
          {(control) => <input {...control} name="pseudo" autoComplete="username" aria-required="true" />}
        </FormField>
        <FormField id={fieldId("email")} label={t.email} help={t.emailHelp} error={message("email")} errorPrefix={t.error}>
          {(control) => <input {...control} name="mail" type="email" autoComplete="email" aria-required="true" />}
        </FormField>
        <FormField id={fieldId("bio")} label={t.bio} help={t.bioHelp} error={message("bio")} errorPrefix={t.error}>
          {(control) => <textarea {...control} name="biographie" rows={3} className={`${control.className} resize-y`} />}
        </FormField>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inscription-espece" className="text-[15px] font-semibold">
            {t.speciesLabel}
          </label>
          <select id="inscription-espece" name="espece" defaultValue="pet" className={fieldClass(false)}>
            {SPECIES.map((key) => (
              <option key={key} value={key}>
                {t.species[key]}
              </option>
            ))}
          </select>
        </div>
        <FormField
          id={fieldId("password")}
          label={t.passwordReq}
          help={t.passwordHelp}
          error={message("password")}
          errorPrefix={t.error}
        >
          {(control) => (
            <input {...control} name="password" type="password" autoComplete="new-password" aria-required="true" />
          )}
        </FormField>
        <FormField id={fieldId("confirm")} label={t.confirm} error={message("confirm")} errorPrefix={t.error}>
          {(control) => (
            <input
              {...control}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-required="true"
            />
          )}
        </FormField>
        {serverError && (
          <p
            role="alert"
            className="m-0 flex items-start gap-2.5 rounded-[10px] bg-danger-bg px-3.5 py-3 text-[15px] font-semibold text-danger-ink"
          >
            <AlertIcon className="mt-px shrink-0" />
            <span>
              {t.error} {t.errServer}
            </span>
          </p>
        )}
        <Button type="submit" size="lg">
          {t.createMyAccount}
        </Button>
      </form>
      <p className="m-0 rounded-xl bg-surface px-4 py-3.5 text-center">
        {t.alreadyAccount}{" "}
        <Link href={ROUTES.login} className="font-semibold text-link">
          {t.login}
        </Link>
      </p>
    </div>
  );
}
