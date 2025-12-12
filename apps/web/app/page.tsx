

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
          Welcome to Bookify
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Your journey to better reading starts here.
        </p>
      </main>
    </div>
  );
}
