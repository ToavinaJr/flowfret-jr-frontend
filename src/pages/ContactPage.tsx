import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Linkedin, Mail, MessageCircle } from "lucide-react";
import { submitContactMessage, type ContactMessageInput } from "@/services/contactApi";
import { toast } from "sonner";

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactMessageInput>({ name: "", email: "", subject: "", message: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      await submitContactMessage(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success(t("contact.submitted"));
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  function updateField(field: keyof ContactMessageInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className={`${PAGE_SHELL} max-w-6xl`}>
      <header className="max-w-2xl">
        <h1 className={PAGE_TITLE}>{t("contact.title")}</h1>
        <p className="mt-3 text-body text-muted-foreground">{t("contact.description")}</p>
      </header>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold">{t("contact.formTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              {t("contact.name")}
              <input required maxLength={100} autoComplete="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </label>
            <label className="block text-sm font-medium">
              {t("contact.emailAddress")}
              <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </label>
          </div>
          <label className="block text-sm font-medium">
            {t("contact.subject")}
            <input required maxLength={160} value={form.subject} onChange={(event) => updateField("subject", event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </label>
          <label className="block text-sm font-medium">
            {t("contact.message")}
            <textarea required minLength={10} maxLength={5000} rows={7} value={form.message} onChange={(event) => updateField("message", event.target.value)} className="mt-2 w-full resize-y rounded-md border border-input bg-background p-3 font-normal leading-6 outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{t("contact.submitFailed")}</p>}
          <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-wait disabled:opacity-60">
            {t(pending ? "contact.sending" : "contact.send")}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </form>

        <aside className="space-y-3" aria-label={t("contact.otherWaysTitle")}>
          <h2 className="text-lg font-semibold">{t("contact.otherWaysTitle")}</h2>
          <a href="mailto:toavinasylvianno14@gmail.com" className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-secondary">
            <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0"><span className="block text-sm font-medium">{t("contact.emailLabel")}</span><span className="block break-all text-sm text-muted-foreground">toavinasylvianno14@gmail.com</span></span>
          </a>
          <a href="https://wa.me/261341654007" target="_blank" rel="noreferrer" className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-secondary">
            <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0"><span className="block text-sm font-medium">WhatsApp</span><span className="block text-sm text-muted-foreground">+261 34 16 540 07</span></span>
            <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a href="https://www.linkedin.com/in/randriamihaingoson-toavina-sylvianno/" target="_blank" rel="noreferrer" className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium hover:bg-secondary">
            <Linkedin aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span>LinkedIn</span>
            <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
        </aside>
      </div>
    </section>
  );
};

export default ContactPage;
