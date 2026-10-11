This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Security configuration

Client portal access now requires verification of the email address stored on the project's client record. Configure these environment variables before enabling portal verification:

- `RESEND_API_KEY` — API key for the Resend email service.
- `PORTAL_FROM_EMAIL` — a sender address verified with Resend (for example, `ClientFlow <portal@your-verified-domain.com>`).
- `PORTAL_SESSION_SECRET` — a cryptographically random secret of at least 32 characters used to sign short-lived, HttpOnly portal verification cookies.
- `APP_URL` — the public base URL used when generating portal links.

After deploying the schema change, run `npm run db:migrate`. Portal codes expire after 10 minutes, allow at most five attempts, and can be requested no more than once every five minutes per portal. A successful verification cookie lasts 24 hours and is scoped to that portal path. Email verification is sent only to the client email already stored in the database; the portal URL cannot change the destination.

Anyone may still sign in through Kinde and create their own agency. A signed-in Kinde identity is created in ClientFlow on its first authenticated dashboard request; unauthenticated dashboard requests are redirected to `/api/auth/login` before application-user creation.
