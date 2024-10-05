"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="flex flex-col gap-4 h-full justify-center items-center">
        <span className="text-slate-300 text-3xl font-extrabold">
          Play Chain Reaction Online !!!
        </span>
        <Link href={"/game"} >
          <button className="px-4 py-2 bg-slate-300 text-slate-900 text-2xl font-bold rounded-lg shadow-lg duration-200 hover:text-slate-300 hover:bg-slate-900">
            Play Online
          </button>
        </Link>
      </div>
    </div>
  );
}
