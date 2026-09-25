import { Guitar } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Guitar className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-display text-lg text-foreground">FlowFret</span>
      </div>

      <div className="mb-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        {title}
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
