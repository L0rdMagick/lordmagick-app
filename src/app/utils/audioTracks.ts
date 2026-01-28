export type Category = 'Ambience' | 'Suspense' | 'Mystical' | 'Ethereal' | 'Nature' | 'Instrumental';

export interface AudioTrack {
  name: string;
  url: string;
  category: Category;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  // Ambience
  {
    name: "Floating Drone Atmosphere",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/mid%20range%20synth%20floating%20drone%20atmospheric.mp3",
    category: "Ambience"
  },
  {
    name: "Deep Concentration Drone",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/low%20background%20drone%20for%20deep%20concentration.mp3",
    category: "Ambience"
  },
  {
    name: "Subtle Mysterious Ambience",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/soft%20subtle%20ambience%20mysterious.mp3",
    category: "Ambience"
  },
  {
    name: "Soft Atmosphere Drone",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/very%20soft%20drone%20for%20atmosphere.mp3",
    category: "Ambience"
  },
  {
    name: "Soft Ambience Synth",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/ambience%20synthesizer%20soft%20atmosphere.mp3",
    category: "Ambience"
  },
  {
    name: "Floating Synth Background",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/background%20sublte%20soft%20floating%20synth.mp3",
    category: "Ambience"
  },
  {
    name: "Pulsing Minimalist Synth",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/pulsing%20steady%20thoughtful%20synth%20minimalist.mp3",
    category: "Ambience"
  },

  // Suspense
  {
    name: "Arpeggiated Suspense",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/faster%20paced%20arpeggiated%20synth%20suspenseful.mp3",
    category: "Suspense"
  },
  {
    name: "Arpeggiated Suspense II",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/faster%20paced%20arpeggiated%20synth%20suspenseful%20(2).mp3",
    category: "Suspense"
  },
  {
    name: "Rhythmic Bell Suspense",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/rhythmic%20bell%20sounding%20suspenseful.mp3",
    category: "Suspense"
  },
  {
    name: "Thoughtful Suspense Synth",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/atmospheric%20synthesizer%20thoughtful%20and%20suspenseful.mp3",
    category: "Suspense"
  },

  // Mystical
  {
    name: "Cave Hum Reverb",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/mystical%20low%20hum%20in%20a%20high%20reverb%20environment%20like%20a%20cave.mp3",
    category: "Mystical"
  },
  {
    name: "Male Chanting",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/male%20chanting1.mp3",
    category: "Mystical"
  },
  {
    name: "Intense Rhythmic Chanting",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/intense%20male%20chanting%20rhythmic.mp3",
    category: "Mystical"
  },
  {
    name: "Mysterious Toy Music",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/mysterious%20toy%20sounding%20music%20thoughtful%20and%20light.mp3",
    category: "Mystical"
  },
  {
    name: "Middle Eastern Mystical",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/middle%20eastern%20mystical%20ambience%20vibes.mp3",
    category: "Mystical"
  },

  // Ethereal
  {
    name: "Elven Vocals I",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/ethereal%20acapella%20female%20background%20elven.mp3",
    category: "Ethereal"
  },
  {
    name: "Elven Vocals II",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/ethereal%20acapella%20female%20background%20elven2.mp3",
    category: "Ethereal"
  },
  {
    name: "Elven Vocals III",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/ethereal%20acapella%20female%20background%20elven3.mp3",
    category: "Ethereal"
  },
  {
    name: "Ethereal Floating Drone",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/ethereal%20floating%20drone%20synth.mp3",
    category: "Ethereal"
  },

  // Instrumental
  {
    name: "Low Drone Piano",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/low%20drone%20with%20lots%20of%20reverb%20on%20minimal%20piano.mp3",
    category: "Instrumental"
  },
  {
    name: "Haunted Piano",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/haunted%20sounding%20mysterious%20piano.mp3",
    category: "Instrumental"
  },
  {
    name: "High Flute Whistle",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/high%20pitched%20flutish%20sounding%20almost%20a%20whistle.mp3",
    category: "Instrumental"
  },
  {
    name: "Tavern Harp",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/soft%20harp%20in%20a%20tavern.mp3",
    category: "Instrumental"
  },

  // Nature
  {
    name: "Rain Background",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/rain%20background%20sounds.mp3",
    category: "Nature"
  },
  {
    name: "Nature Bird Sounds",
    url: "https://elxvzcgx7jcl2zqs.public.blob.vercel-storage.com/bird%20sounds%20background%20nature.mp3",
    category: "Nature"
  }
];
