'use client';

import Navigation from '@/app/components/Navigation';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(179deg, rgba(0,0,0,1) 9.2%, rgba(127,16,16,1) 103.9%)' }} />
      <div className="relative z-10">
        <Navigation />
        <main className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-white/85">
            <h1 className="text-3xl font-light text-white mb-4">Terms of Service</h1>
            <div className="space-y-3 text-sm font-light text-white/80">
              <p>By using Promptopiya, you agree not to share, resell, or distribute the purchased digital prompts without permission. All sales are final due to the digital nature of our products.</p>
              <p>Each prompt is licensed for personal and professional use.</p>
              <p>Misuse, redistribution, or copyright infringement may lead to account suspension.</p>
              <p>We reserve the right to update these terms at any time to improve our service.</p>
            </div>
          </div>
          <div className="h-10" />
        </main>
      </div>
    </div>
  );
}
