import Image from "next/image";
import Link from "next/link";
import { Zap, BarChart3, Github } from "lucide-react";
import img from "../../public/undraw_people_ka7y.svg";
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Zap className="h-5 w-5" />
            <span>Compumobile</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link
              href="https://github.com/dadario23"
              className="hover:text-gray-300"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </nav>
      </header>

      <div className="h-px w-full bg-gray-800" />

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2">
          <h1 className="text-6xl font-bold mb-4">Tech Repair Store</h1>
          <p className="text-gray-400 mb-8">
            Conectamos tu tecnología, simplificamos tu vida.
          </p>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-black border border-white px-4 py-2 rounded hover:bg-gray-900"
            >
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="https://github.com/dadario23"
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
            >
              <Github className="h-5 w-5" />
              GitHub Repo
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0">
          <Image src={img} alt="Phone mockup showing Sink interface" />
        </div>
      </main>
    </div>
  );
}
