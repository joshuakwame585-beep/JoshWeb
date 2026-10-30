# Joshua Web Design Academy — Netlify setup

This ZIP contains the website and Netlify Functions. The site is designed for multiple student records and Arkesel SMS.

## Important: one-time database setup (free tier)
Student records need a database so they remain saved after refreshes and can be managed from different devices. Create a free Supabase project at https://supabase.com.

1. In Supabase, open **SQL Editor**.
2. Open `supabase/schema.sql` from this ZIP, copy its contents into the SQL Editor, and run it.
3. In Supabase **Project Settings → API**, copy the Project URL and the `service_role` key. Keep the service-role key secret.

## Deploy to Netlify
Netlify Functions need a build/deploy from a ZIP or connected repository. If using Netlify Drop, extract the ZIP first and drag the project folder (the folder containing `netlify.toml`) to Netlify. If Drop does not deploy the Functions, create a GitHub repository from the extracted files and import it in Netlify; the Functions are in `netlify/functions`.

## Set environment variables in Netlify
Open **Site configuration → Environment variables** and add:

- `ADMIN_PASSWORD` — choose a strong admin password.
- `SESSION_SECRET` — a long random secret (at least 32 characters).
- `SUPABASE_URL` — your Supabase Project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service_role key.
- `ARKESEL_API_KEY` — your Arkesel SMS API key.
- `ARKESEL_SENDER_ID` — your approved Arkesel sender ID.

After adding or changing environment variables, trigger a new deploy.

## Arkesel
Create an account at https://arkesel.com, generate an SMS API key in the dashboard, and register a sender ID. Sender IDs may need approval before production delivery. Arkesel's current V2 endpoint is `POST https://sms.arkesel.com/api/v2/sms/send`, using the `api-key` header and JSON body containing `sender`, `message`, and `recipients`.

Arkesel says new accounts receive 10 free SMS credits and GH₵0.20 main credit; sandbox testing is available. Free credits are limited, not unlimited. SMS sending uses your Arkesel balance/credits.

## First use
1. Open your deployed site.
2. Sign in with `ADMIN_PASSWORD`.
3. Add each student's name, Ghana phone number, amount due and deadline.
4. Click the SMS button beside a student or enter details in the SMS reminder panel.
5. Check Arkesel's dashboard for delivery status.

## Security notes
- Never put your Arkesel API key, Supabase service-role key, admin password or session secret in `public/` or frontend JavaScript.
- Do not share the service-role key or API key in screenshots or chats.
- The admin session expires after 8 hours.
- This is a small private admin tool, not a full school finance system. Keep your admin password private and only message people who agreed to receive updates.
- Student records are stored in your own Supabase project. You control and can delete that data there.

## Troubleshooting
- `Supabase is not configured`: check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `Incorrect password`: check `ADMIN_PASSWORD`.
- SMS error: verify Arkesel API key, approved sender ID, available credits and Ghana phone format (e.g. 0241234567).
- If Netlify Drop deploys only the static page and not Functions, deploy using a Git-connected Netlify site as described above.
