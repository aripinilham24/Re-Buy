import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col justify-center items-center gap-10">
        <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-300 to-green-800">Selamat Datang di Re:Buy</h1>
        <button className="text-white text-2xl p-3 border border-green-500 rounded bg-green-800 hover:bg-green-700">
          <Link href={"/login"}>Login</Link>
        </button>
      </div>
    </main>
  );
}
