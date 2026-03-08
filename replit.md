### Overview
This project is a personal portfolio website for a marketing professional, built with Next.js. Its primary purpose is to showcase the professional's work and experience. Key features include bilingual content (English and Chinese), a modern cosmic visual theme with twinkling stars, and a dedicated Japanese Learning Hub. The website aims to present a professional yet engaging online presence, highlighting the user's marketing expertise and offering additional educational resources.

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
- **Listening Practice - Kanji with Furigana:** RubyText component renders kanji with hiragana furigana on top using HTML ruby tags. Kanji data includes proper ruby markup for all listening paragraphs.

**Feature Specifications:**
- **Personal Portfolio:** Showcases marketing case studies, professional resume, and contact information.
- **RandomFactButton:** Displays bilingual fun facts about the portfolio owner.
- **Japanese Learning Hub:** A significant addition with multiple interactive tabs and features:
    - **Exercises - Personal SRS Tab:** Manually add difficult words with difficulty levels (1-5 stars), generate multiple-choice exercises covering meaning/reading/writing, localStorage persistence. No login required. **Now accessible alongside other exercises via navigation tabs.**
    - **Exercises - Verb/Noun/Adjective Conjugation:** Practice verb conjugations (8 N5 forms), noun conjugations, and adjective conjugations with detailed explanations.
    - **Exercises - Grammar:** Comprehensive N5 Grammar Exercise (65 fill-in-the-blank questions with bilingual explanations and progress tracking).
    - **Exercises - Common Patterns & Te-Form & Potential Form:** Additional grammar pattern exercises for advanced learners.
    - **Listening/Pronunciation:** N5 shadow speaking practice with 3 paragraphs and high-quality pronunciation powered by Google Cloud Text-to-Speech API. **Now displays kanji with hiragana furigana on top using ruby text formatting.**
    - **Dictionary:** Live search functionality powered by Jisho.org API.
    - **Vocabulary Section:** Organized by categories (Nouns, Verbs, Adjectives, Adverbs, Expressions, Particles, Katakana) with kanji, hiragana, bilingual meanings, and example sentences. Covers N5 and expanded N4 content.

**Authentication:**
- Admin login (admin/admin) with localStorage persistence
- Login state propagates immediately to enable SRS features and premium content
- Component remounting strategy ensures UI reflects authentication state instantly

**Text-to-Speech Implementation:**
- Backend API route (`/api/tts`) authenticates with Google Cloud using service account JWT
- Frontend client (`ttsClient.ts`) handles audio playback and state management
- Supports both Pronunciation and Listening sections in English and Chinese versions
- Bypasses OS dependencies - works on any device regardless of installed language packs

### Recent Changes (January 13, 2026)
- **Security Dependency Updates:** Updated transitive dependencies (axios, form-data, glob, jws, node-forge, qs) for security compliance. Fixed breaking change in glob package by updating import from `glob.sync()` to `globSync()` in `src/utils/content.ts`.

### Previous Changes (December 2, 2025)
- **Listening Practice - Kanji with Furigana:** Added RubyText component to display kanji with hiragana furigana on top using HTML ruby tags. All three N5 listening paragraphs now include kanji versions with proper ruby markup.
- **Exercise Navigation Tabs:** Fixed ExercisesSection.tsx to display all exercise types (Personal SRS, Verb Conjugation, Noun Conjugation, Adjective Conjugation, Te-Form, Potential Form, Common Patterns, Grammar) as accessible tabs.
- **PersonalSRS Bug Fix:** Added null-safety checks in generateExercises function to prevent errors when generating exercises with insufficient other words for options.
- **Google Cloud TTS API:** Fully enabled and tested. Pronunciation and Listening sections work correctly without requiring local OS Japanese language support.

### External Dependencies
- **Stackbit:** For Git-based content management.
- **Jisho.org API:** Utilized for the live dictionary search functionality within the Japanese Learning Hub.
- **Google Cloud Text-to-Speech API:** Provides high-quality Japanese pronunciation without OS language support requirements.
