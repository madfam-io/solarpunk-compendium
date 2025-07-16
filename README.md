The Solarpunk Compendium - Interactive Web Viewer
This repository contains the source code for "The Solarpunk Compendium," a single-page, interactive web application designed to present the research from the "Solarpunk Paradigm Deep Dive" document. The project transforms a static PDF into a dynamic, bilingual, and aesthetically pleasing web experience.

🚀 Features
Fully Responsive: Adapts seamlessly to any screen size, from mobile phones to desktop monitors.

Bilingual Content: Instantly switch between English and Spanish for all text content.

Dynamic Theme Switching: Cycle between three beautiful themes:

☀️ Light Mode: Crisp and clean for bright environments.

🌙 Dark Mode: Easy on the eyes and striking in low light.

💻 Auto Mode: Automatically syncs with your operating system's theme preference.

Glassmorphic UI: Modern, semi-transparent "glass" cards create a sense of depth and a visually stunning interface.

Dynamic Content Rendering: All text and data are loaded from JavaScript objects, making content updates easy without altering the HTML structure.

Interactive Navigation:

A sticky navigation bar provides easy access to all sections.

"Scroll-spy" functionality automatically highlights the active navigation link as you scroll through the document.

Smooth scrolling for a pleasant user experience.

Self-Contained: The entire application runs from a single index.html file with no external dependencies beyond Tailwind CSS and Google Fonts loaded via CDN.

🛠️ Tech Stack
HTML5: For the core structure and content.

CSS3:

Tailwind CSS: Utilized for rapid, utility-first styling.

Custom CSS Variables: For advanced theme management and glassmorphism effects.

Vanilla JavaScript (ES6+): For all interactivity, including:

Theme and language switching.

Dynamic HTML content generation from data objects.

Intersection Observer API for scroll-spy navigation.

📂 Project Structure
All the logic, styling, and content are encapsulated within the index.html file:

<style> block: Contains the theme configuration using CSS variables and other base styles.

<body> block: Holds the static HTML structure for the header, main content container, and footer.

<script> block: Contains all the JavaScript code for:

langData and contentData objects holding the bilingual text.

referencesData array for the works cited.

Event listeners for UI elements (theme/language toggles, navigation).

Functions to dynamically render content, apply themes, and manage UI state.

📖 How to Use
Simply open the index.html file in any modern web browser. No build process or server is required.

📄 Content Source
All the information presented in this web application is derived from the research document: "The Solarpunk Compendium: A Deep Dive into the Paradigm of a Sustainable Future". The goal of this project was to make that research more accessible and engaging.

🔮 Future Improvements
Add More Content: Expand the JavaScript data objects with even more research, images, and resources.

Animations & Transitions: Implement subtle animations for section loading and theme changes to enhance the user experience.

Backend Integration: Connect to a headless CMS or a database to manage content more robustly.

Search Functionality: Add a search bar to quickly find terms and topics within the compendium.

⚖️ License
This project is licensed under the MIT License. See the LICENSE file for details.
