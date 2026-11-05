import { Maximize2, Minus, Move, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FloatingPanelWindowProps {
  windowId: "lyrics" | "chords" | "youtube-video" | "chat-compose";
  isAdmin?: boolean;
  sidebarCollapsed?: boolean;
  title: string;
  zIndex: number;
  minimized: boolean;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  children: ReactNode;
}

const MIN_WIDTH = 260;
const MIN_HEIGHT = 180;
const MOBILE_RESERVED_HEIGHT = 150;
const DESKTOP_RESERVED_HEIGHT = 88;
type ResizeEdge = "top" | "right" | "bottom" | "left" | "corner";

function getWorkspaceLeft(isAdmin: boolean, sidebarCollapsed: boolean): number {
  if (typeof window === "undefined" || window.innerWidth < 768) return 0;
  if (isAdmin) return window.innerWidth >= 1024 ? 256 : 0;
  if (window.innerWidth >= 1024) return sidebarCollapsed ? 64 : 288;
  return sidebarCollapsed ? 64 : 256;
}

function defaultBounds(windowId: FloatingPanelWindowProps["windowId"], isAdmin: boolean, sidebarCollapsed: boolean): WindowBounds {
  if (typeof window === "undefined") return { x: 16, y: 16, width: 380, height: 520 };
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const workspaceLeft = getWorkspaceLeft(isAdmin, sidebarCollapsed);
  const availableWidth = Math.max(1, viewportWidth - workspaceLeft - 24);
  const sideBySide = availableWidth >= MIN_WIDTH * 2 + 36;
  const maxWidth = windowId === "youtube-video" ? 640 : 440;
  const width = Math.min(maxWidth, Math.max(220, sideBySide && windowId !== "youtube-video" ? Math.floor((availableWidth - 36) / 2) : availableWidth));
  const availableHeight = viewportHeight - (viewportWidth < 768 ? MOBILE_RESERVED_HEIGHT : DESKTOP_RESERVED_HEIGHT) - 32;
  const height = windowId === "youtube-video"
    ? Math.min(430, Math.max(MIN_HEIGHT, Math.floor(availableHeight)))
    : Math.min(460, Math.max(MIN_HEIGHT, Math.floor((availableHeight - (sideBySide ? 0 : 12)) / (sideBySide ? 1 : 2))));
  const bottom = viewportHeight - (viewportWidth < 768 ? MOBILE_RESERVED_HEIGHT : DESKTOP_RESERVED_HEIGHT) - 12;
  return {
    x: windowId === "youtube-video"
      ? Math.max(workspaceLeft + 12, workspaceLeft + Math.floor((availableWidth - width) / 2))
      : sideBySide && (windowId === "lyrics" || windowId === "chat-compose") ? viewportWidth - width - 12 : workspaceLeft + 12,
    y: sideBySide || windowId === "lyrics" || windowId === "chat-compose"
      ? bottom - height
      : bottom - height * 2 - 12,
    width,
    height,
  };
}

function clampBounds(bounds: WindowBounds, isAdmin: boolean, sidebarCollapsed: boolean, minimized = false): WindowBounds {
  if (typeof window === "undefined") return bounds;
  const viewportWidth = Math.max(1, window.innerWidth);
  const viewportHeight = Math.max(1, window.innerHeight);
  const workspaceLeft = getWorkspaceLeft(isAdmin, sidebarCollapsed);
  const horizontalInset = Math.min(8, viewportWidth / 2);
  const verticalInset = Math.min(8, viewportHeight / 2);
  const maxWidth = Math.max(1, viewportWidth - horizontalInset * 2);
  const minWidth = Math.min(MIN_WIDTH, maxWidth);
  const width = Math.min(maxWidth, Math.max(minWidth, bounds.width));
  const reservedHeight = Math.min(
    viewportWidth < 768 ? MOBILE_RESERVED_HEIGHT : DESKTOP_RESERVED_HEIGHT,
    viewportHeight / 3,
  );
  const maxHeight = Math.max(1, viewportHeight - verticalInset * 2 - reservedHeight);
  const minHeight = Math.min(MIN_HEIGHT, maxHeight);
  const height = Math.min(maxHeight, Math.max(minHeight, bounds.height));
  const minX = Math.min(
    viewportWidth < 768 ? horizontalInset : workspaceLeft + 8,
    viewportWidth - horizontalInset - width,
  );
  const maxX = Math.max(minX, viewportWidth - horizontalInset - width);
  const minY = verticalInset;
  const visibleHeight = minimized ? Math.min(54, height) : height;
  const maxY = Math.max(minY, viewportHeight - verticalInset - reservedHeight - visibleHeight);
  return {
    x: Math.min(maxX, Math.max(minX, bounds.x)),
    y: Math.min(maxY, Math.max(minY, bounds.y)),
    width,
    height,
  };
}

function resizeBounds(
  bounds: WindowBounds,
  edge: ResizeEdge,
  deltaX: number,
  deltaY: number,
  isAdmin: boolean,
  sidebarCollapsed: boolean,
): WindowBounds {
  const fromLeft = edge === "left";
  const fromTop = edge === "top";
  const widthDelta = fromLeft ? -deltaX : edge === "right" || edge === "corner" ? deltaX : 0;
  const heightDelta = fromTop ? -deltaY : edge === "bottom" || edge === "corner" ? deltaY : 0;
  const constrained = clampBounds(
    {
      ...bounds,
      width: bounds.width + widthDelta,
      height: bounds.height + heightDelta,
    },
    isAdmin,
    sidebarCollapsed,
  );
  return clampBounds({
    ...constrained,
    x: fromLeft ? bounds.x + bounds.width - constrained.width : bounds.x,
    y: fromTop ? bounds.y + bounds.height - constrained.height : bounds.y,
  }, isAdmin, sidebarCollapsed);
}

function readBounds(windowId: FloatingPanelWindowProps["windowId"], isAdmin: boolean, sidebarCollapsed: boolean): WindowBounds {
  const fallback = clampBounds(defaultBounds(windowId, isAdmin, sidebarCollapsed), isAdmin, sidebarCollapsed);
  try {
    const raw = window.localStorage.getItem(`flowfret.media-window.${windowId}.v1`);
    if (!raw) return fallback;
    const stored: unknown = JSON.parse(raw);
    if (!stored || typeof stored !== "object") return fallback;
    const candidate = stored as Partial<WindowBounds>;
    if (![candidate.x, candidate.y, candidate.width, candidate.height].every((value) => typeof value === "number" && Number.isFinite(value))) return fallback;
    return clampBounds(candidate as WindowBounds, isAdmin, sidebarCollapsed);
  } catch {
    return fallback;
  }
}

export function FloatingPanelWindow({
  windowId,
  isAdmin = false,
  sidebarCollapsed = false,
  title,
  zIndex,
  minimized,
  onClose,
  onFocus,
  onMinimize,
  children,
}: FloatingPanelWindowProps) {
  const { t } = useTranslation();
  const [bounds, setBounds] = useState(() => readBounds(windowId, isAdmin, sidebarCollapsed));
  const interaction = useRef<{
    mode: "move" | ResizeEdge;
    pointerX: number;
    pointerY: number;
    bounds: WindowBounds;
  } | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(`flowfret.media-window.${windowId}.v1`, JSON.stringify(bounds));
    } catch {
      // Window positioning is still available when browser storage is unavailable.
    }
  }, [bounds, windowId]);

  useLayoutEffect(() => {
    const constrain = () => setBounds((current) => clampBounds(current, isAdmin, sidebarCollapsed, minimized));
    window.addEventListener("resize", constrain);
    constrain();
    return () => window.removeEventListener("resize", constrain);
  }, [isAdmin, sidebarCollapsed, minimized]);

  function startInteraction(event: PointerEvent<HTMLElement>, mode: "move" | ResizeEdge) {
    if (
      mode === "move" &&
      event.target instanceof Element &&
      event.target.closest(
        "button, a, input, textarea, select, [contenteditable='true'], [data-no-window-drag]",
      )
    ) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    interaction.current = {
      mode,
      pointerX: event.clientX,
      pointerY: event.clientY,
      bounds,
    };
    onFocus();
  }

  function updateInteraction(event: PointerEvent<HTMLElement>) {
    const current = interaction.current;
    if (!current) return;
    const deltaX = event.clientX - current.pointerX;
    const deltaY = event.clientY - current.pointerY;
    const next = current.mode === "move"
      ? clampBounds({ ...current.bounds, x: current.bounds.x + deltaX, y: current.bounds.y + deltaY }, isAdmin, sidebarCollapsed, minimized)
      : resizeBounds(current.bounds, current.mode, deltaX, deltaY, isAdmin, sidebarCollapsed);
    setBounds(next);
  }

  function moveToNextCorner() {
    setBounds((current) => {
      if (typeof window === "undefined") return current;
      const right = current.x + current.width > window.innerWidth / 2;
      const visibleHeight = minimized ? Math.min(54, current.height) : current.height;
      const bottom = current.y + visibleHeight / 2 > window.innerHeight / 2;
      const reservedHeight = window.innerWidth < 768 ? MOBILE_RESERVED_HEIGHT : DESKTOP_RESERVED_HEIGHT;
      const next = { ...current, x: right ? 12 : window.innerWidth - current.width - 12, y: bottom ? 12 : window.innerHeight - visibleHeight - reservedHeight };
      return clampBounds(next, isAdmin, sidebarCollapsed, minimized);
    });
    onFocus();
  }

  function resizeWithKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>, edge: ResizeEdge) {
    const direction = {
      ArrowUp: { x: 0, y: -1 },
      ArrowRight: { x: 1, y: 0 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
    }[event.key];
    if (!direction) return;
    if ((edge === "left" || edge === "right") && direction.y !== 0) return;
    if ((edge === "top" || edge === "bottom") && direction.x !== 0) return;
    event.preventDefault();
    const delta = event.shiftKey ? 48 : 16;
    setBounds((current) => resizeBounds(
      current,
      edge,
      direction.x * delta,
      direction.y * delta,
      isAdmin,
      sidebarCollapsed,
    ));
  }

  return (
    <section
      id={`floating-media-window-${windowId}`}
      role="dialog"
      aria-label={title}
      aria-modal="false"
      onPointerDown={(event) => startInteraction(event, "move")}
      onPointerMove={updateInteraction}
      onPointerUp={() => { interaction.current = null; }}
      onPointerCancel={() => { interaction.current = null; }}
      onFocusCapture={onFocus}
      className="fixed flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-2xl"
      style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: minimized ? Math.min(54, bounds.height) : bounds.height, zIndex }}
    >
      <header
        className="flex min-h-[52px] shrink-0 cursor-move touch-none items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2"
      >
        <h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={moveToNextCorner} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("mediaPlayer.moveWindow")} title={t("mediaPlayer.moveWindow")}>
            <Move className="h-4 w-4" />
          </button>
          <button type="button" onClick={onMinimize} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={minimized ? t("mediaPlayer.restoreWindow") : t("mediaPlayer.minimizeWindow")} title={minimized ? t("mediaPlayer.restoreWindow") : t("mediaPlayer.minimizeWindow")}>
            {minimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("mediaPlayer.closeWindow")} title={t("mediaPlayer.closeWindow")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      {!minimized ? <div className="min-h-0 flex-1 overflow-auto">{children}</div> : null}
      {!minimized ? (
        <>
          <button type="button" data-resize-edge="top" onPointerDown={(event) => startInteraction(event, "top")} onKeyDown={(event) => resizeWithKeyboard(event, "top")} className="absolute left-5 right-5 top-0 z-10 h-2 cursor-n-resize touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("mediaPlayer.resizeWindowTop")} title={t("mediaPlayer.resizeWindowTop")} />
          <button type="button" data-resize-edge="right" onPointerDown={(event) => startInteraction(event, "right")} onKeyDown={(event) => resizeWithKeyboard(event, "right")} className="absolute bottom-5 right-0 top-5 z-10 w-2 cursor-e-resize touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("mediaPlayer.resizeWindowRight")} title={t("mediaPlayer.resizeWindowRight")} />
          <button type="button" data-resize-edge="bottom" onPointerDown={(event) => startInteraction(event, "bottom")} onKeyDown={(event) => resizeWithKeyboard(event, "bottom")} className="absolute bottom-0 left-5 right-5 z-10 h-2 cursor-s-resize touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("mediaPlayer.resizeWindowBottom")} title={t("mediaPlayer.resizeWindowBottom")} />
          <button type="button" data-resize-edge="left" onPointerDown={(event) => startInteraction(event, "left")} onKeyDown={(event) => resizeWithKeyboard(event, "left")} className="absolute bottom-5 left-0 top-5 z-10 w-2 cursor-w-resize touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("mediaPlayer.resizeWindowLeft")} title={t("mediaPlayer.resizeWindowLeft")} />
        <button
          type="button"
          data-resize-edge="corner"
          onPointerDown={(event) => startInteraction(event, "corner")}
          onKeyDown={(event) => resizeWithKeyboard(event, "corner")}
          className="absolute bottom-0 right-0 z-10 h-7 w-7 cursor-nwse-resize touch-none rounded-tl-lg text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("mediaPlayer.resizeWindow")}
          title={t("mediaPlayer.resizeWindow")}
        >
          <span aria-hidden="true" className="text-xs">↘</span>
        </button>
        </>
      ) : null}
    </section>
  );
}
