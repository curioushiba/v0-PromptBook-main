# **Product Requirements Document (PRD): Mage Craft**

### **1\. Goals and Background Context**

##### **Goals**

* To provide AI Power Users with a structured and efficient tool for crafting high-quality, reusable prompts.  
* To streamline the prompt engineering workflow by eliminating repetitive typing and centralizing prompt management.  
* To enforce best practices in prompt creation through a guided, component-based interface.  
* To establish a personal, organized, and easily accessible library for users' most effective prompts.

##### **Background Context**

Mage Craft is being developed to solve the inefficiencies inherent in modern prompt engineering. Power users currently rely on manual, error-prone methods like re-typing complex prompt structures or copy-pasting from various documents. This leads to wasted time, inconsistent AI outputs, and a lack of a centralized system for knowledge management. Mage Craft will address this by offering a dedicated platform where users can build, save, and organize prompts, leveraging a structured editor and an LLM backend to enhance the final output. This allows users to focus on the creative aspects of prompt design rather than the tedious mechanics of formatting and repetition.

##### **Change Log**

| Date | Version | Description | Author |
| ----- | ----- | ----- | ----- |
| 2025-09-04 | 1.0 | Initial PRD Draft | John, PM |

### **2\. Requirements**

#### **Functional**

* **FR1:** The user must be able to input text into five distinct fields: Role, Personality, Instruction, Context, and Example.  
* **FR2:** A "Create Meta Prompt" button must be available, which, when clicked, sends the content of the five fields to a backend LLM service.  
* **FR3:** The system must receive the processed meta prompt from the LLM service and display it clearly to the user.  
* **FR4:** The user must have the ability to save a generated prompt.  
* **FR5:** The system must provide a dedicated page (`/recent`) that displays a chronologically sorted list of the user's previously generated prompts.  
* **FR6:** The user must be able to mark any saved prompt as a "Favorite".  
* **FR7:** The system must provide a dedicated page (`/favorites`) that displays all prompts the user has marked as a favorite.  
* **FR8:** The user must be able to create new folders to organize their saved prompts.  
* **FR9:** The user must be able to assign a saved prompt to one or more folders.  
* **FR10:** The system must provide a dedicated page (`/folders`) to view and manage these folders and their contained prompts.  
* **FR11:** The application must feature a toggle to switch between a light and a dark theme.  
* **FR12:** Each prompt displayed in a list (e.g., on the Recent, Favorites, or Folders pages) will be presented in a card format.  
* **FR13:** Each prompt card must contain a "Copy" button to copy the prompt's content to the clipboard.  
* **FR14:** Each prompt card must contain a "Heart" button to add or remove the prompt from the user's favorites.  
* **FR15:** Each prompt card must contain a "+" (plus sign) button that allows the user to add the prompt to a folder of their choosing.

#### **Non-Functional**

* **NFR1:** The user interface must be responsive and provide a seamless experience on mobile, tablet, and desktop screen sizes.  
* **NFR2:** The application's visual design must adhere to a neobrutalist aesthetic, utilizing bold typography, high contrast, and solid colors.  
* **NFR3:** All interactions with the backend (prompt generation, saving, fetching) should provide clear loading states to the user.  
* **NFR4:** The application must be deployed on Vercel, and the database and authentication must be handled by Supabase.  
* **NFR5:** The frontend must be built with Next.js, TypeScript, Tailwind CSS, and shadcn UI components.

### **3\. User Interface Design Goals**

#### **Overall UX Vision**

The user experience will be direct, efficient, and empowering. The interface should feel like a specialized tool for power users, prioritizing clarity and speed over decorative elements. Every interaction should be deliberate and responsive, reinforcing the user's sense of control.

#### **Key Interaction Paradigms**

* **Component-Based Editing:** The core interaction will be filling out the structured prompt fields. This is the central hub of creation.  
* **Card-Based Management:** All saved, recent, and favorited prompts will be displayed in distinct cards, each acting as a self-contained unit with its own set of actions (Copy, Favorite, Add to Folder).  
* **Modal-Driven Actions:** Secondary actions, such as adding a prompt to a folder or creating a new folder, will be handled through focused modals to avoid navigating away from the main context.

#### **Core Screens and Views**

* **Dashboard (`/`):** The main creation space, featuring the structured prompt editor and previews of "My Prompts" and "Favorite Prompts".  
* **Recent Prompts (`/recent`):** A view dedicated to the user's prompt history.  
* **Favorite Prompts (`/favorites`):** A curated view of the user's most-used prompts.  
* **Prompt Folders (`/folders`):** An organizational view for managing and accessing prompts by category.  
* **Settings (`/settings`):** A simple view for account-level settings, including the theme toggle.

#### **Branding & Accessibility**

* **Branding:** The UI will strictly follow a neobrutalist style, characterized by:  
  * Thick, black borders on components like cards and buttons.  
  * Hard drop-shadows to create a sense of depth and tactility.  
  * High-contrast color palettes, avoiding gradients in favor of solid colors for backgrounds and UI elements (except for decorative card headers).  
  * Bold, uppercase typography for headings.  
* **Accessibility:** WCAG AA compliance will be targeted, ensuring sufficient color contrast and keyboard navigability.  
* **Target Device and Platforms:** Web Responsive, with a mobile-first approach.

