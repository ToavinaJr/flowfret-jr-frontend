import { Music2, Radio, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Music2,
    title: "Grilles personnalisées",
    text: "Accédez à vos progressions et diagrams sauvegardés.",
  },
  {
    icon: Radio,
    title: "Pratique en temps réel",
    text: "Tuner, métronome et analyse d’accords synchronisés.",
  },
  {
    icon: Sparkles,
    title: "Progression claire",
    text: "Suivez vos sessions et partagez vos riffs.",
  },
] as const;

export function AuthHighlights() {
  return (
    <ul className="mt-10 space-y-5">
      {HIGHLIGHTS.map((item) => (
        <li key={item.title} className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card/80 ring-1 ring-border">
            <item.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{item.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
