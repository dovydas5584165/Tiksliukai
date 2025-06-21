import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      <Image 
        src="/logo.svg" 
        alt="Tiksliukai logo" 
        width={120} 
        height={120} 
        className="mb-6"
      />

      <h1 className="text-5xl font-bold mb-4 text-center text-blue-800">
        Tiksliukai.lt
      </h1>

      <p className="text-xl text-gray-700 mb-8 text-center max-w-xl">
        Community for students in quantitative economics, math, statistics. 
        Learn, connect, and grow your skills.
      </p>

      <a 
        href="#join" 
        className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg hover:bg-blue-700 transition"
      >
        Join the community
      </a>

      <footer className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Tiksliukai.lt
      </footer>
    </main>
  );
}
