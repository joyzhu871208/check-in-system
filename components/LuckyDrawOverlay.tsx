
import React, { useState, useEffect } from 'react';
import { CheckInRecord, Winner } from '../types';

interface LuckyDrawOverlayProps {
  isDrawing: boolean;
  lastWinner?: Winner;
  participants: CheckInRecord[];
}

const LuckyDrawOverlay: React.FC<LuckyDrawOverlayProps> = ({ isDrawing, lastWinner, participants }) => {
  const [rollingName, setRollingName] = useState('');
  const [showWinnerCard, setShowWinnerCard] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isDrawing) {
      setShowWinnerCard(false);
      interval = setInterval(() => {
        if (participants.length > 0) {
          const rand = participants[Math.floor(Math.random() * participants.length)];
          setRollingName(rand.name);
        }
      }, 80);
    } else {
      clearInterval(interval);
      if (lastWinner) {
        setRollingName(lastWinner.name);
        setShowWinnerCard(true);
        // Display winner for 5 seconds then hide the card
        const timeout = setTimeout(() => setShowWinnerCard(false), 5000);
        return () => clearTimeout(timeout);
      }
    }
    return () => clearInterval(interval);
  }, [isDrawing, participants, lastWinner]);

  if (!isDrawing && !showWinnerCard) return null;

  return (
    <div className="fixed inset-0 z-[45] pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      {isDrawing ? (
        <div className="text-center animate-pulse">
          <p className="text-amber-400 text-xl font-bold tracking-[1em] mb-4 uppercase">Drawing...</p>
          <div className="text-8xl md:text-[12rem] font-black text-white italic drop-shadow-[0_0_50px_rgba(255,170,0,0.8)] tracking-tight">
            {rollingName}
          </div>
        </div>
      ) : (
        <div className="relative animate-winner-reveal">
           {/* Winner Card */}
           <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-[2px] rounded-[3rem] shadow-[0_0_100px_rgba(251,146,60,0.6)]">
              <div className="bg-slate-950 px-24 py-16 rounded-[2.9rem] flex flex-col items-center text-center">
                 <div className="text-amber-500 font-bold tracking-[0.5em] text-sm mb-6 uppercase">Congratulation</div>
                 <div className="text-8xl font-black text-white mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                    {lastWinner?.name}
                 </div>
                 <div className="h-[1px] w-32 bg-white/20 mb-6"></div>
                 <div className="text-gray-400 text-lg">中奖幸运儿</div>
              </div>
           </div>
           
           {/* Fireworks/Particle simulation hints (CSS only) */}
           <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-1 h-1 bg-amber-400 rounded-full animate-firework-1"></div>
              <div className="w-1 h-1 bg-white rounded-full animate-firework-2"></div>
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-firework-3"></div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes winner-reveal {
          0% { opacity: 0; transform: scale(0.5) rotate(-5deg); filter: blur(20px); }
          50% { opacity: 1; transform: scale(1.1) rotate(0deg); filter: blur(0px); }
          100% { transform: scale(1); }
        }
        @keyframes firework-1 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-300px, -200px); opacity: 0; }
        }
        @keyframes firework-2 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(300px, -250px); opacity: 0; }
        }
        @keyframes firework-3 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(50px, -400px); opacity: 0; }
        }
        .animate-winner-reveal { animation: winner-reveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-firework-1 { animation: firework-1 1s ease-out infinite; }
        .animate-firework-2 { animation: firework-2 1.2s ease-out infinite; }
        .animate-firework-3 { animation: firework-3 0.8s ease-out infinite; }
      `}</style>
    </div>
  );
};

export default LuckyDrawOverlay;
