import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

const HistoirePage = () => {
  return (
    <div className={`${PAGE_SHELL} max-w-2xl lg:max-w-2xl`}>
      <h1 className={PAGE_TITLE}>History of the Guitar</h1>
      <div className="space-y-4 text-body text-muted-foreground">
        <p>
          The modern six-string guitar evolved from earlier plucked instruments
          across Europe and the Middle East. By the 19th century, Spanish makers
          refined body shape, bracing, and stringing into the classical form we
          recognize today.
        </p>
        <p>
          Steel-string acoustics and electric pickups in the 20th century opened
          blues, jazz, rock, and countless hybrids — while the fretboard itself
          remained a map of the chromatic scale under your fingers.
        </p>
        <p>
          FretFlow continues that lineage digitally: chord diagrams, scales, and
          audio analysis as tools for learning and playing.
        </p>
      </div>
    </div>
  );
};

export default HistoirePage;
