import Image from "next/image";
import LaunchesGrid from "./LaunchesGrid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 sm:p-12">
      <p className="mb-8 z-0">
        Every "Launch HN", chronologically, coloured by points.
      </p>
      <LaunchesGrid />
    </main>
  );
}
