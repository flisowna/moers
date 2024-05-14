"use client";
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="relative">
      <nav className="p-4 text-slate-800 bg-[#F8B200] md:px-16 px-4 md:py-8 border-b-2 border-white uppercase flex items-center justify-between">
        <div>
          <a className={`mr-4 ${pathname === "/" ? "text-white border-b" : ""}`} href="/">
            Chat
          </a>
          <a className={`mr-4 ${pathname === "/structured_output" ? "text-white border-b" : ""}`} href="/structured_output">
            Structured Output
          </a>
          <a className={`mr-4 ${pathname === "/agents" ? "text-white border-b" : ""}`} href="/agents">
            Agents
          </a>
          <a className={`mr-4 ${pathname === "/retrieval" ? "text-white border-b" : ""}`} href="/retrieval">
            Retrieval
          </a>
          <a className={`mr-4 ${pathname === "/retrieval_agents" ? "text-white border-b" : ""}`} href="/retrieval_agents">
            Retrieval Agents
          </a>
        </div>
        <div className="absolute right-4 md:right-16 top-9">
          <Image src="/images/logo_moers.svg" alt="Logo" width={246} height={84} />
        </div>
      </nav>
    </div>
  );
}