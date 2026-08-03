import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

const ContactPage = () => {
  return (
    <div className={`${PAGE_SHELL} max-w-lg lg:max-w-lg`}>
      <h1 className={PAGE_TITLE}>Contact</h1>
      <p className="text-body mb-4 text-muted-foreground sm:mb-6">
        Questions, feedback, or collaboration ideas — we&apos;d love to hear from
        you.
      </p>
      <a
        href="mailto:hello@fretflow.app"
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
      >
        Email hello@fretflow.app
      </a>
    </div>
  );
};

export default ContactPage;
