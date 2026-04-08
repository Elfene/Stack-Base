import { create } from 'zustand';
import { GAME_CONFIG } from '@/lib/constants';
import { getBlockColor } from '@/lib/colors';

export interface PlacedBlock {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export interface FallingPiece {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  velocity: [number, number, number];
  rotation: [number, number, number];
}

export type GamePhase = 'idle' | 'playing' | 'dropping' | 'gameover';
export type MoveAxis = 'x' | 'z';

interface GameState {
  phase: GamePhase;
  score: number;
  blocks: PlacedBlock[];
  currentBlockSize: [number, number, number];
  movingBlockPos: number;
  moveAxis: MoveAxis;
  speed: number;
  isPerfect: boolean;
  showPerfect: boolean;
  combo: number;
  highScore: number;
  fallingPiece: FallingPiece | null;

  startGame: () => void;
  dropBlock: (movingPos: number) => 'perfect' | 'placed' | 'gameover';
  resetGame: () => void;
  setShowPerfect: (show: boolean) => void;
  setPhase: (phase: GamePhase) => void;
  setHighScore: (score: number) => void;
  clearFallingPiece: () => void;
}

const INITIAL_SIZE: [number, number, number] = [
  GAME_CONFIG.INITIAL_BLOCK_SIZE.x,
  GAME_CONFIG.INITIAL_BLOCK_SIZE.y,
  GAME_CONFIG.INITIAL_BLOCK_SIZE.z,
];

export const useGameState = create<GameState>((set, get) => ({
  phase: 'idle',
  score: 0,
  blocks: [],
  currentBlockSize: [...INITIAL_SIZE],
  movingBlockPos: 0,
  moveAxis: 'x',
  speed: GAME_CONFIG.INITIAL_SPEED,
  isPerfect: false,
  showPerfect: false,
  combo: 0,
  highScore: 0,
  fallingPiece: null,

  startGame: () => {
    const baseBlock: PlacedBlock = {
      position: [0, 0, 0],
      size: [...INITIAL_SIZE],
      color: getBlockColor(0),
    };
    set({
      phase: 'playing',
      score: 0,
      blocks: [baseBlock],
      currentBlockSize: [...INITIAL_SIZE],
      movingBlockPos: -GAME_CONFIG.SWING_AMPLITUDE,
      moveAxis: 'x',
      speed: GAME_CONFIG.INITIAL_SPEED,
      isPerfect: false,
      showPerfect: false,
      combo: 0,
      fallingPiece: null,
    });
  },

  dropBlock: (movingPos: number) => {
    const state = get();
    if (state.phase !== 'playing') return 'gameover';

    const { blocks, currentBlockSize, moveAxis, score, combo } = state;
    const lastBlock = blocks[blocks.length - 1];
    const axisIdx = moveAxis === 'x' ? 0 : 2;

    const lastPos = lastBlock.position[axisIdx];
    const delta = movingPos - lastPos;
    const absDelta = Math.abs(delta);
    const blockWidth = currentBlockSize[axisIdx];
    const overlap = blockWidth - absDelta;

    if (overlap <= 0) {
      set({ phase: 'gameover', fallingPiece: null });
      return 'gameover';
    }

    const isPerfect = absDelta < GAME_CONFIG.PERFECT_THRESHOLD;
    const newCombo = isPerfect ? combo + 1 : 0;
    let bonusScore = 1;
    if (isPerfect) {
      bonusScore = GAME_CONFIG.PERFECT_BONUS + Math.min(newCombo, 5);
    }

    const newY = lastBlock.position[1] + GAME_CONFIG.BLOCK_HEIGHT;
    const newSize: [number, number, number] = [...currentBlockSize];
    const newPos: [number, number, number] = [
      lastBlock.position[0],
      newY,
      lastBlock.position[2],
    ];

    let fallingPiece: FallingPiece | null = null;

    if (isPerfect) {
      newPos[axisIdx] = lastPos;
      newSize[axisIdx] = lastBlock.size[axisIdx];
    } else {
      const overlapCenter = (movingPos + lastPos) / 2;
      newPos[axisIdx] = overlapCenter;
      newSize[axisIdx] = overlap;

      const cutSize = blockWidth - overlap;
      const cutCenter = overlapCenter + (delta > 0 ? 1 : -1) * (overlap / 2 + cutSize / 2);
      const cutPiecePos: [number, number, number] = [...newPos];
      cutPiecePos[axisIdx] = cutCenter;
      const cutPieceSize: [number, number, number] = [...newSize];
      cutPieceSize[axisIdx] = cutSize;

      fallingPiece = {
        position: cutPiecePos,
        size: cutPieceSize,
        color: getBlockColor(blocks.length),
        velocity: [(delta > 0 ? 1 : -1) * 2, 0, moveAxis === 'z' ? (delta > 0 ? 1 : -1) * 2 : 0],
        rotation: [Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1],
      };
      if (moveAxis === 'x') {
        fallingPiece.velocity = [(delta > 0 ? 1 : -1) * 2, 0, 0];
      } else {
        fallingPiece.velocity = [0, 0, (delta > 0 ? 1 : -1) * 2];
      }
    }

    const newBlock: PlacedBlock = {
      position: [...newPos],
      size: [...newSize],
      color: getBlockColor(blocks.length),
    };

    const newScore = score + bonusScore;
    const floorCount = blocks.length;
    const newSpeed = Math.min(
      GAME_CONFIG.INITIAL_SPEED +
        Math.floor(floorCount / GAME_CONFIG.SPEED_INCREASE_INTERVAL) * GAME_CONFIG.SPEED_INCREMENT,
      GAME_CONFIG.MAX_SPEED,
    );

    const nextAxis: MoveAxis = moveAxis === 'x' ? 'z' : 'x';

    set({
      phase: 'playing',
      score: newScore,
      blocks: [...blocks, newBlock],
      currentBlockSize: [...newSize],
      movingBlockPos: -GAME_CONFIG.SWING_AMPLITUDE,
      moveAxis: nextAxis,
      speed: newSpeed,
      isPerfect,
      showPerfect: isPerfect,
      combo: newCombo,
      fallingPiece,
    });

    return isPerfect ? 'perfect' : 'placed';
  },

  resetGame: () => {
    set({
      phase: 'idle',
      score: 0,
      blocks: [],
      currentBlockSize: [...INITIAL_SIZE],
      movingBlockPos: 0,
      moveAxis: 'x',
      speed: GAME_CONFIG.INITIAL_SPEED,
      isPerfect: false,
      showPerfect: false,
      combo: 0,
      fallingPiece: null,
    });
  },

  setShowPerfect: (show: boolean) => set({ showPerfect: show }),
  setPhase: (phase: GamePhase) => set({ phase }),
  setHighScore: (highScore: number) => set({ highScore }),
  clearFallingPiece: () => set({ fallingPiece: null }),
}));
