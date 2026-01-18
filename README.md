# DataOS: Autonomous Data Engineering & Analytics Agent

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=google&logoColor=white)

**DataOS** is a resume-grade, production-ready frontend simulation of a "One-Click Data Analysis Platform". It demonstrates advanced UI/UX patterns, simulated Big Data processing (Polars/DuckDB architecture), and Agentic AI orchestration.

## 🚀 Key Features

*   **Autonomous Agent Pipeline**: Visualizes the flow of Schema Detection, Cleaning, Quality Checks, and Insight Generation.
*   **Dual Operating Modes**:
    *   **CEO Mode**: High-level narratives, strategic morning briefings, and risk/opportunity analysis.
    *   **Analyst Mode**: Raw data stats, hypothesis testing lab, and detailed time-series visualizations.
*   **Hypothesis Lab**: An "Agentic Scientist" feature that allows users to simulate causal impact analysis (e.g., "What happens if we raise prices by 10%?").
*   **Live Data Stream**: Simulates real-time ingestion and updates.
*   **Gemini 3 Flash Integration**: Powers the Q&A engine, strategic narratives, and automated root cause analysis.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Glassmorphism design system)
*   **Visualization**: Recharts (Responsive, animated charts)
*   **AI**: Google GenAI SDK (Gemini 3 Flash Preview)
*   **Architecture**: Multi-Agent System (MCP) simulation

## 📦 Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set your API Key (Optional for Demo Mode, required for AI features):
    *   Create a `.env` file in the root.
    *   Add: `API_KEY=your_google_gemini_api_key`
4.  Run development server:
    ```bash
    npm run dev
    ```
5.  Build for production:
    ```bash
    npm run build
    ```

## 🏗️ Architecture

The app mimics a distributed data system:

1.  **Ingestion**: Parses CSV files in the browser.
2.  **Orchestrator**: Manages state between specific specialized agents (Schema, Cleaning, Quality, Viz).
3.  **Insight Engine**: Uses LLMs to generate JSON-structured strategic advice.
4.  **UI Layer**: A dual-mode interface catering to both executive and technical personas.

## 📄 License

MIT