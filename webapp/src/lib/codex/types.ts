/**
 * Codex Design System Types
 */

export type ReadingMode = 'flow' | 'codex' | 'focus';
export type Season = 'winter' | 'spring' | 'summer' | 'autumn' | 'auto';

export interface CodexContext {
	mode: ReadingMode;
	season: Season;
	resolvedSeason: Exclude<Season, 'auto'>;
	sounds: boolean;
	setMode: (mode: ReadingMode) => void;
	setSeason: (season: Season) => void;
	toggleSounds: () => void;
}
