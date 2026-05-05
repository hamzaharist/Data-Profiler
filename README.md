# 📊 Data Profiler Pro

**Drop a file. Get instant data quality insights.**

Data Profiler Pro is a high-performance, client-side data analysis tool built with React and TypeScript. It allows data analysts and engineers to quickly audit datasets (.csv, .xlsx, .xls) for quality, consistency, and relationships without ever uploading data to a server.

## ✨ Key Features

- **🚀 Instant Overview**: Get high-level statistics (row counts, column types, memory usage) immediately upon upload.
- **🔍 Column-Level Analysis**: Deep dive into individual columns with distribution charts, outlier detection, and statistical summaries.
- **📉 Correlation Matrix**: Visualize relationships between numerical variables to identify hidden patterns.
- **🧩 Missing Data Map**: A visual heatmap to identify gaps and sparsity across your dataset.
- **👯 Duplicate Detection**: Quickly find and analyze duplicate entries to ensure data integrity.
- **📂 Client-Side Processing**: Your data stays in your browser. Powered by Web Workers for smooth performance even with large files.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Data Engine**: [SheetJS (xlsx)](https://sheetjs.com/), Custom Web Workers
- **Visualization**: [Chart.js](https://www.chartjs.org/)
- **Styling**: Vanilla CSS Modules (Glassmorphism & Modern UI)
