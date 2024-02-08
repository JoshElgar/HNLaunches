import Head from "next/head";
import LaunchesGrid from "./LaunchesGrid";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="icon" href="/hnlaunches/src/app/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <LaunchesGrid />
      </main>
    </>
  );
}
