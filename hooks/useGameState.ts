import { useState, useEffect, useCallback } from 'react';

interface GameScore {
  player: number;
  grabbler: number;
}

const STORAGE_KEY = 'grabblerScore';
const DEFAULT_SCORE: GameScore = { player: 50, grabbler: 0 };

export const useGameState = () => {
  const [score, setScore] = useState<GameScore>(DEFAULT_SCORE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.player === 'number' &&
          typeof parsed.grabbler === 'number' &&
          parsed.player >= 0 &&
          parsed.grabbler >= 0
        ) {
          setScore(parsed);
        }
      }
    } catch (error) {
      console.log('Failed to load score from storage, using defaults');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on score change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
      } catch (error) {
        console.log('Failed to save score to storage');
      }
    }
  }, [score, isLoaded]);

  const stealCoin = useCallback(() => {
    setScore((prev) => {
      if (prev.player > 0) {
        return { player: prev.player - 1, grabbler: prev.grabbler };
      }
      return prev;
    });
  }, []);

  const depositCoin = useCallback(() => {
    setScore((prev) => ({
      player: prev.player,
      grabbler: prev.grabbler + 1,
    }));
  }, []);

  const reclaimCoin = useCallback(() => {
    setScore((prev) => {
      if (prev.grabbler > 0) {
        return { player: prev.player + 1, grabbler: prev.grabbler - 1 };
      }
      return prev;
    });
  }, []);

  return {
    score,
    isLoaded,
    stealCoin,
    depositCoin,
    reclaimCoin,
  };
};

