/**
 * Lightweight Markdown Parser for Codex
 *
 * A simple markdown parser that handles common formatting without
 * requiring external dependencies. For more complex needs, this can
 * be replaced with remark/rehype when available.
 */

export interface ContentBlock {
	type:
		| 'h1'
		| 'h2'
		| 'h3'
		| 'h4'
		| 'p'
		| 'quote'
		| 'divider'
		| 'list'
		| 'code'
		| 'image'
		| 'callout';
	content: string;
	meta?: {
		items?: string[];
		ordered?: boolean;
		language?: string;
		alt?: string;
		src?: string;
		calloutType?: 'note' | 'tip' | 'warning' | 'important';
	};
}

/**
 * Parse inline markdown formatting
 * Handles: **bold**, *italic*, `code`, [links](url), ~~strikethrough~~
 */
export function parseInline(text: string): string {
	if (!text) return '';

	return (
		text
			// Escape HTML first
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			// Bold: **text** or __text__
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/__(.+?)__/g, '<strong>$1</strong>')
			// Italic: *text* or _text_
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/_(.+?)_/g, '<em>$1</em>')
			// Strikethrough: ~~text~~
			.replace(/~~(.+?)~~/g, '<del>$1</del>')
			// Inline code: `code`
			.replace(/`(.+?)`/g, '<code>$1</code>')
			// Links: [text](url)
			.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
	);
}

/**
 * Parse markdown content into structured blocks
 */
export function parseMarkdown(content: string): ContentBlock[] {
	if (!content) return [];

	const lines = content.split('\n');
	const blocks: ContentBlock[] = [];
	let currentBlock: string[] = [];
	let inCodeBlock = false;
	let codeLanguage = '';
	let inList = false;
	let listItems: string[] = [];
	let listOrdered = false;

	function flushParagraph() {
		if (currentBlock.length > 0) {
			const text = currentBlock.join('\n').trim();
			if (text) {
				blocks.push({
					type: 'p',
					content: parseInline(text)
				});
			}
			currentBlock = [];
		}
	}

	function flushList() {
		if (listItems.length > 0) {
			blocks.push({
				type: 'list',
				content: '',
				meta: {
					items: listItems.map(parseInline),
					ordered: listOrdered
				}
			});
			listItems = [];
			inList = false;
		}
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Code block handling
		if (trimmed.startsWith('```')) {
			if (!inCodeBlock) {
				flushParagraph();
				flushList();
				inCodeBlock = true;
				codeLanguage = trimmed.slice(3).trim();
				currentBlock = [];
			} else {
				blocks.push({
					type: 'code',
					content: currentBlock.join('\n'),
					meta: { language: codeLanguage }
				});
				inCodeBlock = false;
				codeLanguage = '';
				currentBlock = [];
			}
			continue;
		}

		if (inCodeBlock) {
			currentBlock.push(line);
			continue;
		}

		// Empty line
		if (!trimmed) {
			flushParagraph();
			flushList();
			continue;
		}

		// Headers
		const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
		if (headerMatch) {
			flushParagraph();
			flushList();
			const level = headerMatch[1].length;
			blocks.push({
				type: `h${level}` as 'h1' | 'h2' | 'h3' | 'h4',
				content: parseInline(headerMatch[2])
			});
			continue;
		}

		// Horizontal rule
		if (/^[-*_]{3,}$/.test(trimmed)) {
			flushParagraph();
			flushList();
			blocks.push({ type: 'divider', content: '' });
			continue;
		}

		// Blockquote
		if (trimmed.startsWith('> ')) {
			flushParagraph();
			flushList();
			// Collect consecutive blockquote lines
			const quoteLines: string[] = [trimmed.slice(2)];
			while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
				i++;
				quoteLines.push(lines[i].trim().slice(2));
			}
			blocks.push({
				type: 'quote',
				content: parseInline(quoteLines.join(' '))
			});
			continue;
		}

		// Callouts (GitHub-style)
		const calloutMatch = trimmed.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT)\]/i);
		if (calloutMatch) {
			flushParagraph();
			flushList();
			const calloutType = calloutMatch[1].toLowerCase() as 'note' | 'tip' | 'warning' | 'important';
			const calloutLines: string[] = [];
			while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
				i++;
				const calloutLine = lines[i].trim().replace(/^>\s*/, '');
				if (calloutLine) calloutLines.push(calloutLine);
			}
			blocks.push({
				type: 'callout',
				content: parseInline(calloutLines.join(' ')),
				meta: { calloutType }
			});
			continue;
		}

		// Unordered list
		const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
		if (ulMatch) {
			flushParagraph();
			if (inList && listOrdered) {
				flushList();
			}
			inList = true;
			listOrdered = false;
			listItems.push(ulMatch[1]);
			continue;
		}

		// Ordered list
		const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
		if (olMatch) {
			flushParagraph();
			if (inList && !listOrdered) {
				flushList();
			}
			inList = true;
			listOrdered = true;
			listItems.push(olMatch[1]);
			continue;
		}

		// Image
		const imgMatch = trimmed.match(/^!\[(.*)?\]\((.+)\)$/);
		if (imgMatch) {
			flushParagraph();
			flushList();
			blocks.push({
				type: 'image',
				content: '',
				meta: {
					alt: imgMatch[1] || '',
					src: imgMatch[2]
				}
			});
			continue;
		}

		// Regular paragraph content
		if (inList) {
			// If we hit non-list content while in a list, flush the list
			flushList();
		}
		currentBlock.push(line);
	}

	// Flush any remaining content
	if (inCodeBlock) {
		// Unclosed code block - treat as code anyway
		blocks.push({
			type: 'code',
			content: currentBlock.join('\n'),
			meta: { language: codeLanguage }
		});
	} else {
		flushParagraph();
		flushList();
	}

	return blocks;
}

