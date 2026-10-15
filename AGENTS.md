<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Load privileged database clients inside authorized server-function handlers, never at module scope, to prevent server-only dependencies entering the browser bundle.
- Apply existing SQL migrations chronologically using the managed migration tool; Drizzle records applied migrations and regenerates database types.
- Keep tracking records private; validated server lookups are read-only and must never fabricate orders or delivery movements.
- Password-authorized admin refreshes private funnel data through server polling because anonymous realtime has no SELECT access.
