import type { ReactNode } from "react";

/**
 * Champ de formulaire (DESIGN.md §9.8) : label visible au-dessus, aide et
 * erreur reliees au champ par aria-describedby, aria-invalid en cas d'erreur.
 * Le champ lui-meme est fourni par `children`, qui recoit les attributs a poser.
 */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  className: string;
};

type FormFieldProps = {
  id: string;
  label: string;
  help?: string;
  /** Message deja traduit, sans le prefixe « Erreur : ». */
  error?: string;
  errorPrefix: string;
  children: (control: FieldControlProps) => ReactNode;
};

/** Champ --surface a bordure --brand (--danger en erreur), 48 px de haut minimum. */
export function fieldClass(invalid: boolean, extra = "") {
  return `w-full min-h-12 rounded-[10px] border-[1.5px] bg-surface px-3.5 py-3 text-ink ${
    invalid ? "border-danger" : "border-brand"
  } ${extra}`;
}

export function FormField({ id, label, help, error, errorPrefix, children }: FormFieldProps) {
  const helpId = help ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        className: fieldClass(Boolean(error)),
      })}
      {help && (
        <p id={helpId} className="m-0 text-sm">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="m-0 text-sm font-semibold text-danger">
          {errorPrefix} {error}
        </p>
      )}
    </div>
  );
}