### **4\. Technical Assumptions**

#### **Repository Structure**

* **Monorepo:** The project will be structured as a monorepo, containing the fullstack application within a single repository.

#### **Service Architecture**

* **Serverless:** The architecture will leverage serverless functions for the backend logic, orchestrated through Supabase and deployed on Vercel.

#### **Testing Requirements**

* **Full Testing Pyramid:** The project will aim for a comprehensive testing strategy, including unit tests, integration tests, and end-to-end (E2E) tests to ensure robustness.

#### **Additional Technical Assumptions and Requests**

* The project will use the Geist Sans font for the user interface, as specified in `app/layout.tsx`.  
* The application will explicitly not use the `eslint` and `typescript` `ignoreBuildErrors` flags in production to ensure code quality. The current settings in `next.config.mjs` are for development convenience and should be updated before a production release.  
* All UI components will be sourced from the shadcn UI library, as indicated by the file structure in `/components/ui` and the `components.json` configuration.

### **5\. Epic and Story Structure**

#### **Epic List**

* **Epic 1: Core Prompt Management MVP:** Establish the foundational infrastructure and deliver the core user-facing features for creating, managing, and organizing AI prompts.

#### **Epic 1 Details**

**Epic Goal:** To deliver a functional and valuable first version of Mage Craft, allowing users to sign up, create, save, and organize their prompts in a secure and intuitive environment.

* **Story 1.1: Foundational Setup & User Authentication**  
  * **As a** User,  
  * **I want** to sign up and log in to the application,  
  * **So that** I can save and manage my prompts securely.  
  * **Acceptance Criteria:**  
    1. A user can create a new account using an email and password via Supabase Auth.  
    2. A user can log in with their credentials.  
    3. The application maintains a user session.  
    4. A user can log out from the settings page.  
* **Story 1.2: Structured Prompt Editor Implementation**  
  * **As a** Power User,  
  * **I want** a structured editor with five specific fields,  
  * **So that** I can easily build a well-formed prompt.  
  * **Acceptance Criteria:**  
    1. The main page displays five text input fields: Role, Personality, Instruction, Context, and Example.  
    2. Each field is clearly labeled in uppercase, bold font.  
    3. A "CREATE META PROMPT" button is present and styled according to the neobrutalist theme.  
    4. The editor layout is responsive and fully functional on mobile devices.  
* **Story 1.3: LLM Integration & Meta Prompt Display**  
  * **As a** Power User,  
  * **I want** to generate an enhanced prompt by clicking a button,  
  * **So that** I can leverage an LLM to improve my initial ideas.  
  * **Acceptance Criteria:**  
    1. Clicking the "CREATE META PROMPT" button sends the data from the five fields to a backend serverless function.  
    2. The backend service successfully calls an external LLM API (OpenAI or Gemini).  
    3. A loading state is displayed to the user while the LLM is processing.  
    4. The response from the LLM is displayed clearly to the user in a designated output area.  
    5. API errors are handled gracefully and a user-friendly message is shown.  
* **Story 1.4: Prompt Persistence \- Saving & Recents**  
  * **As a** Power User,  
  * **I want** to save my generated prompts and see a history of them,  
  * **So that** I don't lose my work and can easily reference it later.  
  * **Acceptance Criteria:**  
    1. After a prompt is generated, a "Save" button is available.  
    2. Clicking "Save" stores the complete prompt in the Supabase database, associated with the logged-in user.  
    3. The `/recent` page fetches and displays a list of all prompts generated by the user, sorted from newest to oldest.  
    4. Each prompt on the `/recent` page is displayed in a styled card.  
* **Story 1.5: Favorite Prompts Feature**  
  * **As a** Power User,  
  * **I want** to mark my best prompts as favorites,  
  * **So that** I can quickly access my most effective prompts.  
  * **Acceptance Criteria:**  
    1. Each prompt card contains a "Heart" icon button.  
    2. Clicking the "Heart" button toggles the favorite status of the prompt in the database.  
    3. The `/favorites` page displays only the prompts marked as favorites.  
    4. The "Heart" icon's appearance reflects the current favorite status (e.g., filled for favorited, outline for not).  
* **Story 1.6: Folder Organization System**  
  * **As a** Power User,  
  * **I want** to organize my saved prompts into folders,  
  * **So that** I can manage my prompt library by project or theme.  
  * **Acceptance Criteria:**  
    1. On the `/folders` page, a user can create a new folder with a name and a color.  
    2. Each prompt card has a "+" (plus) icon button.  
    3. Clicking the "+" button opens a modal displaying the user's available folders.  
    4. The user can select a folder from the modal to assign the prompt to it.  
    5. The `/folders` page displays each folder and the prompts contained within it.  
* **Story 1.7: Theming and Final Polish**  
  * **As a** Power User,  
  * **I want** to switch between light and dark modes,  
  * **So that** I can use the app comfortably in different lighting conditions.  
  * **Acceptance Criteria:**  
    1. A theme toggle is available on the `/settings` page.  
    2. Switching the toggle changes the application's color scheme between a predefined light and dark theme.  
    3. The theme choice is persisted across user sessions.  
    4. All components and pages correctly apply the neobrutalist styling in both themes.

