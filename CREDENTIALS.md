# 🔐 Project Login Credentials

These credentials are automatically seeded into the database using `npx prisma db seed` (via `prisma/seed.ts`).

### Default Password for All Users
> [!IMPORTANT]
> **Password:** `password123`

---

## 👥 User Accounts

| Role | Email | Use Case |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | Full platform access, manage agents, approve commissions. |
| **Salesperson** | `sahil_sales@company.com` | View assigned leads, manage deals. |
| **Channel Partner** | `ramesh_channel@company.com` | View assigned/originated leads. |
| **Sub-Agent** | `karan_sub@company.com` | Track personal leads and earnings. |

---

## 🛠️ Management Commands
- **Re-seed Database:** `npx tsx prisma/seed.ts` (This resets the DB to these defaults)
- **Check DB Status:** `node check-db.cjs`
