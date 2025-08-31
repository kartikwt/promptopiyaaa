'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 bg-black text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm">© {new Date().getFullYear()} Promptopiya</div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
