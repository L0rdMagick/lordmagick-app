import { TARGET_DATA, TargetLocation } from './targetData';
import { TAG_GROUPS } from './tag-groups';
import { calculateZScore, getPsiRank } from '../utils/psychicStats';

export interface GameState {
  target: TargetLocation;
  distractors: TargetLocation[];
  allTags: string[]; // 102 tags shuffled
  selectedTags: string[];
  status: 'SELECTION' | 'RESULTS';
}

export interface ScoringResult {
  exactHits: string[];
  alignmentHits: { selected: string; targetMatch: string; groupName: string }[];
  misses: string[];
  totalHits: number;
  zScore: number;
  rank: ReturnType<typeof getPsiRank>;
  soulResonance: string[]; // Groups with high activity
}

/**
 * flattens the TAG_GROUPS into a map for O(1) lookup
 * Map<Tag, GroupID>
 */
const tagToGroupMap = new Map<string, string>();
TAG_GROUPS.forEach(group => {
  group.tags.forEach(tag => {
    // Normalize? The data seems to use exact casing, but let's be safe?
    // Data has "Ancient" and "ancient" possibly? 
    // The parser preserved case. Let's assume case-sensitive for now or matched.
    tagToGroupMap.set(tag, group.id);
  });
});

/**
 * Helper to get a group by ID
 */
const getGroupById = (id: string) => TAG_GROUPS.find(g => g.id === id);


export function startNewGame(): GameState {
  // 1. Pick Random Target
  const allLocations = Object.values(TARGET_DATA).flat();
  const targetIndex = Math.floor(Math.random() * allLocations.length);
  const target = allLocations[targetIndex];

  // 2. Pick 5 Distractors
  // Should ideally be unique and not the target
  const distractors: TargetLocation[] = [];
  const usedIndices = new Set([targetIndex]);
  
  while (distractors.length < 5) {
    const idx = Math.floor(Math.random() * allLocations.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      distractors.push(allLocations[idx]);
    }
  }

  // 3. Collect Tags
  // 17 from target + 17 from each distractor = 17 * 6 = 102
  let pool: string[] = [...target.tags];
  distractors.forEach(d => {
    pool.push(...d.tags);
  });

  // Shuffle
  const shuffledTags = shuffleArray(pool);

  return {
    target,
    distractors,
    allTags: shuffledTags,
    selectedTags: [],
    status: 'SELECTION'
  };
}

export function calculateGameScore(target: TargetLocation, selectedTags: string[]): ScoringResult {
  const exactHits: string[] = [];
  const alignmentHits: { selected: string; targetMatch: string; groupName: string }[] = [];
  const misses: string[] = [];
  const soulResonanceGroups = new Set<string>();

  // Set of target tags for easy lookup
  const targetTagSet = new Set(target.tags);

  selectedTags.forEach(tag => {
    if (targetTagSet.has(tag)) {
      exactHits.push(tag);
      // Check for group resonance even on exact hits?
      const groupId = tagToGroupMap.get(tag);
      if (groupId) soulResonanceGroups.add(getGroupById(groupId)?.name || '');
    } else {
      // Check Alignment
      const tagGroupId = tagToGroupMap.get(tag);
      let foundAlignment = false;
      
      if (tagGroupId) {
        // Is there a target tag in the same group?
        for (const tTag of target.tags) {
          const tGroupId = tagToGroupMap.get(tTag);
          if (tGroupId === tagGroupId) {
             const group = getGroupById(tagGroupId);
             alignmentHits.push({
               selected: tag,
               targetMatch: tTag,
               groupName: group?.name || ''
             });
             if (group) soulResonanceGroups.add(group.name);
             foundAlignment = true;
             break; // Count once
          }
        }
      }
      
      if (!foundAlignment) {
        misses.push(tag);
      }
    }
  });

  // Calculate Stats
  // Z-Score based on 17 trials (user selections), prob 1/6
  const totalHits = exactHits.length + alignmentHits.length;
  // Note: Trials = 17 (number of selections user MADE). Chance = 1/6.
  const zScore = calculateZScore(totalHits, 17, 1/6);
  const rank = getPsiRank(zScore);

  return {
    exactHits,
    alignmentHits,
    misses,
    totalHits,
    zScore,
    rank,
    soulResonance: Array.from(soulResonanceGroups).filter(Boolean)
  };
}

// Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}
