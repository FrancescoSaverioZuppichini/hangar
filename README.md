# Hangar

Orchestrate cloud dev sandboxes for parallel AI coding tasks. Spawn isolated e2b environments with VSCode, terminal, and your app running - no file conflicts, no branch collisions.

## Requirements

- [Bun](https://bun.sh/) v1.0+
- [GitHub PAT](https://github.com/settings/tokens) with `repo` scope
- [E2B API Key](https://e2b.dev/docs/api-key)

## Quick Start

```bash
# Install dependencies
bun install

# Build everything
bun run build
bun run build --filter=@hangar/shared

# Install CLI globally (editable)
cd apps/cli && bun link && cd ../..

# Initialize a project (run from your git repo)
cd /path/to/your/project
hangar init
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `hangar init` | Configure project sandbox settings, build template |
| `hangar start` | Launch a sandbox from project template |
| `hangar list` | List sandboxes (filters by project alias) |
| `hangar list -a` | List all sandboxes |
| `hangar list -s running` | Filter by status |
| `hangar inspect <id>` | Show sandbox URLs |
| `hangar ui` | Open dashboard |

### Sandbox Management

| Command | Description |
|---------|-------------|
| `hangar sandbox start <templateId>` | Start a sandbox from a template |
| `hangar sandbox kill [id]` | Kill a sandbox (interactive selection if no ID) |
| `hangar sandbox kill --all` | Kill all running sandboxes |
| `hangar sandbox pause <id>` | Pause a running sandbox |
| `hangar sandbox resume <id>` | Resume a paused sandbox |
| `hangar sandbox status <id>` | Show sandbox status |
| `hangar sandbox status <id> -s running` | Set sandbox status manually |
| `hangar sandbox list` | List sandboxes (syncs with E2B) |
| `hangar sandbox list --filter '{"status":"running"}'` | List with filter |

**Options:**
- `-c, --command <cmd>` - Run command on start/resume
- `-b, --background` - Run command in background (don't wait)
- `-y, --yes` - Skip confirmation prompts
- `-a, --all` - Target all sandboxes (kill only)

```bash
hangar start -c "bun run dev" -b
hangar sandbox start my-template -c "git pull && bun install" -b
hangar sandbox resume abc123 -c "bun run dev" --background
hangar sandbox kill -a -y
```

## Development

```bash
# Build all packages
bun run build

# Watch mode (run in separate terminals)
cd packages/shared && bun run dev
cd apps/cli && bun run dev
cd apps/dashboard && bun run dev

# Run dashboard locally
cd apps/dashboard && bun run dev
```

## Project Structure

```
apps/
  cli/           # CLI tool (@hangar/cli)
  dashboard/     # Next.js dashboard
packages/
  shared/        # Shared types, config, db (@hangar/shared)
```

## Config

Global config: `~/.hangar/config.json`
Project config: `.hangar/config.json` (in your repo)

Project config can override global settings.
