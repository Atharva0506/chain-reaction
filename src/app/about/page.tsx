import Head from 'next/head'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Head>
        <title>About Chain Reaction</title>
        <meta name="description" content="Learn more about the Chain Reaction game" />
      </Head>

      <main className="text-center p-8 max-w-4xl">
        <h1 className="text-5xl font-bold text-gray-800 mb-6 animate-fadeIn">
          About Chain Reaction
        </h1>

        <section className="text-left">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Getting Started</h2>
          <p className="text-lg text-gray-600 mb-4">
            This is a Next.js project bootstrapped with <code>create-next-app</code>.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            First, run the development server:
          </p>
          <pre className="bg-gray-200 p-4 rounded mb-4">
            <code>
              npm run dev<br />
              # or<br />
              yarn dev<br />
              # or<br />
              pnpm dev<br />
              # or<br />
              bun dev
            </code>
          </pre>
          <p className="text-lg text-gray-600 mb-4">
            Open <a href="http://localhost:3000" className="text-blue-500 underline">http://localhost:3000</a> with your browser to see the result.
          </p>
        </section>

        <section className="text-left mt-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Rules of the Game</h2>
          <p className="text-lg text-gray-600 mb-4">
            This game is a two-player (Red and Green) board game that can be generalized to any number of players.
          </p>
        </section>

        <section className="text-left mt-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Gameplay</h2>
          <p className="text-lg text-gray-600 mb-4">
            The gameplay takes place on an <code>m x n</code> board, commonly sized as 9 x 6. Each cell in the board has a critical mass, defined as the number of orthogonally adjacent cells. For typical cells, the critical mass is 4; for cells on the edge, it's 3, and for corner cells, it's 2.
          </p>
        </section>

        <section className="text-left mt-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Setup</h2>
          <p className="text-lg text-gray-600 mb-4">
            All cells start as empty. Players take turns placing "orbs" of their respective colors. The Red player can only place red orbs in empty cells or cells containing one or more red orbs. When multiple orbs are placed in a cell, they stack.
          </p>
        </section>

        <section className="text-left mt-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Explosion Mechanism</h2>
          <p className="text-lg text-gray-600 mb-4">
            When a cell's orb count reaches its critical mass, it explodes. The explosion distributes one orb to each orthogonally adjacent cell, and the exploding cell loses orbs equal to its critical mass. The explosions may cause adjacent cells to overload, triggering a chain reaction of explosions until stability is achieved.
          </p>
        </section>

        <section className="text-left mt-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Conversion Rule</h2>
          <p className="text-lg text-gray-600 mb-4">
            When a red cell explodes near green cells, the green cells turn red, and vice versa. This conversion follows the same explosion rules.
          </p>
        </section>

        <section className="text-left mt-8">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Winning Condition</h2>
          <p className="text-lg text-gray-600 mb-4">
            The game concludes when a player eliminates all orbs belonging to the other players. The remaining player is declared the winner.
          </p>
        </section>
      </main>

      <footer className="mt-auto py-4">
        <p className="text-gray-500">
          © {new Date().getFullYear()} Chain Reaction. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

