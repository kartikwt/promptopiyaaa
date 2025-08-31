'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from 'cosmic-authentication';

interface Prompt {
  id: string;
  title: string;
  description: string;
  subcategory: string;
  thumbnailUrl: string;
  price: number;
}

interface PromptDetail extends Prompt {
  thumbnailUrls?: string[];
}

interface BuyModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (promptId: string) => Promise<void>;
  userCredits: number;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

const BuyModal = ({ prompt, isOpen, onClose, onBuy, userCredits, isAuthenticated, onSignIn }: BuyModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [detail, setDetail] = useState<PromptDetail | null>(null);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!prompt) return;
      setLoading(true);
      try {
        const [dRes, oRes] = await Promise.all([
          fetch(`/api/prompt?id=${encodeURIComponent(prompt.id)}`),
          fetch(`/api/purchases/check?promptId=${encodeURIComponent(prompt.id)}`)
        ]);
        if (dRes.ok) {
          const d = await dRes.json();
          setDetail(d);
          setActiveImg(d.thumbnailUrls?.[0] || d.thumbnailUrl || prompt.thumbnailUrl);
        } else {
          setDetail({ ...prompt });
          setActiveImg(prompt.thumbnailUrl);
        }
        if (oRes.ok) {
          const o = await oRes.json();
          setOwned(Boolean(o.owned));
        }
      } catch {
        setDetail({ ...prompt });
        setActiveImg(prompt.thumbnailUrl);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen && prompt) void load();
  }, [isOpen, prompt]);

  const handleBuy = async () => {
    if (!prompt) return;
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    if (owned) {
      const res = await fetch(`/api/prompts/download-link?promptId=${encodeURIComponent(prompt.id)}`);
      if (res.ok) {
        const data = await res.json();
        const a = document.createElement('a');
        a.href = data.url as string;
        a.download = '';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setToast('✅ Download starting… added to Library!');
      }
      return;
    }

    if (userCredits < 1) {
      window.location.href = '/pricing';
      return;
    }

    setIsProcessing(true);
    try {
      await onBuy(prompt.id);
      setOwned(true);
      setToast('✅ Download starting… added to Library!');
      onClose();
    } catch {
      // noop
    } finally {
      setIsProcessing(false);
    }
  };

  if (!prompt) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-red-500/30 bg-black/90 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-start justify-between p-5">
                <div>
                  <h3 className="text-xl font-medium text-white">{prompt.title}</h3>
                  <span className="mt-1 inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-light text-red-300">
                    {prompt.subcategory}
                  </span>
                </div>
                <button onClick={onClose} className="text-white/60 transition-colors hover:text-white">
                  <Icon icon="mdi:close" className="h-6 w-6" />
                </button>
              </div>

              {/* Body */}
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {/* Main image */}
                <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  {loading ? (
                    <div className="h-full w-full animate-pulse bg-white/10" />
                  ) : (
                    <img
                      src={activeImg || prompt.thumbnailUrl}
                      alt={prompt.title}
                      className="h-full w-full cursor-pointer object-cover"
                      onClick={() => setLightbox(true)}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Details */}
                <div className="flex flex-col">
                  <p className="mb-3 text-sm font-light text-white/80">
                    {detail?.description || prompt.description}
                  </p>

                  {/* Thumbnails row */}
                  <div className="mb-4 flex gap-2">
                    {(detail?.thumbnailUrls || [prompt.thumbnailUrl]).slice(0, 3).map((u) => (
                      <button
                        key={u}
                        aria-label="preview"
                        onClick={() => setActiveImg(u)}
                        className={`aspect-square w-16 overflow-hidden rounded-md border ${
                          activeImg === u ? 'border-red-400' : 'border-white/10'
                        }`}
                      >
                        <img src={u} alt="thumb" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-auto space-y-2">
                    <div className="text-xs font-light text-white/60">This prompt costs 1 Credit</div>
                    {!isAuthenticated ? (
                      <button
                        onClick={onSignIn}
                        className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 font-light text-white transition-transform hover:scale-[1.01]"
                      >
                        Sign In to Purchase
                      </button>
                    ) : (
                      <button
                        onClick={handleBuy}
                        disabled={isProcessing}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 font-light text-white shadow-[0_0_30px_rgba(255,0,0,0.25)] transition-transform hover:scale-[1.01] disabled:opacity-60"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Processing...
                          </>
                        ) : owned ? (
                          <>
                            <Icon icon="material-symbols:download" className="h-5 w-5" />
                            Download PDF
                          </>
                        ) : (
                          <>
                            <Icon icon="icon-park:credit" className="h-5 w-5" />
                            Buy for 1 Credit
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed bottom-6 left-1/2 z-[60] w-[90%] max-w-sm -translate-x-1/2 rounded-lg border border-white/15 bg-black/80 px-4 py-3 text-sm text-white shadow-lg"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
              {lightbox && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-black/90"
                    onClick={() => setLightbox(false)}
                  />
                  <motion.img
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    src={activeImg || prompt.thumbnailUrl}
                    alt="preview"
                    className="fixed inset-0 z-[71] m-auto max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function PromptGrid() {
  const { isAuthenticated, signIn } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [userCredits, setUserCredits] = useState(0);

  const categories = ['All', 'Cinematic Portrait', 'Fashion Shoot', 'Studio', 'With Celebrity', 'Art'];

  useEffect(() => {
    fetchPrompts();
    if (isAuthenticated) {
      fetchUserCredits();
    }
  }, [isAuthenticated]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handleBuyPrompt = async (promptId: string) => {
    try {
      // Purchase then trigger download silently without opening a new tab
      const response = await fetch('/api/prompts/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptId }),
      });

      if (response.ok) {
        const data: { downloadUrl: string; promptTitle?: string } = await response.json();
        const url = data.downloadUrl;

        // Trigger download programmatically
        const link = document.createElement('a');
        link.href = url;
        // Use filename when available to force download behavior
        if (data.promptTitle) link.download = `${data.promptTitle.replace(/[^a-z0-9-_\\. ]/gi, '_')}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Refresh user credits and notify navbar
        await fetchUserCredits();
        window.dispatchEvent(new CustomEvent('credits-updated'));
      } else {
        const err = await response.json().catch(() => ({}));
        if (err?.error === 'Insufficient credits') {
          window.location.href = '/pricing';
          return;
        }
        throw new Error('Purchase failed');
      }
    } catch {
      console.error('Purchase error');
      throw new Error('purchase_failed');
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'All' || prompt.subcategory === selectedCategory;
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500"></div>
      </div>
    );
  }

  return (
    <section id="prompts" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-6 text-4xl lg:text-5xl font-light text-white">
            Cinematic <span className="text-red-400">Prompt Collection</span>
          </h2>
          <p className="mx-auto max-w-2xl font-light text-white/70">
            Professional-grade prompts crafted exclusively for influencer photography. 
            Each prompt delivers consistent, cinematic results.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative mx-auto max-w-lg">
            <Icon icon="mdi:search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 pl-12 pr-4 py-3 font-light text-white placeholder-white/40 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-light transition-all ${
                  selectedCategory === category
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Prompt Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredPrompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.03, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={prompt.thumbnailUrl}
                  alt={prompt.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-light text-white transition-colors group-hover:text-red-400">
                    {prompt.title}
                  </h3>
                </div>

                <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-light text-red-400">
                  {prompt.subcategory}
                </span>

                <button
                  onClick={() => setSelectedPrompt(prompt)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500/80 to-red-600/80 py-2.5 font-light text-white transition-all duration-300 hover:scale-105 hover:from-red-500 hover:to-red-600"
                >
                  <Icon icon="icon-park:credit" className="h-4 w-4" />
                  <span>Buy for 1 Credit</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredPrompts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <Icon icon="mdi:image-search-outline" className="mx-auto mb-4 h-16 w-16 text-white/40" />
            <p className="font-light text-white/60">No prompts found matching your criteria.</p>
          </motion.div>
        )}
      </div>

      {/* Buy Modal */}
      <BuyModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onBuy={handleBuyPrompt}
        userCredits={userCredits}
        isAuthenticated={isAuthenticated}
        onSignIn={signIn}
      />
    </section>
  );
}