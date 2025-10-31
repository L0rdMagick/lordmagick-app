---
title: "Transmutation for Quadrapeds"
---

## Chapter 1: The Prima Materia

Welcome to the study of alchemy. This chapter introduces the fundamental concept of the *Prima Materia*, or first matter. It is the primitive, formless base of all matter.

The journey of transformation is both physical and spiritual. Remember these key principles:
-   Solve et Coagula (Dissolve and Coagulate)
-   As above, so below
--   The mastery of self is the mastery of all things

An alchemist's workspace is their sanctuary. Below is an engraving of a typical laboratory.

![An alchemist's laboratory with various flasks and a furnace.](/images/books/🌿 Magical Herbalism & Potionry.png)

To create a new book, you can insert images like the one above. Just make sure the image path starts with `/` and points to a file inside your `public` folder. For organization, you could create a subfolder in `public/images/books/` for each book's internal images.

## Chapter 2: The Three Primes

The three primes, or *tria prima*, are the cornerstone of alchemical philosophy. They are:
1.  **Sulphur** (The soul, the expansive force)
2.  **Mercury** (The spirit, the life force)
3.  **Salt** (The body, the fixed material)

Understanding the balance between these three is crucial for the Great Work. **Bold text** can be used for emphasis, just like this.

Each element has a corresponding symbol that you will learn to recognize.

## Chapter 3: The Magnum Opus

The Great Work is the ultimate goal of the alchemist. It is the process of creating the Philosopher's Stone, a substance said to be capable of turning base metals into gold and granting eternal life.

This process is divided into four major stages:
-   Nigredo (blackening)
-   Albedo (whitening)
-   Citrinitas (yellowing)
-   Rubedo (reddening)

Each stage represents a profound transformation, mirroring the alchemist's own spiritual evolution. The path is long, but the rewards are immeasurable.```

### How to Use the New System

1.  **Create a Book File:** To add a new book titled "Grimoire of Shadows", create a new file named `grimoire-of-shadows.md` inside your `_books/` folder. The filename `grimoire-of-shadows` will become its unique `slug`.
2.  **Add Book Content:** Copy the format from `example-book.md`.
    *   **Title:** Set the main title in the `---` section at the top.
    *   **Chapters:** Start each new chapter with `## ` (a space after the two hashes is important).
    *   **Formatting:** Use standard Markdown for *italics*, **bold**, lists, etc.
    *   **In-Book Images:** To add images inside a chapter, use the `![alt text](/path/to/image.png)` syntax. The path must be absolute from the `public` directory (e.g., `/images/books/grimoire/ritual.png`).
3.  **Add the Cover Image:** Add the book's cover image to `public/images/books/`. The filename must match the slug exactly (e.g., `grimoire-of-shadows.png` or `grimoire-of-shadows.jpg`).
4.  **Done!** The next time you build or run your application, the new book will automatically appear on your library bookshelf.

This updated structure provides you with a powerful, clean, and easily replicable workflow for managing your library, elevating your project to a professional standard for content management.