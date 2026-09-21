import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const { t } = useTranslation();
  return (
    <div className={`${PAGE_SHELL} max-w-lg lg:max-w-lg`}>
      <h1 className={PAGE_TITLE}>{t("contact.title")}</h1>
      <p className="text-body mb-4 text-muted-foreground sm:mb-6">
        {t("contact.description")}
      </p>
      <a
        href="mailto:toavinasylvianno14@gmail.com"
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
      >
        {t("contact.email", { email: "toavinasylvianno14@gmail.com" })}
      </a>
    </div>
  );
};

export default ContactPage;
