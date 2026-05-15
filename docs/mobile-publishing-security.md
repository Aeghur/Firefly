# Mobile Publishing Security

The `/write/` page is a static-page writing console. Its local unlock password is a convenience guard for the current browser, not real server-side authentication.

## Current rules

- Do not store the GitHub token in `localStorage`.
- Use a fine-grained GitHub token limited to the `Aeghur/Firefly` repository.
- Grant only `Contents: Read and write`.
- Revoke and recreate the token if a phone or browser profile is lost.
- Keep SSH deploy access limited to the `deploy` user and `/var/www/blog`.

## Recommended server protection

Protect `/write/` at the web server layer before relying on it from the public internet.

For Nginx, add HTTP Basic Auth or an IP allowlist for the `/write/` location. The static-page unlock is still useful after that, but it should not be the only protection.

## What not to do

- Do not put a GitHub token in the repository.
- Do not bake a token into the static JavaScript bundle.
- Do not give the deploy SSH key sudo access.
- Do not reuse a personal SSH key as the GitHub Actions deploy key.
