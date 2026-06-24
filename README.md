# Share Files

This CLI manages a set of fileshare links that can be accessed by a simple fileserver.

## Commands

- `share add "/path/to/file with.extension"`: create a shareable link (or get an existing one)
- `share list`: show current shares
- `share remove "/path/to/file with extension"`: remove a share by path
- `share remove hashcode`: remove a share by hash
- `share clear`: remove all shares

## Environment variables

| Variable               | Description                                               | Default                                                       |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| `SHARE_FILES_ROOT_URL` | Public URL prefix for share links shown by the CLI        | `http://localhost:3000`                                       |
| `SHARE_FILES_ROOT`     | Filesystem root; only files under this path can be shared | `process.cwd()` locally; `/shares` in Docker                  |
| `SHARE_FILES_DB`       | Path to the SQLite database file                          | OS-specific config dir locally; `/config/shares.db` in Docker |
| `PORT`                 | HTTP port for the fileserver                              | `3000`                                                        |

`SHARE_FILES_ROOT` is the on-disk directory boundary. `SHARE_FILES_ROOT_URL` is the HTTP prefix for generated links — they are unrelated.

## Local development

```bash
npm run setup
export SHARE_FILES_ROOT_URL=http://localhost:3000
share add "./README.md"
share list
npm run start   # runs the fileserver
```

Without `SHARE_FILES_ROOT` set, paths are scoped to the current working directory. Files outside that directory are rejected.

## Docker

Build and run:

```bash
docker build -t share-files .
docker run -d --name share-files \
  -p 3000:3000 \
  -e SHARE_FILES_ROOT_URL=http://localhost:3000 \
  -v ./appdata:/config \
  -v /mnt/user/share-files:/shares:ro \
  share-files
```

Manage shares via `docker exec`:

```bash
docker exec -it share-files share add "/shares/example.pdf"
docker exec -it share-files share list
docker exec -it share-files share remove "/shares/example.pdf"
```

Paths passed to `share add` must exist under `/shares`. Relative paths are resolved against the share root, so a filename alone is enough (e.g. `share add "example.pdf"`). Note: `share remove` matches on the stored absolute path (e.g. `/shares/example.pdf`) or on the share hash.

## Unraid

1. Build and push the image to your registry, then update `Repository` in [`unraid/share-files.xml`](unraid/share-files.xml).
2. In Unraid, add a custom template URL pointing at the raw XML in this repo (or copy the file locally).
3. Set **SHARE_FILES_ROOT_URL** to your public URL (e.g. `http://[IP]:[PORT:3000]` or a reverse-proxy URL).
4. Set **Share Files** to the host folder you want to share (default `/mnt/user/share-files`). It is mounted read-only at `/shares` inside the container.
5. Manage shares via the container console or SSH:

```bash
docker exec -it share-files share add "/shares/example.mp4"
docker exec -it share-files share list
```

## Example

`share list` shows nothing currently shared.

`share add "./README.md"` creates a share for the README.md file.

`share list` shows a single share with a full URL.

`share remove "./README.md"` removes the share.

`share list` shows an empty list.
