"use client";

import { useRef, useState } from "react";
import { AlertIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import { useRouter } from "@/i18n/navigation";
import { createArticle, uploadImage } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import { ALLOWED_IMAGE_TYPES, LIMITS } from "@/lib/validation";

const MIN_TEXT = 20;

type Errors = { title?: string; body?: string; image?: string };

/**
 * Ecrire un article (DESIGN.md §9.8) : titre et texte obligatoires, image
 * facultative. Validation a la soumission, focus sur le premier champ en
 * erreur. L'article prend la langue de l'interface au moment de sa redaction.
 */
export default function ArticleForm() {
  const { t, f, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const userId = useUserId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending || !userId) return;
    const file = fileRef.current?.files?.[0];
    const next: Errors = {};
    if (!title.trim()) next.title = t.editor.errTitle;
    else if (title.trim().length > LIMITS.titre) next.title = t.editor.errTitleLong;
    if (body.trim().length < MIN_TEXT) next.body = t.editor.errText;
    if (
      file &&
      (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type) || file.size > LIMITS.imageBytes)
    ) {
      next.image = t.editor.errImage;
    }

    setErrors(next);
    setFailed(false);
    const first = (["title", "body", "image"] as const).find((field) => next[field]);
    if (first) {
      document.getElementById(`article-${first}`)?.focus();
      return;
    }

    setSending(true);
    try {
      // Image envoyee seulement une fois le formulaire valide : jamais d'image orpheline.
      const imageUrl = file ? (await uploadImage(file)).url : undefined;
      const { id } = await createArticle({ titre: title.trim(), texte: body.trim(), userId, imageUrl, langue: locale });
      toast(t.editor.posted);
      router.push(ROUTES.article(id));
    } catch {
      setFailed(true);
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
      <PageTitle>{t.titles.new}</PageTitle>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-[18px] rounded-2xl bg-form p-7 shadow-md"
      >
        <p className="m-0 text-sm">{t.editor.starRequired}</p>
        <FormField id="article-title" label={t.editor.title} error={errors.title} errorPrefix={t.common.error}>
          {(control) => (
            <input {...control} value={title} onChange={(event) => setTitle(event.target.value)} aria-required="true" />
          )}
        </FormField>
        <FormField
          id="article-body"
          label={t.editor.text}
          help={f(t.editor.textHelp, { count: body.trim().length })}
          error={errors.body}
          errorPrefix={t.common.error}
        >
          {(control) => (
            <textarea
              {...control}
              rows={8}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              aria-required="true"
              className={`${control.className} resize-y`}
            />
          )}
        </FormField>
        <FormField id="article-image" label={t.editor.image} help={t.editor.imageHelp} error={errors.image} errorPrefix={t.common.error}>
          {(control) => (
            <input
              {...control}
              ref={fileRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="min-h-11 max-w-full text-ink file:me-3 file:min-h-11 file:cursor-pointer file:rounded-[10px] file:border-[1.5px] file:border-brand file:bg-surface file:px-4 file:font-semibold file:text-ink"
            />
          )}
        </FormField>
        {failed && (
          <p
            role="alert"
            className="m-0 flex items-start gap-2.5 rounded-[10px] bg-danger-bg px-3.5 py-3 text-[15px] font-semibold text-danger-ink"
          >
            <AlertIcon className="mt-px shrink-0" />
            <span>
              {t.common.error} {t.editor.failed}
            </span>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            {t.editor.publish}
          </Button>
          <ButtonLink href={ROUTES.myArticles} variant="secondary" size="lg">
            {t.common.cancel}
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
