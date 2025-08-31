'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from 'cosmic-authentication';

export default function PromptEnhancer() {
  const { isAuthenticated, signIn } = useAuth();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [userCredits, setUserCredits] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCredits = async (): Promise<number> => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const c = data.credits || 0;
        setUserCredits(c);
        return c;
      }
    } catch (err) {
      console.error('Error fetching user credits:', err);
    }
    return userCredits;
  };

  const typeText = (text: string) => {
    setDisplayedOutput('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedOutput(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);
  };

  const enhancePrompt = async () => {
    if (!input.trim()) return;

    if (!isAuthenticated) {
      signIn();
      return;
    }

    // Check if user has sufficient credits (fresh value)
    const current = await fetchUserCredits();
    if (current < 0.2) {
      window.location.href = '/pricing';
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.enhancedPrompt);
        setJsonOutput(data.jsonOutput);
        typeText(data.enhancedPrompt);
        const updated = await fetchUserCredits(); // Refresh credits
        // Notify navbar to refresh its credits display
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: updated } }));
      } else {
        const err = await response.json().catch(() => ({ error: 'Enhancement failed' }));
        setError(err.error || 'Enhancement failed. Please try again.');
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      setError('Enhancement failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refinePrompt = async () => {
    if (!output || !input.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: input,
          previousPrompt: output,
          isRefine: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.enhancedPrompt);
        setJsonOutput(data.jsonOutput);
        typeText(data.enhancedPrompt);
        const updated = await fetchUserCredits(); // Refresh credits
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: updated } }));
      } else {
        const err = await response.json().catch(() => ({ error: 'Refinement failed' }));
        setError(err.error || 'Refinement failed. Please try again.');
      }
    } catch (err) {
      console.error('Refinement error:', err);
      setError('Refinement failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-6">
            Prompt <span className="text-red-400">Enhancer</span>
          </h2>
          <p className="text-white/70 font-light max-w-2xl mx-auto">
            Transform your simple ideas into professional XML prompts optimized for cinematic influencer photography.
          </p>
          <div className="mt-4 text-red-400 text-sm font-light">
            <Icon icon="icon-park:credit" className="inline w-4 h-4 mr-1" />
            Costs 0.2 credits per enhancement
          </div>
        </motion.div>

        {/* Enhancement Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
        >
          {/* Input Section */}
          <div className="space-y-4 mb-8">
            <label className="block text-white font-light text-lg">
              Describe your vision in plain English:
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., A fashion influencer in a modern studio with dramatic lighting, wearing elegant clothing, professional portrait style..."
              className="w-full h-32 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-light"
            />
            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 font-light">
                {error}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={enhancePrompt}
                disabled={isLoading || !input.trim()}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all font-light flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    <span>Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:magic-staff" className="w-5 h-5" />
                    <span>Enhance Prompt</span>
                  </>
                )}
              </button>

              {output && (
                <button
                  onClick={refinePrompt}
                  disabled={isLoading}
                  className="border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 px-6 py-3 rounded-lg transition-all font-light flex items-center justify-center space-x-2"
                >
                  <Icon icon="mdi:refresh" className="w-5 h-5" />
                  <span>Refine</span>
                </button>
              )}
            </div>
          </div>

          {/* Output Section */}
          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* XML Output */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-light text-lg">Enhanced XML Prompt:</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(output)}
                        className="text-white/60 hover:text-red-400 transition-colors"
                        title="Copy XML"
                      >
                        <Icon icon="mdi:content-copy" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadText(output, 'enhanced-prompt.xml')}
                        className="text-white/60 hover:text-red-400 transition-colors"
                        title="Download XML"
                      >
                        <Icon icon="material-symbols:download" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
                    <pre className="p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap font-light">
                      {displayedOutput}
                      {isLoading && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-red-500"
                        >
                          |
                        </motion.span>
                      )}
                    </pre>
                  </div>
                </div>

                {/* JSON Mirror */}
                {jsonOutput && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-light text-lg">JSON Mirror:</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(jsonOutput)}
                          className="text-white/60 hover:text-red-400 transition-colors"
                          title="Copy JSON"
                        >
                          <Icon icon="mdi:content-copy" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => downloadText(jsonOutput, 'enhanced-prompt.json')}
                          className="text-white/60 hover:text-red-400 transition-colors"
                          title="Download JSON"
                        >
                          <Icon icon="material-symbols:download" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-lg border border-white/10">
                      <pre className="p-4 text-sm text-blue-400 font-mono overflow-x-auto font-light">
                        {JSON.stringify(JSON.parse(jsonOutput), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Usage Tips */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-light text-sm mb-2">💡 Usage Tips:</h4>
                  <ul className="text-white/70 text-xs font-light space-y-1">
                    <li>• Use the XML format for most AI image generators</li>
                    <li>• JSON format is perfect for API integrations</li>
                    <li>• Both outputs are optimized for 1:1 aspect ratio and character consistency</li>
                    <li>• Click &apos;Refine&apos; to improve the prompt with additional context</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAuthenticated && (
            <div className="text-center py-8">
              <Icon icon="mdi:lock-outline" className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 font-light mb-4">Sign in to use the Prompt Enhancer</p>
              <button
                onClick={signIn}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg transition-all font-light"
              >
                Sign In
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}