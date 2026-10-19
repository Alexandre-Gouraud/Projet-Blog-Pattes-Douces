"use client";

import { useState } from "react";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { FormField, fieldClass } from "@/components/ui/FormField";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import type { Messages } from "@/i18n/messages";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, login, register } from "@/lib/api-client";
import { saveSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import { LIMITS, type PasswordIssue, SPECIES, isEmail, passwordIssue } from "@/lib/validation";

type Field = "pseudo" | "email" | "bio" | "password" | "confirm";
/** Message d'erreur a afficher : une regle du mot de passe ou une erreur de champ. */
type FieldError =
  | { rule: PasswordIssue }
  | { key: Exclude<keyof Messages["register"]["errors"], "server"> };
type Errors = Partial<Record<Field, FieldError>>;

const ORDER: Field[] = ["pseudo", "email", "bio", "password", "confirm"];
const fieldId = (field: Field) => `inscription-${field}`;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  const pseudo = values.pseudo.trim();
  if (pseudo.length < LIMITS.pseudo.min || pseudo.length > LIMITS.pseudo.max) errors.pseudo = { key: "pseudoLength" };
  if (!isEmail(values.email.trim())) errors.email = { key: "email" };
  if (values.bio.trim().length > LIMITS.biographie) errors.bio = { key: "bioLong" };
  const issue = passwordIssue(values.password);
  if (issue) errors.password = { rule: issue };
  if (!values.confirm || values.confirm !== values.password) errors.confirm = { key: "confirm" };
  return errors;
}

/**
 * Inscription (DESIGN.md §9.8) : champs obligatoires signales, aides et
 * erreurs reliees a chaque champ, validation a la soumission et focus sur le
 * premier champ en erreur. Le compte cree, le membre est connecte directement.
 */
export default function RegisterForm() {
  const { t, f } = useI18n();
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
      toast(f(t.register.welcome, { name: user.pseudo }));
      router.push(ROUTES.feed);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.status === 409) {
        showErrors(/e-?mail/i.test(err.message) ? { email: { key: "emailTaken" } } : { pseudo: { key: "pseudoTaken" } });
      } else {
        setErrors({});
        setServerError(true);
      }
    }
  };

  const message = (field: Field) => {
    const error = errors[field];
    if (!error) return undefined;
    return "rule" in error ? t.register.passwordRules[error.rule] : t.register.errors[error.key];
  };

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-5">
      <PageTitle className="text-center">{t.titles.register}</PageTitle>
      <form
        onSubmit={handleSubmit}
        // POST : meme envoye avant l'hydratation, le mot de passe ne finit jamais dans l'URL.
        method="post"
        noValidate
        className="flex flex-col gap-[18px] rounded-2xl bg-form p-7 shadow-md"
      >
        <p className="m-0 text-sm">{t.register.starRequired}</p>
        <FormField id={fieldId("pseudo")} label={t.register.pseudo} help={t.register.pseudoHelp} error={message("pseudo")} errorPrefix={t.common.error}>
          {(control) => <input {...control} name="pseudo" autoComplete="username" aria-required="true" />}
        </FormField>
        <FormField id={fieldId("email")} label={t.register.email} help={t.register.emailHelp} error={message("email")} errorPrefix={t.common.error}>
          {(control) => <input {...control} name="mail" type="email" autoComplete="email" aria-required="true" />}
        </FormField>
        <FormField id={fieldId("bio")} label={t.register.bio} help={t.register.bioHelp} error={message("bio")} errorPrefix={t.common.error}>
          {(control) => <textarea {...control} name="biographie" rows={3} className={`${control.className} resize-y`} />}
        </FormField>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inscription-espece" className="text-[15px] font-semibold">
            {t.register.species}
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
          label={t.register.password}
          help={t.register.passwordHelp}
          error={message("password")}
          errorPrefix={t.common.error}
        >
          {(control) => (
            <input {...control} name="password" type="password" autoComplete="new-password" aria-required="true" />
          )}
        </FormField>
        <FormField id={fieldId("confirm")} label={t.register.confirm} error={message("confirm")} errorPrefix={t.common.error}>
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
              {t.common.error} {t.register.errors.server}
            </span>
          </p>
        )}
        <Button type="submit" size="lg">
          {t.register.submit}
        </Button>
      </form>
      <p className="m-0 rounded-xl bg-surface px-4 py-3.5 text-center">
        {t.register.alreadyAccount}{" "}
        <Link href={ROUTES.login} className="font-semibold text-link">
          {t.shell.login}
        </Link>
      </p>
    </div>
  );
}
