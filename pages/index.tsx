import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useGameState } from '@/hooks/useGameState';
import dynamic from 'next/dynamic';

// Dynamically import Particles to avoid SSR issues
const Particles = dynamic(() => import('react-tsparticles').then(mod => mod.default), {
  ssr: false,
});

// Import tsparticles engine
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

type GrabblerState = 'idle' | 'moving-left' | 'moving-right';

export default function Home() {
  const { score, isLoaded, stealCoin, depositCoin, reclaimCoin } = useGameState();
  const [grabblerState, setGrabblerState] = useState<GrabblerState>('idle');
  const [grabblerPosition, setGrabblerPosition] = useState(50); // percentage from left
  const [isCarrying, setIsCarrying] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particlePosition, setParticlePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copySuccess, setCopySuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const laughRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();
  
  // Contract Address - Replace with actual CA
  const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

  // Initialize particles
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Audio management with volume ramping
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/audio/music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
      
      laughRef.current = new Audio('/audio/laugh.wav');
      laughRef.current.volume = 0.3;
      
      // Start playing once on load and let it loop forever
      // Use a click handler to start audio if autoplay is blocked
      const startAudio = () => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        document.removeEventListener('click', startAudio);
      };
      
      // Try to play immediately
      audioRef.current.play().catch(() => {
        // If autoplay is blocked, wait for user interaction
        console.log('Autoplay blocked, waiting for user interaction');
        document.addEventListener('click', startAudio);
      });
    }
  }, []);

  // Only adjust volume based on score, never stop/restart the music
  useEffect(() => {
    if (audioRef.current) {
      const grabblerScore = score.grabbler;
      
      // Volume increases by 2% for each coin stolen
      // 0 coins = 0% volume, 25 coins = 50% volume, 50 coins = 100% volume
      const volumePercentage = grabblerScore / 50; // Each coin = 2% volume increase
      const targetVolume = Math.max(0, Math.min(1, volumePercentage));
      
      audioRef.current.volume = targetVolume;
    }
  }, [score.grabbler]);

  // Grabbler movement loop
  useEffect(() => {
    if (!isLoaded) return;

    // Only show idle when Grabbler has won
    if (score.grabbler === 50) {
      setGrabblerState('idle');
      setGrabblerPosition(50);
      return;
    }

    // Start after a short delay
    const startDelay = setTimeout(() => {
      setGrabblerState('moving-left');
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [isLoaded, score.grabbler]);

  // Animation loop
  useEffect(() => {
    if (grabblerState === 'idle' || !isLoaded) return;

    const speed = 0.25; // percentage per frame (adjust for speed)
    
    const animate = () => {
      setGrabblerPosition(prev => {
        if (grabblerState === 'moving-left') {
          const newPos = prev - speed;
          
          // Reached player's pile (left side at ~10%)
          if (newPos <= 15) {
            // Steal coin only if not already carrying one
            if (score.player > 0 && !isCarrying) {
              stealCoin();
              setIsCarrying(true);
              // Play laugh sound when stealing
              if (laughRef.current) {
                laughRef.current.currentTime = 0;
                laughRef.current.play().catch(e => console.log('Laugh play failed:', e));
              }
            }
            // Switch to moving right
            setTimeout(() => setGrabblerState('moving-right'), 100);
            return 15;
          }
          return newPos;
        } else if (grabblerState === 'moving-right') {
          const newPos = prev + speed;
          
          // Reached Grabbler's pile (right side at ~90%)
          if (newPos >= 85) {
            // Deposit coin
            if (isCarrying) {
              depositCoin();
              setIsCarrying(false);
            }
            // Switch to moving left
            setTimeout(() => setGrabblerState('moving-left'), 100);
            return 85;
          }
          return newPos;
        }
        return prev;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [grabblerState, isLoaded, score.player, isCarrying, stealCoin, depositCoin]);

  const triggerParticles = (x: number, y: number) => {
    setParticlePosition({ x, y });
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
  };

  const handlePileClick = () => {
    if (score.grabbler > 0) {
      reclaimCoin();
    }
  };

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.log('Failed to copy:', err);
    }
  };

  if (!isLoaded) {
    return null; // or a loading screen
  }

  return (
    <>
      <Head>
        <title>$Grabbler - The Shitcoin Stealing Game</title>
        <meta name="description" content="Watch helplessly as the Grabbler steals your hard-earned coins!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-crypto-dark to-crypto-purple">
        {/* Background raining gold coins */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Particles
            id="raining-coins"
            init={particlesInit}
            options={{
              fullScreen: { enable: false },
              particles: {
                number: { value: 20, density: { enable: true, area: 800 } },
                color: { value: ['#ffd700', '#ffe55c', '#b8860b'] },
                shape: { 
                  type: 'circle',
                },
                opacity: {
                  value: 0.6,
                },
                size: {
                  value: { min: 8, max: 16 },
                },
                move: {
                  enable: true,
                  speed: 2,
                  direction: 'bottom',
                  straight: false,
                  outModes: {
                    default: 'out',
                    bottom: 'out',
                    top: 'out',
                    left: 'out',
                    right: 'out',
                  },
                },
                rotate: {
                  value: { min: 0, max: 360 },
                  direction: 'random',
                  animation: {
                    enable: true,
                    speed: 3,
                  },
                },
              },
              detectRetina: true,
            }}
          />
        </div>

        {/* Title and Description */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center animate-slide-up">
          <h1 className="text-6xl font-bold text-gold mb-2 drop-shadow-2xl animate-pulse-gold" 
              style={{ textShadow: '0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700' }}>
            $GRABBLER
          </h1>
          <p className="text-white text-base max-w-2xl px-4 drop-shadow-lg animate-fade-in" 
             style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            The Grabbler has one job: steal your shitcoins while you watch helplessly. 
            Click his stash to reclaim your precious gold... if you dare! 💰
          </p>
        </div>

        {/* Game Container with white background */}
        <div className="absolute inset-0 flex items-center justify-center pt-24 pb-4 px-4">
          <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] bg-white rounded-3xl shadow-2xl" 
               style={{ boxShadow: '0 0 60px rgba(139, 92, 246, 0.5), 0 0 120px rgba(79, 70, 229, 0.3)' }}>
            {/* Particle effects */}
            {showParticles && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${particlePosition.x}%`,
                  top: `${particlePosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                }}
              >
                <Particles
                  id="coin-particles"
                  init={particlesInit}
                  options={{
                    particles: {
                      number: { value: 20 },
                      color: { value: '#ffd700' },
                      shape: { type: 'circle' },
                      opacity: {
                        value: 1,
                        animation: {
                          enable: true,
                          speed: 2,
                          minimumValue: 0,
                          sync: false,
                        },
                      },
                      size: {
                        value: { min: 5, max: 15 },
                      },
                      move: {
                        enable: true,
                        speed: 6,
                        direction: 'none',
                        random: true,
                        outModes: 'destroy',
                      },
                    },
                    detectRetina: true,
                  }}
                />
              </div>
            )}

            {/* Player's Pile (Left) */}
            <div className="absolute left-[8%] top-[12%] flex flex-col items-center animate-float">
              <div className="text-white text-2xl font-bold mb-4 drop-shadow-lg animate-pulse-gold px-5 py-2 bg-gradient-to-r from-gold-light to-gold rounded-full shadow-lg"
                   style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Your Gold: {score.player}
              </div>
              <CoinPile count={score.player} isPlayer={true} />
            </div>

            {/* Grabbler's Pile (Right) - Clickable */}
            <div
              className="absolute right-[8%] top-[12%] flex flex-col items-center cursor-pointer hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-float"
              style={{ animationDelay: '0.5s' }}
              onClick={handlePileClick}
            >
              <div className="text-white text-2xl font-bold mb-4 drop-shadow-lg animate-pulse-gold px-5 py-2 bg-gradient-to-r from-gold to-gold-dark rounded-full shadow-lg hover:shadow-2xl transition-shadow"
                   style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Grabbler's Hoard: {score.grabbler}
              </div>
              <CoinPile count={score.grabbler} isPlayer={false} />
              {score.grabbler > 0 && (
                <div className="mt-6 text-xs text-purple-600 font-semibold animate-bounce bg-purple-100 px-3 py-1.5 rounded-full shadow">
                  👆 Click to steal back!
                </div>
              )}
            </div>

            {/* The Grabbler Character */}
            <div
              className="absolute bottom-[20%] transition-none pointer-events-none z-30"
              style={{
                left: `${grabblerPosition}%`,
                transform: `translateX(-50%) ${
                  grabblerState === 'moving-left' ? 'scaleX(-1)' : 'scaleX(1)'
                }`,
              }}
            >
              <div className="relative">
                <img
                  src="/grabbler.png"
                  alt="The Grabbler"
                  className="w-64 h-64 object-contain drop-shadow-2xl animate-float select-none pointer-events-none"
                  style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                  draggable="false"
                />
                {isCarrying && (
                  <div className="absolute -top-3 -right-3 animate-bounce">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center shadow-2xl border-2 border-gold-light animate-pulse-gold"
                           style={{ filter: 'drop-shadow(0 0 10px #ffd700)' }}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                          <span className="text-base font-bold text-gold-light">$</span>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 text-base animate-spin-slow">✨</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Coin Pile Component with 3 states and enhanced visuals
function CoinPile({ count, isPlayer }: { count: number; isPlayer: boolean }) {
  const getState = () => {
    if (count === 0) return 'empty';
    if (count >= 26) return 'full';
    return 'medium';
  };

  const state = getState();

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {state === 'empty' && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-8xl opacity-20 select-none animate-pulse">💨</div>
          <div className="text-sm text-gray-400 font-semibold">Empty!</div>
        </div>
      )}
      {state === 'medium' && (
        <div className="relative">
          <div className="flex flex-wrap gap-2 justify-center items-end max-w-[200px]">
            {Array.from({ length: Math.min(count, 16) }).map((_, i) => (
              <div 
                key={i} 
                className="relative animate-float"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center shadow-lg border-2 border-gold-light transform hover:scale-110 transition-transform">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                    <span className="text-xs font-bold text-gold-light">$</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {count > 16 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-gold-dark bg-white px-3 py-1 rounded-full shadow">
              +{count - 16} more
            </div>
          )}
        </div>
      )}
      {state === 'full' && (
        <div className="relative animate-wiggle">
          <div className="relative">
            {/* Stacked money bags effect */}
            <div className="relative w-32 h-32">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-7xl" 
                   style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }}>
                💰
              </div>
              <div className="absolute bottom-8 left-0 text-5xl opacity-80"
                   style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))' }}>
                💰
              </div>
              <div className="absolute bottom-8 right-0 text-5xl opacity-80"
                   style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))' }}>
                💰
              </div>
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-4xl opacity-60"
                   style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.2))' }}>
                💰
              </div>
            </div>
            {/* Count badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-gradient-to-r from-gold via-gold-light to-gold px-4 py-2 rounded-full shadow-xl border-2 border-gold-dark animate-pulse-gold">
              <div className="text-2xl font-bold text-gold-dark drop-shadow-lg">
                {count}
              </div>
            </div>
            {/* Sparkles */}
            <div className="absolute top-4 left-2 text-2xl animate-spin-slow">✨</div>
            <div className="absolute top-4 right-2 text-2xl animate-spin-slow" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce-slow">✨</div>
          </div>
        </div>
      )}
    </div>
  );
}

