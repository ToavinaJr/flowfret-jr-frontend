import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Smile } from "lucide-react";
import { Picker } from "emoji-picker-element";
import type { EmojiClickEvent } from "emoji-picker-element/shared";
import enEmojiData from "emoji-picker-element-data/en/emojibase/data.json?url";
import frEmojiData from "emoji-picker-element-data/fr/emojibase/data.json?url";

interface EmojiPickerButtonProps {
  onSelect: (emoji: string) => void;
}

// Served from the app origin: the production CSP does not allow a third-party CDN.
const EMOJI_DATA_SOURCES = { en: enEmojiData, fr: frEmojiData } as const;

const PICKER_THEME_VARIABLES =
  "[--background:hsl(var(--popover))] [--border-color:hsl(var(--border))] [--input-border-color:hsl(var(--input))] [--input-font-color:hsl(var(--foreground))] [--input-placeholder-color:hsl(var(--muted-foreground))] [--category-font-color:hsl(var(--muted-foreground))] [--indicator-color:hsl(var(--primary))] [--outline-color:hsl(var(--ring))] [--button-hover-background:hsl(var(--muted))] [--button-active-background:hsl(var(--muted))]";

export function EmojiPickerButton({ onSelect }: EmojiPickerButtonProps) {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const locale = i18n.language.startsWith("fr") ? "fr" : "en";
  const isDark = resolvedTheme === "dark";

  const pickerI18n = useMemo(
    () => ({
      emojiUnsupportedMessage: t("chat.emojiPicker.unsupported"),
      loadingMessage: t("chat.emojiPicker.loading"),
      networkErrorMessage: t("chat.emojiPicker.networkError"),
      regionLabel: t("chat.emojiPicker.region"),
      searchLabel: t("chat.emojiPicker.search"),
      searchDescription: t("chat.emojiPicker.searchDescription"),
      searchResultsLabel: t("chat.emojiPicker.searchResults"),
      categoriesLabel: t("chat.emojiPicker.categoriesLabel"),
      categories: {
        custom: t("chat.emojiPicker.categories.custom"),
        "smileys-emotion": t("chat.emojiPicker.categories.smileys"),
        "people-body": t("chat.emojiPicker.categories.people"),
        "animals-nature": t("chat.emojiPicker.categories.animals"),
        "food-drink": t("chat.emojiPicker.categories.food"),
        "travel-places": t("chat.emojiPicker.categories.travel"),
        activities: t("chat.emojiPicker.categories.activities"),
        objects: t("chat.emojiPicker.categories.objects"),
        symbols: t("chat.emojiPicker.categories.symbols"),
        flags: t("chat.emojiPicker.categories.flags"),
      },
      favoritesLabel: t("chat.emojiPicker.favorites"),
      skinToneLabel: t("chat.emojiPicker.skinTone"),
      skinTonesLabel: t("chat.emojiPicker.skinTonesLabel"),
      skinToneDescription: t("chat.emojiPicker.skinToneDescription"),
      skinTones: [
        t("chat.emojiPicker.skinTones.default"),
        t("chat.emojiPicker.skinTones.light"),
        t("chat.emojiPicker.skinTones.mediumLight"),
        t("chat.emojiPicker.skinTones.medium"),
        t("chat.emojiPicker.skinTones.mediumDark"),
        t("chat.emojiPicker.skinTones.dark"),
      ],
    }),
    [t],
  );

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = panelRef.current;
    if (!open || !container) return;
    const picker = new Picker({
      locale,
      dataSource: EMOJI_DATA_SOURCES[locale],
      i18n: pickerI18n,
    });
    picker.classList.add(isDark ? "dark" : "light");
    const handleEmojiClick = (event: EmojiClickEvent) => {
      if (event.detail.unicode) onSelectRef.current(event.detail.unicode);
    };
    picker.addEventListener("emoji-click", handleEmojiClick);
    container.replaceChildren(picker);
    return () => {
      picker.removeEventListener("emoji-click", handleEmojiClick);
      picker.remove();
    };
  }, [open, locale, pickerI18n, isDark]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node) {
        if (rootRef.current?.contains(event.target)) return;
        if (dialogRef.current?.contains(event.target)) return;
      }
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const placeDialog = () => {
      const trigger = triggerRef.current;
      const dialog = dialogRef.current;
      if (!trigger || !dialog) return;
      const triggerBounds = trigger.getBoundingClientRect();
      const dialogBounds = dialog.getBoundingClientRect();
      const margin = 8;
      const left = Math.min(
        window.innerWidth - dialogBounds.width - margin,
        Math.max(margin, triggerBounds.left),
      );
      const above = triggerBounds.top - dialogBounds.height - 12;
      const top = above >= margin
        ? above
        : Math.max(
            margin,
            Math.min(
              window.innerHeight - dialogBounds.height - margin,
              triggerBounds.bottom + 12,
            ),
          );
      setPosition({ left, top });
    };
    placeDialog();
    window.addEventListener("resize", placeDialog);
    window.addEventListener("scroll", placeDialog, true);
    return () => {
      window.removeEventListener("resize", placeDialog);
      window.removeEventListener("scroll", placeDialog, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("chat.openEmojiPicker")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Smile className="h-5 w-5" aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <div
              ref={dialogRef}
              role="dialog"
              aria-label={t("chat.emojiPicker.title")}
              className="fixed z-[100] w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/15"
              style={{
                left: position?.left ?? 8,
                top: position?.top ?? 8,
                visibility: position ? "visible" : "hidden",
              }}
            >
              <div
                ref={panelRef}
                className={`h-[min(22rem,calc(100dvh-1rem))] [&>emoji-picker]:h-full [&>emoji-picker]:w-full ${PICKER_THEME_VARIABLES}`}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
