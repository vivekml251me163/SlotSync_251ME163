# SlotSync - Campus Infrastructure Booking System

SlotSync is a modern campus infrastructure booking application designed to streamline facility reservations, approval workflows, and slot scheduling across university departments.

## Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd slotsync
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.local` and configure your environment settings:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `NEXTAUTH_SECRET`: Secret key for JWT session encryption.
   - `NEXTAUTH_URL`: Application canonical URL (`http://localhost:3000`).
   - `RESEND_API_KEY`: Resend service API key.
   - `INNGEST_EVENT_KEY`: Inngest event key.
   - `INNGEST_SIGNING_KEY`: Inngest signing key.

4. **Database Migrations**
   Generate and push Drizzle ORM migrations:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

## Run

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## Features

- **Role-Based Access Control (RBAC)**: Distinct layouts and action permissions for `ADMIN`, `FACULTY`, `CONVENOR`, and `STUDENT`.
- **Infrastructure Directory**: Manage auditoriums, labs, classrooms, seminar halls, and sports complexes.
- **Interactive Availability Calendar**: View real-time facility slot availability.
- **Booking Requests & Approvals**: Multi-tier approval system for facility allocation.
- **Edge Middleware Protection**: Secure JWT edge route guards protecting `/admin/*`, `/faculty/*`, and `/student/*`.
- **Background Event Processing**: Integrated with Inngest and Resend for notifications and background tasks.

## Known Bugs

- Initial database seed script and mock credentials provider currently return stubbed tokens for scaffolding purposes.
- UI components and page views are queued for full implementation in the next phase.

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js (NextAuth v5) Documentation](https://authjs.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Resend Documentation](https://resend.com/docs)
