# EGE LAB — Accounts & Growth Roadmap

## Product goal
Free, reliable preparation for Russian, advanced mathematics, and informatics EGE. Success is improvement in topic mastery and voluntary weekly retention, not raw time spent.

## Phase 0 — audit before implementation
- Verify current Supabase auth flow: sign-up, email verification, sign-in, sign-out, reset password, expired sessions, duplicate emails.
- Inspect SQL migrations and deployed RLS policies; never trust UI-only authorization.
- Check whether local progress is merged with an account or overwritten when logging in.
- Test on iPhone Safari and desktop. Verify PWA caching and offline behavior.
- Validate exercise answers and explanations against 2027 FIPI specifications; label original exercises.

## Phase 1 — reliable accounts
- Supabase Auth with email confirmation, password reset and clear error messages.
- profiles: user_id (PK/FK auth.users), nickname, created_at, optional avatar; public nickname only by user choice.
- user_progress: user_id, subject, topic, answered, correct, updated_at.
- attempts: user_id, question_id, selected_answer, correct, created_at; private per owner.
- Implement RLS for SELECT/INSERT/UPDATE/DELETE by auth.uid() for private tables.
- For public leaderboards, expose a separate privacy-safe aggregate view or server-side RPC, never raw attempts, emails or personal notes.
- Provide export and deletion workflows. Avoid collecting school, real name, birthdate or exact location.
- Ensure idempotent syncing and conflict handling when switching devices.

## Phase 2 — learning efficacy
- Each exercise: subject, topic, difficulty, solution, explanation, misconception tags, source/version.
- After an incorrect answer: show explanation and schedule a similar question later.
- Track mastery per topic from repeated independent attempts, not clicks or streaks.
- Weekly short diagnostic; compare first-attempt accuracy on comparable tasks.
- Keep all core preparation features free; avoid punitive streaks or addictive mechanics.

## Phase 3 — safe social growth
- Optional invite link, no contact harvesting or automated messages.
- Private study groups joined by invite; nickname-only member display.
- Opt-in leaderboard; easy opt-out, no publication of raw scores or weaknesses.
- Anonymous feedback form and issue triage.
- Invite 5–10 testers, address defects, then gradually invite more students.

## Measurements
- Activation: percentage of sign-ups completing a meaningful first training.
- Learning: improvement in first-attempt accuracy on comparable follow-up questions.
- Retention: percentage of consenting users returning to practice after 7 days.
- Reliability: sign-in success, sync errors, broken exercises.
- Privacy: RLS tests pass; no personal data in public leaderboards.

## Release gates
1. Authentication + recovery tested.
2. Cross-device progress tested without data loss.
3. RLS verified with two independent test accounts.
4. Question answers reviewed.
5. Mobile navigation and accessibility checked.
6. Deploy only after explicit review of the pull request.
