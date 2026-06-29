import { useState, useEffect } from 'react';

export default function SplashIntro({ onComplete }) {
  const [stage, setStage] = useState('hidden'); // hidden -> fade-in -> logo-pop -> fade-out

  useEffect(() => {
    // 1. Fade in the background and logo
    const t1 = setTimeout(() => setStage('fade-in'), 100);
    // 2. Add a little pop/scale effect to the logo
    const t2 = setTimeout(() => setStage('logo-pop'), 800);
    // 3. Fade out the whole splash screen
    const t3 = setTimeout(() => setStage('fade-out'), 1800);
    // 4. Unmount and show the app
    const t4 = setTimeout(() => onComplete(), 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0D5A60] transition-opacity duration-500 ease-in-out ${
        stage === 'fade-out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#118B95] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2AA7B3] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" style={{ animationDelay: '2s' }} />

      {/* Main Logo Container */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          stage === 'hidden' ? 'opacity-0 translate-y-8 scale-95' : 
          stage === 'logo-pop' ? 'opacity-100 translate-y-0 scale-105' : 
          'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="flex items-center gap-4 mb-4">
          {/* Grid icon */}
          <div className="grid grid-cols-2 gap-1.5 p-1">
            <div className="w-6 h-6 rounded bg-white shadow-lg" />
            <div className="w-6 h-6 rounded bg-[#BEE3E6] shadow-lg" />
            <div className="w-6 h-6 rounded bg-[#BEE3E6] shadow-lg" />
            <div className="w-6 h-6 rounded bg-[#2AA7B3] shadow-lg" />
          </div>
          <span className="text-5xl font-black text-white tracking-widest uppercase drop-shadow-md">
            TaskFlow
          </span>
        </div>
        <div className="h-1 w-24 bg-white/30 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-white rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
}
