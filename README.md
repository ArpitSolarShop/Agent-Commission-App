# 🌞 Karan Agent Hub

The **Karan Agent Hub** is a professional solar sales and commission management platform built with Next.js, Prisma, and Tailwind CSS. It empowers solar sales networks with automated lead management, hierarchical agent structures, and professional quotation generation.

## 🚀 Key Features
- **Agent Hierarchy:** Multi-level parent-child relationship management with interactive network visualization.
- **Lead & Deal Tracking:** Full pipeline management from initial contact to closed-won deals.
- **Automated Quotations:** Dynamic Bill of Materials (BOM) generation for On-grid, Off-grid, and Hybrid solar systems.
- **Commission Management:** Automated calculation of fixed and percentage-based payouts across the agent network.
- **Multitenant Dashboards:** Dedicated experiences for Admins, Salespersons, and Agents.

## 📖 Documentation
- **[User Guide](./USER_GUIDE.md):** A comprehensive manual for end-users on how to manage leads, quotes, and agents.
- **[Testing Guide](./TESTING_GUIDE.md):** Technical documentation covering Unit, Integration, and E2E testing strategies.

## 🛠️ Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **UI/UX:** Tailwind CSS + Radix UI + Shadcn UI
- **Testing:** Playwright (E2E), Vitest (Unit/Integration), Cypress
- **Integrations:** Kit19 CRM, DoubleTick WhatsApp API

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase instance)

### Installation
```bash
npm install
npx playwright install
```

### Environment Setup
Create a `.env` file based on the provided template and fill in your database and API credentials.

### Development
```bash
npm run dev
```

### Testing
```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e
```

## 📄 License
Internal proprietary software for Karan Solar.
