### Overview
This project is a personal portfolio website for a marketing professional, built with Next.js. Its primary purpose is to showcase the professional's work and experience. Key features include bilingual content (English and Chinese) and a modern cosmic visual theme with twinkling stars. The website aims to present a professional yet engaging online presence, highlighting the user's marketing expertise.

### User Preferences
I prefer that the agent focuses on maintaining the existing cosmic theme and bilingual (English/Traditional Chinese) architecture. When making changes, prioritize the use of Tailwind CSS for styling and ensure responsiveness across devices. For new features or modifications, please ask for confirmation before implementing major structural changes. I value clear, concise explanations for any proposed alterations or additions. Do not make changes to the existing file structure in `/content/pages/` or `/public/images/`.

### System Architecture
The project is built on **Next.js 15 with React 19** and uses **Tailwind CSS 4.0** for styling, adhering to a **cosmic/outer space visual theme** (indigo, purple, pink gradient buttons, dark backgrounds with white text, starfield animations). **TypeScript** is used for development. Content management is Git-based, leveraging **Static Site Generation (SSG)** for performance.

**UI/UX Decisions:**
- **Cosmic Theme:** Incorporates space-themed background images (nebulas, galaxies), a Canvas-based twinkling starfield animation, cosmic gradient buttons with glow effects, and white text for readability against dark backgrounds.
- **Bilingual Support:** Implemented via path-based routing (`/` for English, `/zh` for Chinese). Language detection is client-side. A "LanguageSwitcher" component (globe icon) allows toggling between languages.
- **Responsive Design:** All components and sections are designed to be responsive and mobile-first.

**Technical Implementations:**
- **Internationalization (i18n):** Path-based routing and client-side translation with dictionary-based mapping.
- **StarfieldBackground Component:** A canvas-based animation (`requestAnimationFrame`) provides the site-wide twinkling stars effect.
- **Component-Based Design:** Reusable components are organized into atoms, molecules, sections, and effects.
- **Content Structure:** English content resides in `/content/pages/`, Chinese content in `/content/pages/zh/`.

**Feature Specifications:**
- **Personal Portfolio:** Showcases marketing case studies, professional resume, and contact information.
- **RandomFactButton:** Displays bilingual fun facts about the portfolio owner.

### Recent Changes (July 3, 2026)
- **Removed Japanese Learning Hub:** Deleted the entire feature (components, `/api/auth`, `/api/dictionary`, `/api/flashcards`, `progressTracking.ts`, `ttsClient.ts`, related CSS, and the `googleapis` dependency) as it's no longer in use.

### Recent Changes (January 13, 2026)
- **Security Dependency Updates:** Updated transitive dependencies (axios, form-data, glob, jws, node-forge, qs) for security compliance. Fixed breaking change in glob package by updating import from `glob.sync()` to `globSync()` in `src/utils/content.ts`.

### Previous Changes (December 2, 2025)
- **Listening Practice - Kanji with Furigana:** Added RubyText component to display kanji with hiragana furigana on top using HTML ruby tags. All three N5 listening paragraphs now include kanji versions with proper ruby markup.
- **Exercise Navigation Tabs:** Fixed ExercisesSection.tsx to display all exercise types (Personal SRS, Verb Conjugation, Noun Conjugation, Adjective Conjugation, Te-Form, Potential Form, Common Patterns, Grammar) as accessible tabs.
- **PersonalSRS Bug Fix:** Added null-safety checks in generateExercises function to prevent errors when generating exercises with insufficient other words for options.
- **Google Cloud TTS API:** Fully enabled and tested. Pronunciation and Listening sections work correctly without requiring local OS Japanese language support.

### External Dependencies
- **Stackbit:** For Git-based content management.
