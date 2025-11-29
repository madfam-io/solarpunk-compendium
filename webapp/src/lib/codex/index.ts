/**
 * Codex Design System
 *
 * A skeuomorphic design language for digital publications.
 *
 * @example
 * ```svelte
 * <script>
 *   import { CodexProvider, Page, ModeToggle } from '$lib/codex';
 * </script>
 *
 * <CodexProvider mode="flow" season="auto">
 *   <ModeToggle />
 *   <Page number={1}>
 *     <h1>Article Title</h1>
 *     <p>Content here...</p>
 *   </Page>
 * </CodexProvider>
 * ```
 */

// Components
export { default as CodexProvider } from './components/CodexProvider.svelte';
export { default as Page } from './components/Page.svelte';
export { default as ModeToggle } from './components/ModeToggle.svelte';

// Types
export type { ReadingMode, Season, CodexContext } from './components/CodexProvider.svelte';

// Utilities
export { getCurrentSeason, getSeasonFromDate } from './utils/season';
