import Image from 'next/image';
import Link from 'next/link';
import DeadlockBlemishedWobbly from '@/components/card-themes/DeadlockBlemishedWobbly';

const games = [
  {
    name: "Deadlock",
    url: "https://deadlock.vlviewer.com",
    description: "Valve's technically unreleased MOBA hybrid.",
    icon: "/Games/Deadlock/Icons/deadlock.png",
    color: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50",
    textColor: "text-amber-100"
  },
  {
    name: "Overwatch",
    url: "https://overwatch.vlviewer.com",
    description: "Blizzard's acclaimed hero shooter.",
    icon: "/Games/Overwatch/Icons/OverwatchIcon.png",
    color: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50",
    textColor: "text-orange-200"
  },
  {
    name: "Apex Legends",
    url: "https://apex.vlviewer.com",
    description: "Respawn's battle royale shooter.",
    icon: "/Games/Apex/Icons/apex.png",
    color: "bg-red-500/10 border-red-500/20 hover:border-red-500/50",
    textColor: "text-red-200"
  }
];

export default function Home() {
  const renderCardContent = (game: typeof games[0]) => (
    <>
      <div className="relative w-24 h-24 mb-6 transition-transform duration-300 group-hover:scale-110 drop-shadow-xl">
        <Image
          src={game.icon}
          alt={`${game.name} Icon`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <h2
        className={`text-2xl font-bold mb-3 ${game.textColor} group-hover:text-white transition-colors`}
        data-keep-upright
      >
        {game.name}
      </h2>

      <p
        className="text-gray-400 text-center text-sm leading-relaxed group-hover:text-gray-300 transition-colors"
        data-keep-upright
      >
        {game.description}
      </p>

      <div
        className="mt-6 flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors"
        data-keep-upright
      >
        {/*
        <span>View</span>
        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
         */}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <header className="bg-gray-800 shadow-md" style={{ backgroundColor: 'var(--bg-header)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex justify-between items-center w-full sm:w-auto">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-400 z-10 pr-2 leading-none"
              >
                Voiceline Viewer
              </Link>
            </div>
            <div className="flex space-x-6 items-center mt-4 sm:mt-0">
              <Link href="/contributors" className="text-gray-300 hover:text-white font-medium transition-colors">
                Contributors
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white font-medium transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl relative z-0">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Pick a Game
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Explore voice lines and interactions from your favorite games.
              Select a game below to start browsing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {games.map((game) => {
              if (game.name === "Deadlock") {
                return (
                  <Link
                    href={game.url}
                    key={game.name}
                    className="group block h-full"
                  >
                    <DeadlockBlemishedWobbly className="h-full rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" enableStaples={false}>
                      <div className="flex flex-col items-center p-8 h-full">
                        {renderCardContent(game)}
                      </div>
                    </DeadlockBlemishedWobbly>
                  </Link>
                );
              }

              return (
                <Link
                  href={game.url}
                  key={game.name}
                  className={`group relative flex flex-col items-center p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${game.color} backdrop-blur-sm`}
                >
                  {renderCardContent(game)}
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-6 mt-12" style={{ backgroundColor: 'var(--bg-footer)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 space-y-3">
            <p className="text-sm">
              Created by <a href="https://mcallbos.co" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Mcall</a>
            </p>
            <p className="pt-2">
              <a href="https://ko-fi.com/mcallbosco" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
                </svg>
                Buy me a coffee
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
