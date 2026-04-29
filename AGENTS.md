<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project UI Standards

- **Tech Stack**: ALWAYS use **Tailwind CSS** + **Radix UI** + **Shadcn UI**.
- **Style Mapping**: Use Tailwind utility classes instead of inline `sx` props or custom CSS.
- **Component Source**: Prefer Shadcn UI components for all new UI features.
- **Legacy Components**: NEVER use `Box`, `Typography`, or other Material UI remnants.
