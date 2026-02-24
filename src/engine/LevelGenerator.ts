export interface HackTarget {
  id: string;
  name: string;
  difficulty: number;
  puzzleTypes: string[];
  defenses: string[];
  reward: number;
}

interface TierConfig {
  minDifficulty: number;
  maxDifficulty: number;
  puzzles: string[];
  defenses: string[];
}

const TIER_CONFIGS: TierConfig[] = [
  {
    minDifficulty: 1,
    maxDifficulty: 2,
    puzzles: ["password-crack", "port-scan", "log-forensics"],
    defenses: ["basic-firewall", "rate-limit"],
  },
  {
    minDifficulty: 2,
    maxDifficulty: 4,
    puzzles: ["packet-routing", "hash-reversal", "node-mapping"],
    defenses: ["adaptive-firewall", "credential-rotation"],
  },
  {
    minDifficulty: 4,
    maxDifficulty: 6,
    puzzles: ["timing-analysis", "trace-scrubbing", "access-graph"],
    defenses: ["honeypot-cluster", "intrusion-detection"],
  },
  {
    minDifficulty: 6,
    maxDifficulty: 8,
    puzzles: ["cipher-break", "exploit-chain", "kernel-injection"],
    defenses: ["counter-intrusion-ai", "sandbox-traps"],
  },
  {
    minDifficulty: 8,
    maxDifficulty: 10,
    puzzles: ["quantum-auth", "zero-day-synthesis", "distributed-overload"],
    defenses: ["self-healing-network", "autonomous-response-grid"],
  },
];

const SYSTEM_PREFIXES = [
  "Aegis",
  "Neon",
  "Helix",
  "Ghost",
  "Cipher",
  "Titan",
  "Obsidian",
  "Vector",
  "Omega",
  "Mirage",
];

const SYSTEM_SUFFIXES = [
  "Node",
  "Vault",
  "Matrix",
  "Relay",
  "Array",
  "Core",
  "Daemon",
  "Proxy",
  "Kernel",
  "Gateway",
];

const DEFAULT_TARGET_COUNT = 5;

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return (): number => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export class LevelGenerator {
  private readonly rng: () => number;

  constructor(seed = Date.now()) {
    this.rng = mulberry32(seed);
  }

  generateLevel(level: number, targetCount = DEFAULT_TARGET_COUNT): HackTarget[] {
    const tier = this.getTier(level);
    const tierConfig = TIER_CONFIGS[tier];
    const availablePuzzles = this.getUnlockedPuzzles(tier);

    return Array.from({ length: targetCount }, (_, index) => {
      const difficulty = this.randomInt(
        tierConfig.minDifficulty,
        tierConfig.maxDifficulty,
      );
      const puzzleTypes = this.pickDistinct(
        availablePuzzles,
        this.randomInt(2, Math.min(4, availablePuzzles.length)),
      );
      const defenses = this.pickDistinct(
        tierConfig.defenses,
        this.randomInt(1, Math.min(2, tierConfig.defenses.length)),
      );

      const reward =
        100 * difficulty + puzzleTypes.length * 40 + defenses.length * 30;

      return {
        id: `L${level}-S${index + 1}-${Math.floor(this.rng() * 1_000_000)}`,
        name: `${this.pickOne(SYSTEM_PREFIXES)} ${this.pickOne(SYSTEM_SUFFIXES)}`,
        difficulty,
        puzzleTypes,
        defenses,
        reward,
      };
    });
  }

  private getTier(level: number): number {
    if (level <= 1) return 0;
    if (level <= 3) return 1;
    if (level <= 6) return 2;
    if (level <= 10) return 3;
    return 4;
  }

  private getUnlockedPuzzles(tier: number): string[] {
    return TIER_CONFIGS.slice(0, tier + 1).flatMap((config) => config.puzzles);
  }

  private pickOne<T>(items: T[]): T {
    return items[Math.floor(this.rng() * items.length)];
  }

  private pickDistinct<T>(items: T[], count: number): T[] {
    const pool = [...items];
    const result: T[] = [];
    const picks = Math.min(count, pool.length);
    for (let i = 0; i < picks; i += 1) {
      const index = Math.floor(this.rng() * pool.length);
      const [item] = pool.splice(index, 1);
      result.push(item);
    }
    return result;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }
}
