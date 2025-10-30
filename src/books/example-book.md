---
title: "The Alchemist's Handbook"
---

## Chapter 1: The Prima Materia

Welcome to the study of alchemy. This chapter introduces the fundamental concept of the *Prima Materia*, or first matter. It is the primitive, formless base of all matter.

The journey of transformation is both physical and spiritual. Remember these key principles:
-   Solve et Coagula (Dissolve and Coagulate)
-   As above, so below
--   The mastery of self is the mastery of all things

An alchemist's workspace is their sanctuary. Below is an engraving of a typical laboratory.

![An alchemist's laboratory with various flasks and a furnace.](/images/books/alchemist-lab.jpg)

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

Each stage represents a profound transformation, mirroring the alchemist's own spiritual evolution. The path is long, but the rewards are immeasurable.

---
THE FIX (Part 2): This horizontal rule now acts as the "End of Book" marker.
The parser will ignore everything below this line.

### How to Use the New System

1.  **Create a Book File:** To add a new book titled "Grimoire of Shadows", create a new file named `grimoire-of-shadows.md` inside your `src/books/` folder. The filename `grimoire-of-shadows` will become its unique `slug`.
2.  **Add Book Content:** Copy the format from `example-book.md`.
    *   **Title:** Set the main title in the `---` section at the top.
    *   **Chapters:** Start each new chapter with `## `.
    *   **End of Book:** Place a `---` on its own line after the final chapter's content.