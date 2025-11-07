export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  description: string;
  intro: string;
  coverImage: string;
  sliderImages: string[];
  editions: { id: string; name: string; priceModifier: number }[];
}

export const tarotProducts: Product[] = [
  {
    id: 'prod_cats_crown',
    slug: 'cats-of-the-crown',
    name: 'Cats of the Crown',
    tagline: 'Tarot Deck',
    price: 65.00,
    intro: "Introducing the Cats of the Crown – a uniquely elegant tarot deck that transports you to the opulent world of the Renaissance, guided by the mystical wisdom of cats.",
    description: "Crafted for both novice readers and seasoned mystics, the Cats of the Crown invites you to explore a universe where artistry and mysticism intertwine. Each card in this exquisite deck features photorealistic, anthropomorphized felines adorned in elaborate Renaissance attire, embodying the traditional archetypes of the tarot with a regal twist. Whether you're delving into the mysteries of the cards, seeking personal guidance, or simply appreciating their artistic beauty, this deck promises to be a treasured addition to any collection.",
    coverImage: '/images/marketplace/tarot-decks/cats-of-the-crown/cover.png',
    sliderImages: [
      '/images/marketplace/tarot-decks/cats-of-the-crown/slide-1.png',
      '/images/marketplace/tarot-decks/cats-of-the-crown/slide-2.png',
      '/images/marketplace/tarot-decks/cats-of-the-crown/slide-3.png',
    ],
    editions: [
        { id: 'price_standard_cats', name: 'Standard Edition', priceModifier: 0 },
        { id: 'price_deluxe_cats', name: 'Deluxe Edition', priceModifier: 20 },
    ],
  },
  {
    id: 'prod_roots_nile',
    slug: 'roots-of-the-nile',
    name: 'Roots of the Nile',
    tagline: 'Tarot Deck',
    price: 65.00,
    intro: "Embark on a unique journey through the mystical and cultural tapestry of the 'Roots of the Nile - Tarot Deck'.",
    description: "This innovative tarot deck marries the timeless wisdom of ancient Egyptian symbology with the vibrant, expressive culture of Hip Hop, encapsulating a world where past and present beautifully converge. Each card in this deck is a photorealistic masterpiece, featuring African figures adorned in traditional Egyptian garb set against the storied backdrops of ancient Egypt. The 'Roots of the Nile - Tarot Deck' transforms the classic imagery of the Rider-Waite tarot into a dynamic, life-like tableau that speaks directly to the soul of the modern seeker.",
    coverImage: '/images/marketplace/tarot-decks/roots-of-the-nile/cover.png',
    sliderImages: [
      '/images/marketplace/tarot-decks/roots-of-the-nile/slide-1.png',
      '/images/marketplace/tarot-decks/roots-of-the-nile/slide-2.png',
    ],
    editions: [
        { id: 'price_standard_nile', name: 'Standard Edition', priceModifier: 0 },
        { id: 'price_deluxe_nile', name: 'Deluxe Edition', priceModifier: 20 },
    ],
  },
  {
    id: 'prod_spiritwild_animal',
    slug: 'spiritwild-animal',
    name: 'Spiritwild',
    tagline: 'Animal Oracle Deck',
    price: 65.00,
    intro: "Dive into the intuitive and reflective world of 'SpiritWild: Animal Oracle'.",
    description: "This innovative oracle deck bridges the instinctive qualities of animals with human experiences, featuring diverse animal heads on human bodies, all styled in contemporary attire against modern backdrops. Each card is a photorealistic depiction, showcasing a unique blend of animal traits and human interactions designed to highlight both positive and negative energies. This deck does not adhere to traditional Rider-Waite themes but instead utilizes the specific attributes of 50 different animals to provide insight into current energies, potential blockages, and necessary actions to achieve goals or avoid undesirable outcomes.",
    coverImage: '/images/marketplace/tarot-decks/spiritwild-animal/cover.png',
    sliderImages: [
      '/images/marketplace/tarot-decks/spiritwild-animal/slide-1.png',
      '/images/marketplace/tarot-decks/spiritwild-animal/slide-2.png',
    ],
    editions: [
        { id: 'price_standard_spirit', name: 'Standard Edition', priceModifier: 0 },
        { id: 'price_deluxe_spirit', name: 'Deluxe Edition', priceModifier: 20 },
    ],
  },
  {
    id: 'prod_kpop_lovers',
    slug: 'k-pop-lovers',
    name: 'K-Pop Lovers Tarot',
    tagline: 'Romantic Guidance',
    price: 65.00,
    intro: "Embark on a vibrant journey of love and self-discovery with the 'K-Pop Lovers Tarot - Romantic Guidance'.",
    description: "This enchanting tarot deck blends the dynamic world of K-pop with the opulent aesthetics of the Baroque era, creating a setting where modern romantic tales are woven amidst the grandeur of a bygone age. Each card in this deck is a photorealistic portrayal, featuring models whose style and allure echo the vibrant spirit of K-pop's most celebrated icons, dressed in elaborate Baroque attire and set against lush, ornately detailed backdrops. The 'K-Pop Lovers Tarot' transforms the traditional symbols of the Rider-Waite tarot into a visually stunning narrative that resonates with the passions and dreams of the contemporary heart.",
    coverImage: '/images/marketplace/tarot-decks/k-pop-lovers/cover.png',
    sliderImages: [
      '/images/marketplace/tarot-decks/k-pop-lovers/slide-1.png',
      '/images/marketplace/tarot-decks/k-pop-lovers/slide-2.png',
    ],
    editions: [
        { id: 'price_standard_kpop', name: 'Standard Edition', priceModifier: 0 },
        { id: 'price_deluxe_kpop', name: 'Deluxe Edition', priceModifier: 20 },
    ],
  }
];