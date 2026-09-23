const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeEmbedUrl(videoId: string): string | null {
  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
}
