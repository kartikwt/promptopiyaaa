'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Hero() {
  // Typewriter for two separate lines (no deleting)
  const line1Full = 'No studio. No travel. No wardrobe.';
  const line2Full = '100% character consistency.';
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setLine1(line1Full.slice(0, i));
      if (i >= line1Full.length) {
        window.clearInterval(id);
        // Small delay then start line 2
        window.setTimeout(() => {
          let j = 0;
          const id2 = window.setInterval(() => {
            j += 1;
            setLine2(line2Full.slice(0, j));
            if (j >= line2Full.length) window.clearInterval(id2);
          }, 35);
        }, 350);
      }
    }, 30);
    return () => window.clearInterval(id);
  }, []);

  // Hero images crossfade (every ~4.5s)
  const heroImages = useMemo(
    () => [
      'https://images.unsplash.com/photo-1591308390465-1e07cb837d89',
      'https://images.unsplash.com/photo-1552753849-b693d487c6ee',
      'https://images.unsplash.com/photo-1541277045764-f6063c8b4e23',
    ],
    []
  );
  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setImgIndex((i) => (i + 1) % heroImages.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [heroImages.length]);

  return (
    <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden pt-24">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(700px 700px at 85% 15%, rgba(255,0,0,0.18), transparent 60%), radial-gradient(600px 600px at 20% 85%, rgba(255,255,255,0.06), transparent 60%)',
          }}
        />
        {/* Animated floating blobs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,80,80,0.25), transparent 60%)' }}
          animate={{ y: [0, -15, 0], x: [0, 10, 0], opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle at 70% 70%, rgba(255,120,120,0.2), transparent 60%)' }}
          animate={{ y: [0, 12, 0], x: [0, -8, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Left: Heading, tagline, bullets, CTAs */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-[56px] leading-tight tracking-tight bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent font-light"
          >
            Become a fashion influencer for just $10
          </motion.h1>

          {/* Typewriter Tagline (two stacked lines) */}
          <motion.div className="mt-5 space-y-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="text-xl sm:text-2xl lg:text-[26px] text-red-300/90 font-light">
              <span className="whitespace-pre-wrap">{line1}</span>
              {!line2 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="ml-1 text-red-400"
                >
                  |
                </motion.span>
              )}
            </div>
            <div className="text-xl sm:text-2xl lg:text-[26px] text-red-300/90 font-light">
              <span className="whitespace-pre-wrap">{line2}</span>
              {!!line2 && line2.length < line2Full.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="ml-1 text-red-400"
                >
                  |
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Bulleted highlights (keep only the last 3) */}
          <ul className="mt-6 space-y-2 text-white/85">
            <li className="flex items-start gap-3">
              <Icon icon="mdi:sparkles" className="mt-0.5 h-4 w-4 text-red-300" />
              <span className="text-sm font-light">Consistent Characters – Every prompt keeps the same identity.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:video-outline" className="mt-0.5 h-4 w-4 text-white/80" />
              <span className="text-sm font-light">Instant Downloads – Your digital prompt PDFs delivered instantly.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="material-symbols:check-rounded" className="mt-0.5 h-4 w-4 text-red-500" />
              <span className="text-sm font-light">Affordable – Start your influencer journey from just $10.</span>
            </li>
          </ul>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#prompts"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white shadow-[0_0_30px_rgba(255,0,0,0.25)] transition-transform hover:scale-[1.02]"
            >
              Explore Prompts →
            </a>
            <Link
              href="/enhancer"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-white/90 hover:border-white hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-transform hover:scale-[1.02]"
            >
              Try Enhancer (Free 20 Credits)
            </Link>
          </div>
        </div>

        {/* Right: Crossfading square images with subtle Ken Burns */}
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur-md">
          <div className="absolute inset-0">
            <AnimatePresence initial={false} mode="wait">
              {heroImages.map((src, i) =>
                i === imgIndex ? (
                  <motion.img
                    key={src}
                    src={src}
                    alt={`cinematic fashion ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                ) : null
              )}
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}