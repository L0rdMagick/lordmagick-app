export interface Book {
  slug: string;
  title: string;
  coverImage: string;
  chapters: {
    title: string;
    content: string;
  }[];
}

const placeholderChapter = {
  title: 'Coming Soon',
  content: `<p>The contents of this ancient tome are still being transcribed by the scribes. Check back soon to uncover its secrets.</p>`,
};

export const libraryBooks: Book[] = [
  {
    slug: 'spirit-work-and-mediumship',
    title: '🌀 Spirit Work & Mediumship',
    coverImage: '/images/books/🌀 Spirit Work & Mediumship.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'esoteric-philosophy',
    title: '🌌 Esoteric Philosophy (The Why)',
    coverImage: '/images/books/🌌 Esoteric Philosophy (The Why).png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'magical-herbalism-and-potionry',
    title: '🌿 Magical Herbalism & Potionry',
    coverImage: '/images/books/🌿 Magical Herbalism & Potionry.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'ceremonial-and-ritual-magic',
    title: '📜 Ceremonial & Ritual Magic',
    coverImage: '/images/books/📜 Ceremonial & Ritual Magic.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'divination-and-information-gathering',
    title: '🔮 Divination & Information Gathering',
    coverImage: '/images/books/🔮 Divination & Information Gathering.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'spellcrafting-and-correspondences',
    title: '🕯️ Spellcrafting & Correspondences',
    coverImage: '/images/books/🕯️ Spellcrafting & Correspondences.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'sigil-magic-and-symbolism',
    title: '🖋️ Sigil Magic & Symbolism',
    coverImage: '/images/books/🖋️ Sigil Magic & Symbolism.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'magical-defense-and-warding',
    title: '🛡️ Magical Defense & Warding',
    coverImage: '/images/books/🛡️ Magical Defense & Warding.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'altered-states-and-trance-work',
    title: '🧘 Altered States & Trance Work',
    coverImage: '/images/books/🧘 Altered States & Trance Work.png',
    chapters: [placeholderChapter],
  },
  {
    slug: 'energy-work-and-manipulation',
    title: '✨ Energy Work & Manipulation',
    coverImage: '/images/books/✨ Energy Work & Manipulation.png',
    chapters: [placeholderChapter],
  },
];