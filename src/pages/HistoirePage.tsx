import { useTranslation } from "react-i18next";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

const GUITAR_TYPES = [
  {
    id: "classical",
    image: "https://images.unsplash.com/photo-1764493824879-b4c289bb81b5?auto=format&fit=crop&w=900&q=80",
    credit: "Nestor Mehanikov",
    photoUrl: "https://unsplash.com/photos/a-close-up-of-a-classical-guitar-leaning-against-wall-r8k_S3QMwuM",
  },
  {
    id: "acoustic",
    image: "https://images.unsplash.com/photo-1588690224648-20426ab6274a?auto=format&fit=crop&w=900&q=80",
    credit: "Chris Hardy",
    photoUrl: "https://unsplash.com/photos/a-close-up-of-an-acoustic-guitar-on-a-black-background-kXK4dYneOpo",
  },
  {
    id: "electric",
    image: "https://images.unsplash.com/photo-1643386156145-f3bc2a4f527c?auto=format&fit=crop&w=900&q=80",
    credit: "Rombo",
    photoUrl: "https://unsplash.com/photos/a-close-up-of-an-electric-guitar-with-a-black-background-SCYl8mQQlEY",
  },
  {
    id: "bass",
    image: "https://images.unsplash.com/photo-1682349860939-e19d4e187fb3?auto=format&fit=crop&w=900&q=80",
    credit: "Tahiro Achoub",
    photoUrl: "https://unsplash.com/photos/a-black-and-white-photo-of-a-man-playing-a-bass-guitar-ZA8ko7n52Fo",
  },
  {
    id: "electroAcoustic",
    image: "https://images.unsplash.com/photo-1575395861912-72095f32b495?auto=format&fit=crop&w=900&q=80",
    credit: "Markus Spiske",
    photoUrl: "https://unsplash.com/photos/person-playing-acoustic-guitar-LzktGMv4Hv8",
  },
] as const;

const HistoirePage = () => {
  const { t } = useTranslation();
  return (
    <div className={`${PAGE_SHELL} max-w-5xl`}>
      <header className="mb-8 max-w-3xl">
        <h1 className={PAGE_TITLE}>{t("history.title")}</h1>
        <div className="space-y-4 text-body text-muted-foreground">
          <p>{t("history.origins")}</p>
          <p>{t("history.modern")}</p>
          <p>{t("history.flowfret")}</p>
        </div>
      </header>

      <section aria-labelledby="guitar-types-title">
        <div className="mb-5">
          <h2 id="guitar-types-title" className="text-2xl font-semibold text-foreground">
            {t("history.typesTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-body text-muted-foreground">
            {t("history.typesIntro")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {GUITAR_TYPES.map(({ id, image, credit, photoUrl }) => (
            <article key={id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-48 overflow-hidden bg-muted/30">
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground">{t(`history.types.${id}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`history.types.${id}.description`)}</p>
                <a
                  href={photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {t("history.photoCredit", { name: credit })}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
export default HistoirePage;
