'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectWallet } from '@/components/ui/ConnectWallet';
import { Button } from '@/components/ui/Button';
import { useSpring, animated } from '@react-spring/web';
import { useWallet } from '@/hooks/useWallet';

export default function LandingPage() {
  const router = useRouter();
  const { play, checkIn, isConnected, login, canCheckIn } = useWallet();
  const [playLoading, setPlayLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);

  const titleSpring = useSpring({
    from: { opacity: 0, y: -30 },
    to: { opacity: 1, y: 0 },
    delay: 200,
  });

  const subtitleSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 500,
  });

  const buttonSpring = useSpring({
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    delay: 800,
  });

  const handlePlay = async () => {
    if (!isConnected) {
      login();
      return;
    }
    setPlayLoading(true);
    const success = await play();
    setPlayLoading(false);
    if (success) {
      router.push('/game');
    }
  };

  const handleCheckIn = async () => {
    if (!isConnected) {
      login();
      return;
    }
    setCheckInLoading(true);
    const success = await checkIn();
    setCheckInLoading(false);
    if (success) setCheckInDone(true);
  };

  return (
    <div className="h-full game-gradient flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative floating blocks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-16 h-16 bg-white/10 rounded-lg rotate-12 animate-float" />
        <div
          className="absolute top-[25%] right-[15%] w-12 h-12 bg-white/8 rounded-lg -rotate-6 animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-[30%] left-[20%] w-10 h-10 bg-white/5 rounded-lg rotate-45 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-14 h-14 bg-white/10 rounded-lg -rotate-12 animate-float"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* Wallet connect */}
      <div className="absolute top-6 right-6 z-10">
        <ConnectWallet />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-8 z-10 px-6">
        <animated.div
          style={{
            opacity: titleSpring.opacity,
            transform: titleSpring.y.to((y) => `translateY(${y}px)`),
          }}
          className="text-center"
        >
          <h1 className="text-7xl md:text-8xl font-bold text-white text-glow tracking-tight">
            Block
            <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              Stack
            </span>
          </h1>
        </animated.div>

        <animated.p
          style={{
            opacity: subtitleSpring.opacity,
            transform: subtitleSpring.y.to((y) => `translateY(${y}px)`),
          }}
          className="text-xl text-white/70 text-center max-w-md"
        >
          Stack blocks. Beat scores. Compete on-chain.
        </animated.p>

        <animated.div
          style={{
            opacity: buttonSpring.opacity,
            transform: buttonSpring.scale.to((s) => `scale(${s})`),
          }}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlay}
            disabled={playLoading}
            className="text-xl w-64 px-16 py-6 rounded-full shadow-2xl shadow-white/25"
          >
            {playLoading ? 'Confirming...' : 'Play Game'}
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleCheckIn}
            disabled={checkInLoading || checkInDone || !canCheckIn}
            className="text-xl w-64 px-16 py-6 rounded-full shadow-2xl shadow-white/25"
          >
            {checkInLoading ? 'Confirming...' : (checkInDone || !canCheckIn) ? 'Checked in!' : 'Check-in'}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push('/leaderboard')}
          >
            Leaderboard
          </Button>
        </animated.div>

        <animated.div
          style={{ opacity: subtitleSpring.opacity }}
          className="flex items-center gap-2 mt-8 text-white/40 text-sm"
        >
          <span>Built on</span>
          <span className="font-semibold text-white/60">Base</span>
        </animated.div>
      </div>
    </div>
  );
}
