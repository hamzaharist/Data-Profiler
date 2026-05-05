# 📊 Data Profiler Pro

**Drop a file. Get instant data quality insights.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg)](https://vitejs.dev/)

Data Profiler Pro is a high-performance, client-side data analysis tool built with React and TypeScript. It allows data analysts and engineers to quickly audit datasets (.csv, .xlsx, .xls) for quality, consistency, and relationships without ever uploading data to a server.

---

## 📖 Table of Contents
1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Installation](#-installation)
4. [Usage](#-usage)
5. [Project Structure](#-project-structure)
6. [Contributing](#-contributing)
7. [License](#-license)

---

## ✨ Features

- **🚀 Instant Overview**: Get high-level statistics (row counts, column types, memory usage) immediately upon upload.
- **🔍 Column-Level Analysis**: Deep dive into individual columns with distribution charts, outlier detection, and statistical summaries.
- **📉 Correlation Matrix**: Visualize relationships between numerical variables to identify hidden patterns.
- **🧩 Missing Data Map**: A visual heatmap to identify gaps and sparsity across your dataset.
- **👯 Duplicate Detection**: Quickly find and analyze duplicate entries to ensure data integrity.
- **📂 Client-Side Processing**: Your data stays in your browser. Powered by Web Workers for smooth performance even with large files.

---

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript
- **Build Tool**: Vite 8
- **Data Engine**: SheetJS (xlsx), Custom Web Workers
- **Visualization**: Chart.js
- **Styling**: Vanilla CSS Modules (Glassmorphism & Modern UI)

---

## ⚙️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hamzaharist/Data-Profiler.git
   cd Data-Profiler/data-profiler-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 🚀 Usage

1. **Launch the application** (defaults to `http://localhost:5173` or similar).
2. **Drag and Drop** your `.csv`, `.xlsx`, or `.xls` file into the upload zone.
3. **Explore the Tabs**:
   - **Overview**: See the big picture of your data.
   - **Columns**: Select a column to see its specific distribution and stats.
   - **Correlation**: Check how your numeric columns relate.
   - **Missing Map**: Find where your data is missing.
   - **Duplicates**: Identify and analyze repeated rows.

---

## 📁 Project Structure

```text
data-profiler-pro/
├── src/
│   ├── components/      # UI Components (Tabs, DropZone, etc.)
│   ├── lib/             # Data Processing Logic (Stats, Parsing)
│   ├── workers/         # Web Workers for background processing
│   ├── types/           # TypeScript definitions
│   └── App.tsx          # Main Application Entry
├── public/              # Static assets
└── index.html           # HTML Template
```

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🔗 Connect

Harist Hamzah Hutapea - [GitHub](https://github.com/hamzaharist)

Project Link: [https://github.com/hamzaharist/Data-Profiler](https://github.com/hamzaharist/Data-Profiler)
