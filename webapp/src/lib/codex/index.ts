/**
 * Codex Design System
 *
 * A skeuomorphic design language for digital publications.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     CodexProvider,
 *     Page,
 *     Spread,
 *     ModeToggle,
 *     Bookmark,
 *     PullQuote,
 *     SectionDivider,
 *     MarginNote
 *   } from '$lib/codex';
 * </script>
 *
 * <CodexProvider mode="flow" season="auto">
 *   <ModeToggle />
 *   <Page number={1}>
 *     <h1>Article Title</h1>
 *     <PullQuote attribution="Jane Doe">
 *       A meaningful quote here.
 *     </PullQuote>
 *     <p>Content here...</p>
 *     <Bookmark />
 *   </Page>
 * </CodexProvider>
 * ```
 */

// Layout Components
export { default as CodexProvider } from './components/CodexProvider.svelte';
export { default as Page } from './components/Page.svelte';
export { default as Spread } from './components/Spread.svelte';

// Navigation & Controls
export { default as ModeToggle } from './components/ModeToggle.svelte';
export { default as Bookmark } from './components/Bookmark.svelte';

// Typography & Decorative
export { default as PullQuote } from './components/PullQuote.svelte';
export { default as SectionDivider } from './components/SectionDivider.svelte';
export { default as MarginNote } from './components/MarginNote.svelte';

// Types
export type { ReadingMode, Season, CodexContext } from './components/CodexProvider.svelte';

// Utilities
export { getCurrentSeason, getSeasonFromDate, getSeasonInfo, seasons } from './utils/season';
export type { SeasonName, SeasonInfo } from './utils/season';
