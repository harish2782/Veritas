
import React, { useState } from 'react';
import { ShieldCheck, Activity, BrainCircuit, AlertTriangle, Link as LinkIcon, Lock } from 'lucide-react';

interface LandingPageProps {
  onStart: (url: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [url, setUrl] = useState('');
  const [consent, setConsent] = useState(false);

  const handleStart = () => {
    if (!consent) return;
    onStart(url || "External Link Provided");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black">
      <div className="max-w-4xl w-full text-center space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] font-black text-blue-500 tracking-widest uppercase">
              Secure Analysis Bot v2.5
            </div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white">
            VERITAS <span className="text-blue-500">REMOTE</span>
          </h1>
          <p className="text-lg text-neutral-500 font-light max-w-2xl mx-auto">
            Deploy advanced AI participants into digital meeting environments to analyze behavioral integrity and physiological stress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6 text-blue-500" />}
            title="Bot Integration"
            description="Seamless bridge connection to Zoom, Google Meet, and Microsoft Teams."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-emerald-500" />}
            title="Bio-Stress Capture"
            description="Remote monitoring of voice jitter and micro-expressions over WebRTC."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-purple-500" />}
            title="Integrity Audit"
            description="Real-time truth probability modeling with secure dossier generation."
          />
        </div>

        <div className="max-w-xl mx-auto w-full space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-neutral-600 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Paste Interview Meeting Link (Zoom, Meet, Teams...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-neutral-700 font-medium"
            />
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 text-left space-y-4 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-800 bg-black text-blue-600 focus:ring-blue-500" 
                />
              </div>
              <label htmlFor="consent" className="text-xs text-neutral-400 leading-relaxed cursor-pointer select-none">
                I confirm that all participants have given explicit consent for AI behavioral analysis. I acknowledge that VERITAS metrics are assistive and not definitive evidence of deception.
              </label>
            </div>
            
            <button 
              onClick={handleStart}
              disabled={!consent}
              className={`w-full py-4 rounded-xl font-bold transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${consent ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
            >
              <Lock className="w-4 h-4" />
              DEPLOY ANALYSIS BOT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-2xl text-left space-y-3 hover:border-neutral-700 hover:bg-neutral-900/50 transition-all group">
    <div className="bg-neutral-800/50 w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-bold text-white text-sm tracking-tight">{title}</h3>
    <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
