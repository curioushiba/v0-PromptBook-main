# **Project Brief: Mage Craft**

### **Executive Summary**

Mage Craft is a web application designed to empower users in creating highly effective and contextually accurate prompts for AI models. The platform addresses the growing challenge of prompt engineering by providing a structured interface where users can define a prompt's Role, Instructions, Personality, Context, and Examples. By guiding users through these key components, Mage Craft aims to improve the quality and consistency of AI-generated results, adhering to the best practices of prompt and context engineering. The application will feature a neobrutalist visual style and will be built using Next.js, TypeScript, Tailwind CSS, and shadcn UI components, with Supabase for the backend and Vercel for deployment. Core features will include the ability to save prompts and organize them into folders, a light/dark mode toggle, and a mobile-friendly responsive design.

### **Problem Statement**

Prompt engineering, while powerful, often involves a repetitive and inefficient workflow. Users frequently find themselves re-typing the same detailed structures and contexts for their prompts, leading to wasted time and inconsistent results. Without a centralized and easily accessible repository for well-structured prompts, knowledge is lost, and the process of creating effective prompts relies on manual copy-pasting from disparate sources or re-creating them from memory. This ad-hoc approach not only slows down the creative and development process but also introduces a high potential for error, as critical details can be easily forgotten or overlooked. Existing solutions, such as simple text editors or note-taking apps, lack the specialized structure needed to enforce best practices in prompt engineering, forcing users to manage the complexity of prompt components (like Role, Context, and Examples) manually.

### **Proposed Solution**

Mage Craft will be a web application that streamlines the prompt engineering process by providing a structured and intelligent interface. The core of the solution is a user-friendly editor where users can input distinct components of a prompt—Role, Personality, Instructions, Context, and Examples—into dedicated fields \[cite: curioushiba/v0-promptbook/v0-PromptBook-fe6df523fba1a12683c83c0b94d682a38a1480f7/app/page.tsx\].

Upon clicking the "Create Meta Prompt" button, the application will connect to a Large Language Model (LLM) armed with custom instructions. This backend process will intelligently synthesize the user's inputs into a well-structured, context-engineered meta prompt, which will then be presented back to the user \[cite: curioushiba/v0-promptbook/v0-PromptBook-fe6df523fba1a12683c83c0b94d682a38a1480f7/app/page.tsx\].

To solve the problem of accessibility and reuse, the app will feature robust prompt management capabilities. Users can save their generated prompts, which can be viewed on a "Recent Prompts" page \[cite: curioushiba/v0-promptbook/v0-PromptBook-fe6df523fba1a12683c83c0b94d682a38a1480f7/app/recent/page.tsx\], marked as favorites \[cite: curioushiba/v0-promptbook/v0-PromptBook-fe6df523fba1a12683c83c0b94d682a38a1480f7/app/favorites/page.tsx\], and organized into custom-colored folders for easy retrieval \[cite: curioushiba/v0-promptbook/v0-PromptBook-fe6df523fba1a12683c83c0b94d682a38a1480f7/app/folders/page.tsx\]. The application will feature a distinctive neobrutalist visual style and a mobile-friendly interface with a light/dark mode toggle \[cite: curioushiba/v0-promptbook/v0-PromptBook-fe6df523fba1a12683c83c0b94d682a38a1480f7/app/settings/page.tsx\].

### **Target Users**

#### **Primary User Segment: The AI Power User**

This user is technologically savvy and has already integrated AI into their daily personal and professional workflows. They are not casual users; they are creators, developers, marketers, researchers, and strategists who actively leverage AI to enhance their productivity and creativity. Their day-to-day life involves a variety of use cases for AI, from generating code and writing marketing copy to summarizing complex documents and brainstorming new ideas. They understand the fundamentals of good prompt engineering but are frustrated by the inefficiency of repeating complex prompt structures. They are looking for a tool that respects their expertise by providing a streamlined, powerful, and organized way to craft, save, and reuse high-quality prompts.

### **MVP Scope**

#### **Core Features (Must Have)**

