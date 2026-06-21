# Share Files

This CLI manages a set of fileshare links that can be accessed by a simple fileserver.

## Commands

- `share config --root-url "https://your.domain.com/share/"`: set the root URL to prepend to share links
- `share add "/path/to/file with.extension"`: Creates a new shareable link (or gets an existing shareable link) that can be shared publically
- `share list`: show current shares
- `share remove "/path/to/file with extension"`: remove the file share
- `share remove hashcode`: remove the file share

## Example

`share config --root-url "https://your.domain.com/share/"` to set the root directory. Without this command, you can still share files, but you'll have to complete the URLs manually.

`share list` shows nothing currently shared.

`share add "./README.md"`: create a share for the README.md file

`share list` shows a single share

`share remove "./README.md"`: remove the share for the README.md file

`share list` shows an empty list
