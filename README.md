# Share Files

A CLI and HTTP server for creating opaque download links to files on disk. Shares are stored in SQLite, served by a small Fastify app, and managed from the command line.

Each share gets a random 32-character hex **key** that appears in the download URL. The file size is recorded when the share is created and checked on every download — if the file is missing or its size has changed, the link stops working.

## Requirements

- Node.js >= 24.15.0

## Setup

```bash
npm install
npm run setup   # build and npm link — installs the `share` command globally
```

To remove the global link:

```bash
npm run teardown
```

## How it works

The CLI and server share the same SQLite database.

| Component | Role |
|-----------|------|
| `share` CLI | Add, list, remove shares; configure the public root URL |
| HTTP server | Serves files at `GET /:key` on port 3000 |
| SQLite | Stores share metadata (path, key, filesize, timestamps) |

**Database location**

- macOS: `~/Library/Application Support/share-files/shares.db`
- Linux: `~/.config/share-files/shares.db`
- Override with `SHARE_FILES_DB` (useful in Docker — mount a host volume at that path)

**Root URL**

Set the public base URL once so `share list` prints complete links:

```bash
share config --root-url "https://files.example.com"
```

Without this, links default to `http://localhost:3000/<key>`.

## Commands

### `share config`

View or update configuration.

```bash
share config
share config --root-url "https://files.example.com"
```

Trailing slashes on the root URL are stripped automatically.

### `share add <path>`

Create a share for a file, or print the existing share if that path is already registered.

```bash
share add "/path/to/file.pdf"
share add "./README.md" --expires "2026-12-31"
```

- The path must exist, be a regular file, and be readable.
- `--expires` accepts any date string understood by JavaScript's `Date` parser (stored as ISO 8601).
- Re-adding the same path returns the existing share without creating a duplicate.

### `share list`

Print all shares as a table (path, key, filesize, created date, expiration, URL).

```bash
share list
```

### `share remove <pathOrKey>`

Remove a share by file path or key.

```bash
share remove "/path/to/file.pdf"
share remove a1b2c3d4e5f6789012345678abcdef01
```

### `share clear`

Delete all shares from the database.

```bash
share clear
```

## HTTP server

Start the server:

```bash
npm start
# or during development:
npm run dev:server
```

The server listens on `0.0.0.0:3000`.

### Download endpoint

```
GET /:key
```

- **200** — file download. Response includes `Content-Length` (bytes) and `Content-Disposition` with the original filename.
- **404** — unknown key, or the file no longer exists on disk.
- **410** — share expired, or the file size changed since the share was created.

The key must be exactly 32 lowercase hex characters (16 random bytes).

## Example workflow

```bash
# configure the public URL
share config --root-url "https://files.example.com"

# create a share
share add "./README.md"

# list shares (includes the full URL)
share list

# download via the server (using the key from list output)
curl -OJ "http://localhost:3000/<key>"

# remove by path or key
share remove "./README.md"
share list
```

## Development

```bash
npm run dev          # watch-build CLI and server
npm run typecheck    # TypeScript check
npm run format       # Prettier
npm run build        # production build to dist/
```

The CLI entry point is `dist/cli.js` (`share`); the server is `dist/server.js`.
