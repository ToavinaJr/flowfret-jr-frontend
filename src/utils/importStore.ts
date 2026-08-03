import type { ImportedSong } from "@/types/song";

let song: ImportedSong | null = null;
let version = 0;

export function setImportedSong(next: ImportedSong): void {
  song = next;
  version += 1;
}

export function getImportedSong(): ImportedSong | null {
  return song;
}

export function getImportVersion(): number {
  return version;
}

export function clearImportedSong(): void {
  song = null;
}
