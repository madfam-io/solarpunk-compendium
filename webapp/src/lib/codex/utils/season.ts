/**
 * Season utilities for Codex
 */

export type SeasonName = 'winter' | 'spring' | 'summer' | 'autumn';

export interface SeasonInfo {
	name: SeasonName;
	startDate: { month: number; day: number };
	displayName: string;
	emoji: string;
}

export const seasons: Record<SeasonName, SeasonInfo> = {
	winter: {
		name: 'winter',
		startDate: { month: 12, day: 21 },
		displayName: 'Winter Solstice',
		emoji: '❄️'
	},
	spring: {
		name: 'spring',
		startDate: { month: 3, day: 20 },
		displayName: 'Spring Equinox',
		emoji: '🌱'
	},
	summer: {
		name: 'summer',
		startDate: { month: 6, day: 21 },
		displayName: 'Summer Solstice',
		emoji: '☀️'
	},
	autumn: {
		name: 'autumn',
		startDate: { month: 9, day: 22 },
		displayName: 'Autumn Equinox',
		emoji: '🍂'
	}
};

/**
 * Get the current astronomical season based on today's date
 */
export function getCurrentSeason(): SeasonName {
	return getSeasonFromDate(new Date());
}

/**
 * Get the astronomical season for a given date
 */
export function getSeasonFromDate(date: Date): SeasonName {
	const month = date.getMonth() + 1; // 1-12
	const day = date.getDate();

	// Winter: Dec 21 - Mar 19
	if ((month === 12 && day >= 21) || month <= 2 || (month === 3 && day < 20)) {
		return 'winter';
	}

	// Spring: Mar 20 - Jun 20
	if ((month === 3 && day >= 20) || month <= 5 || (month === 6 && day < 21)) {
		return 'spring';
	}

	// Summer: Jun 21 - Sep 21
	if ((month === 6 && day >= 21) || month <= 8 || (month === 9 && day < 22)) {
		return 'summer';
	}

	// Autumn: Sep 22 - Dec 20
	return 'autumn';
}

/**
 * Get the next season transition date
 */
export function getNextSeasonDate(fromDate: Date = new Date()): Date {
	const currentSeason = getSeasonFromDate(fromDate);
	const year = fromDate.getFullYear();

	const seasonOrder: SeasonName[] = ['winter', 'spring', 'summer', 'autumn'];
	const currentIndex = seasonOrder.indexOf(currentSeason);
	const nextIndex = (currentIndex + 1) % 4;
	const nextSeason = seasonOrder[nextIndex];

	const { month, day } = seasons[nextSeason].startDate;

	// Handle year rollover for winter
	const nextYear = nextSeason === 'winter' ? year : month < (fromDate.getMonth() + 1) ? year + 1 : year;

	return new Date(nextYear, month - 1, day);
}

/**
 * Get season info for display
 */
export function getSeasonInfo(season: SeasonName): SeasonInfo {
	return seasons[season];
}
