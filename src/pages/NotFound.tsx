import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:mb-4 sm:text-4xl">
          404
        </h1>
        <p className="mb-4 text-base text-muted-foreground sm:text-xl">
          {t("notFound.message")}
        </p>
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center text-primary underline hover:text-primary/90"
        >
          {t("notFound.backHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
