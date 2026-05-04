# 🧪 Karan Agent Hub - Testing Guide

This guide outlines the comprehensive testing strategy for the Karan Agent Hub, covering all levels, types, and styles of software testing to ensure system reliability and performance.

---

## 🏗️ 1. Testing Levels (Based on Development Stage)

### 🔹 Unit Testing
Tests the smallest parts of the code in isolation (functions, methods).
- **Goal:** Verify internal logic (e.g., EMI calculations, commission math).
- **Tool:** `Vitest`
- **Location:** `tests/unit/*.test.ts`

### 🔹 Integration Testing
Tests how different modules work together.
- **Goal:** Verify interactions between frontend components, API routes, and database connections.
- **Tool:** `Vitest` + `JSDOM`
- **Location:** `tests/integration/*.test.ts`

### 🔹 System Testing
Tests the complete, integrated application to ensure it meets technical requirements.
- **Goal:** Verify full end-to-end flows (e.g., Lead Form → API → Database → PDF Generation).

### 🔹 Acceptance Testing (UAT)
Final check to ensure the system meets business requirements.
- **Alpha/Beta Testing:** Real-world testing by selected users or internal stakeholders.

---

## ⚙️ 2. Testing Types

### 🔹 Functional Testing (Core)
Checks that each feature works correctly according to specifications.
- **Examples:**
  - Does the form submit?
  - Is the quotation PDF generated?
  - Are commissions calculated accurately?

### 🔹 Non-Functional Testing
Tests "how" the system works rather than "what" it does.
- **⚡ Performance Testing:** Load handling and speed.
- **🔐 Security Testing:** Checks for vulnerabilities (SQL Injection, Auth bypass).
- **🎯 Usability Testing:** Evaluates UI/UX friendliness.
- **📈 Scalability Testing:** Can the system handle growth in agent numbers?

---

## 🔄 3. Execution Styles & Tools

### 🔹 Manual Testing
Humans interacting with the app. Best for UI/UX evaluation and exploratory testing.

### 🔹 Automation Testing
Scripts that run automatically to repeat tasks and prevent regressions.
- **E2E Tools:**
  - **Cypress:** (Very popular) Comprehensive browser automation.
  - **Playwright:** (Modern + Powerful) Multi-browser support with fast execution.
  - **Selenium:** (Older but still used) The industry veteran for cross-browser testing.

---

## 🔁 4. Purpose-Driven Testing

### 🔹 Smoke Testing
A "first health check" to see if the basic features are working (e.g., does the app open?).
- **Tool:** `Playwright` (`npm run test:smoke`)

### 🔹 Sanity Testing
Focused testing after a minor change or bug fix to verify specific functionality.

### 🔹 Regression Testing
Ensures that new code changes haven't broken existing features.

### 🔹 E2E Testing (End-to-End)
Simulates real user behavior from start to finish.
- **Example:** User login → Lead Entry → Quote Creation → Logout.
- **Tool:** `Playwright` (`npm run test:e2e`)

---

## 🚀 Running Tests

### Unit & Integration Tests
```bash
npm run test:unit
```

### E2E / Smoke Tests (Requires Browser Environment)
```bash
npm run test:e2e
npm run test:smoke
```

*Note: E2E tests require a browser environment (Chromium/Firefox/Webkit) to be installed on the host machine.*
