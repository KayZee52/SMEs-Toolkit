# SMEs Toolkit - Offline-First Business Management App

Welcome to the SMEs Toolkit, a powerful, offline-first business management application designed for small and medium-sized enterprises (SMEs). Built with Next.js, this toolkit helps you manage sales, inventory, customers, and expenses with ease, and even includes an AI assistant to help you gain insights into your business data.

## ✨ Key Features

- **Offline-First:** All your data is stored locally in a `SQLite` database file, meaning the app works perfectly without an internet connection.
- **Dashboard:** Get an at-a-glance overview of your daily sales, profit, low-stock items, and top-selling products.
- **Sales Tracking:** Log sales transactions, calculate profit per sale, and generate receipts.
- **Inventory Management:** Keep track of your products, stock levels, prices, and costs. Easily add new stock and get alerts for low-stock items.
- **Customer Profiles:** Manage your customer information and track their purchase history.
- **Expense Logging:** Record all your business expenses to get a clear picture of your finances.
- **AI Assistant:** Powered by the Gemini API, Ma-D can answer natural language questions about your business data, generate product descriptions, and provide summaries.
- **Reporting & Analytics:** Generate insightful reports with customizable date ranges, including AI-powered summaries, charts, and top-performer tables.
- **Data Export:** Export your dashboard, reports, and transaction logs to PDF.
- **Secure & Private:** Your business data stays on your machine. The application supports password protection to secure your data.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/smes-toolkit.git
    cd smes-toolkit
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up your Environment Variables:**
    To use the AI features, you need a Google AI API Key.

    -   Create a file named `.env` in the root of the project.
    -   Add your API key to this file:
        ```
        GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```
    -   You can get a free API key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run the development servers:**
    The application requires two development servers running simultaneously: one for the Next.js app and one for the Genkit AI flows.

    -   **Terminal 1: Start the Next.js App**
        ```sh
        npm run dev
        ```
        Your application should now be running at `http://localhost:9002`.

    -   **Terminal 2: Start the Genkit AI Server**
        ```sh
        npm run genkit:dev
        ```
        This starts the AI service that the Next.js app communicates with. You can inspect your AI flows at `http://localhost:4000`.

### First-Time Setup

When you run the app for the first time, you will be prompted to create a password. This password is used to encrypt and protect your local database file. **Please store this password safely, as it cannot be recovered.**

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **AI Integration:** [Google AI Gemini & Genkit](https://developers.google.com/gemini)
-   **Database:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (local file-based)
-   **Charting:** [Recharts](https://recharts.org/)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see the `CONTRIBUTING.md` file for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