* **Structured Prompt Editor:** An interface with dedicated input fields for Role, Personality, Instruction, Context, and Example.  
* **Meta Prompt Generation:** A button that sends the structured inputs to an LLM and displays the returned, enhanced prompt.  
* **Save Prompt Functionality:** Ability for a user to save a generated prompt to their account.  
* **Recent Prompts (History):** A dedicated page (`/recent`) that shows a history of past generated prompts for the user.  
* **Favorite Prompts:** The ability to mark prompts as "favorites" and view them on a dedicated page (`/favorites`).  
* **Basic Folder System:** Ability to create folders and assign saved prompts to them.  
* **Light/Dark Mode Toggle:** A functional switch to change the application's theme.  
* **Responsive Design:** The application must be fully usable on mobile, tablet, and desktop devices.

#### **Out of Scope for MVP**

* Advanced prompt versioning.  
* Collaborative features (sharing prompts or folders with other users).  
* Public prompt library or community features.  
* Detailed analytics on prompt performance.  
* The "Studio" sections (Audio, Video, Image, Text) as seen in the codebase.  
* Social media integration or content creation helpers.

### **Post-MVP Vision**

* **Phase 2 Features:** Introduce collaborative features, allowing users to share individual prompts or entire folders with team members. Develop a public library where users can discover and clone high-quality prompts from the community.  
* **Long-term Vision:** Evolve Mage Craft into the industry-standard platform for professional prompt engineering and management, incorporating advanced features like A/B testing for prompts, performance analytics, and integrations with popular AI development platforms.  
* **Expansion Opportunities:** Transition from a responsive web app to a native mobile application for iOS and Android to provide a seamless, on-the-go experience. Explore the development of team-based and enterprise-level plans with features geared towards organizational use, such as centralized prompt management, access controls, and team performance dashboards.

### **Technical Considerations**

#### **Platform Requirements**

* **Target Platforms:** Web Responsive (Mobile, Tablet, Desktop)  
* **Browser/OS Support:** Latest versions of Chrome, Firefox, Safari, and Edge.  
* **Performance Requirements:** The application should be fast and responsive, with a focus on quick load times and a smooth user interface, particularly on mobile devices.

#### **Technology Preferences**

* **Frontend:** Next.js with TypeScript, Tailwind CSS for styling, and shadcn UI for the component library.  
* **Backend & Database:** Supabase for database, authentication, and backend services.  
* **Hosting/Infrastructure:** Vercel for seamless deployment and hosting of the Next.js application.

### **Constraints & Assumptions**

#### **Constraints**

* **Budget:** The project will be developed with no budget, relying on free tiers of services (like Supabase and Vercel) wherever possible.  
* **Timeline:** There is no hard deadline. The focus is on careful, deliberate progress for each task rather than speed.  
* **Resources:** The project will be developed by a solo developer.

#### **Key Assumptions**

* We assume that the free tiers offered by Vercel and Supabase will be sufficient for the MVP's features and anticipated user load.  
* We assume that a connection to either the OpenAI or Google Gemini API will be available and that its API will be consistently stable for the meta-prompt generation feature.  
* We assume that users will understand the neobrutalist UI and find it intuitive enough not to require extensive tutorials for the MVP.

### **Risks & Open Questions**

#### **Key Risks**

* **Scope Creep:** As a solo developer project, there's a risk of adding too many features beyond the MVP, delaying a releasable product.  
* **LLM Dependency:** The core "Create Meta Prompt" feature is entirely dependent on an external LLM. Any changes to the LLM's API, pricing, or availability could break the app's primary function.  
* **User Adoption:** The niche target of "AI Power Users" might be small, or they may have already developed their own personal systems, making adoption a challenge.

#### **Open Questions**

* **\[Answered\]** Which specific LLM will be used? \- The app will integrate with either the OpenAI API or Google Gemini API.  
* **\[Answered\]** How will user authentication and data privacy be handled? \- Supabase will be used for authentication and to manage user data securely.  
* **\[Answered\]** What is the strategy for gathering feedback? \- Initial feedback will be gathered via word of mouth from early users.

### **Next Steps**

This Project Brief provides the foundational context for Mage Craft. The immediate next step is to hand this document off to a Product Manager (PM) to begin the creation of a detailed Product Requirements Document (PRD).