/**
 * Convert markdown blocks to HTML string
 */
export function blocksToHtml(blocks: ContentBlock[]): string {
	return blocks
		.map((block) => {
			switch (block.type) {
				case 'h1':
					return `<h1>${block.content}</h1>`;
				case 'h2':
					return `<h2>${block.content}</h2>`;
				case 'h3':
					return `<h3>${block.content}</h3>`;
				case 'h4':
					return `<h4>${block.content}</h4>`;
				case 'p':
					return `<p>${block.content}</p>`;
				case 'quote':
					return `<blockquote>${block.content}</blockquote>`;
				case 'divider':
					return `<hr />`;
				case 'list':
					if (block.meta?.ordered) {
						return `<ol>${block.meta.items?.map((item) => `<li>${item}</li>`).join('')}</ol>`;
					}
					return `<ul>${block.meta?.items?.map((item) => `<li>${item}</li>`).join('')}</ul>`;
				case 'code':
					const lang = block.meta?.language ? ` class="language-${block.meta.language}"` : '';
					return `<pre><code${lang}>${block.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
				case 'image':
					return `<figure><img src="${block.meta?.src}" alt="${block.meta?.alt || ''}" />${block.meta?.alt ? `<figcaption>${block.meta.alt}</figcaption>` : ''}</figure>`;
				case 'callout':
					return `<aside class="callout callout--${block.meta?.calloutType}">${block.content}</aside>`;
				default:
					return `<p>${block.content}</p>`;
			}
		})
		.join('\n');
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(content: string): number {
	if (!content) return 0;
	const words = content.trim().split(/\s+/).length;
	const wordsPerMinute = 200; // Average reading speed
	return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract excerpt from content
 */
export function extractExcerpt(content: string, maxLength: number = 160): string {
	if (!content) return '';

	// Remove markdown formatting
	const plain = content
		.replace(/#{1,6}\s/g, '')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\*(.+?)\*/g, '$1')
		.replace(/`(.+?)`/g, '$1')
		.replace(/\[(.+?)\]\(.+?\)/g, '$1')
		.replace(/!\[.*?\]\(.+?\)/g, '')
		.replace(/>\s+/g, '')
		.replace(/[-*_]{3,}/g, '')
		.replace(/\n+/g, ' ')
		.trim();

	if (plain.length <= maxLength) return plain;

	// Cut at word boundary
	const truncated = plain.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return truncated.slice(0, lastSpace) + '...';
}
