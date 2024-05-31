import Image from "next/image";
import Head from "next/head";
export default function Home() {
  return (
   <main>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Head>
        <title>Chain Reaction</title>
        <meta name="description" content="Chain Reaction game homepage" />
      </Head>

      <main className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-8 animate-bounce">
          Welcome to Chain Reaction!
        </h1>

        <p className="text-xl text-gray-600 mb-8 animate-fadeIn">
          The ultimate chain reaction game. Get ready to experience the most exciting chain reactions!
        </p>

        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
          Start Game
        </button>
        <footer className="mt-auto py-4">
        <p className="text-gray-500">
          © {new Date().getFullYear()} Chain Reaction. All rights reserved.
        </p>
      </footer>
      </main>

      
    </div>
   </main>
  );
}
