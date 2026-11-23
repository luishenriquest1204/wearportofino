import { useLang, type Lang } from "../i18n";

/** EN / PT switch. The storefront re-renders in the chosen language; the choice is remembered on this device. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  const opt = (l: Lang, label: string, name: string) => (
    <button
      type="button"
      lang={l === "pt" ? "pt-BR" : "en"}
      aria-pressed={lang === l}
      aria-label={name}
      onClick={() => setLang(l)}
      className={`inline-flex min-h-[44px] min-w-[32px] items-center justify-center transition-opacity ${lang === l ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Language / Idioma" className={`t-nav flex items-center gap-1 ${className}`}>
      {opt("en", "EN", "English")}
      <span aria-hidden className="opacity-40">/</span>
      {opt("pt", "PT", "Português")}
    </div>
  );
}
