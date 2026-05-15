# Mobile Publishing Security

The `/write/` page is a static-page writing console. It must be protected by the web server before it is exposed on the public internet.

## Current rules

- Do not store the GitHub token in `localStorage`.
- Protect `/write/` with HTTP Basic Auth or an equivalent server-side access control.
- Use a fine-grained GitHub token limited to the `Aeghur/Firefly` repository.
- Grant only `Contents: Read and write`.
- Revoke and recreate the token if a phone or browser profile is lost.
- Keep SSH deploy access limited to the `deploy` user and `/var/www/blog`.

## Nginx Basic Auth

Create a password file:

```bash
sudo apt update
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.firefly-write.htpasswd aeghur
```

Add this inside the site's `server { ... }` block:

```nginx
location = /write {
    auth_basic "Firefly Writer";
    auth_basic_user_file /etc/nginx/.firefly-write.htpasswd;
    return 301 /write/;
}

location ^~ /write/ {
    auth_basic "Firefly Writer";
    auth_basic_user_file /etc/nginx/.firefly-write.htpasswd;
    try_files $uri $uri/ =404;
}
```

Validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## What not to do

- Do not put a GitHub token in the repository.
- Do not bake a token into the static JavaScript bundle.
- Do not give the deploy SSH key sudo access.
- Do not reuse a personal SSH key as the GitHub Actions deploy key.
