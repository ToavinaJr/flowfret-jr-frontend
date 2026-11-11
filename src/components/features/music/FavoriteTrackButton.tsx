import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { MusicTrack } from "@/types/music";
import { fetchFavoriteMusic, setTrackFavorite } from "@/services/favoriteMusicApi";

export const FAVORITE_MUSIC_QUERY_KEY = ["favorite-music"];

export function FavoriteTrackButton({ track, className = "" }: { track: MusicTrack; className?: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const favorites = useQuery({ queryKey: FAVORITE_MUSIC_QUERY_KEY, queryFn: fetchFavoriteMusic });
  const mutation = useMutation({
    mutationFn: (favorite: boolean) => setTrackFavorite(track, favorite),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FAVORITE_MUSIC_QUERY_KEY });
    },
    onError: () => toast.error(t("favorites.updateFailed")),
  });
  const isFavorite = favorites.data?.some((item) =>
    item.provider === track.provider && item.providerTrackId === track.providerTrackId,
  ) ?? false;

  return (
    <button
      type="button"
      onClick={() => mutation.mutate(!isFavorite)}
      disabled={mutation.isPending || favorites.isError || favorites.isLoading}
      aria-label={t(isFavorite ? "favorites.removeNamed" : "favorites.addNamed", { title: track.title })}
      aria-pressed={isFavorite}
      title={t(isFavorite ? "favorites.remove" : "favorites.add")}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${isFavorite ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground"} ${className}`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
    </button>
  );
}
