# Vanish Email MCP Server

[![npm version](https://img.shields.io/npm/v/@vanish-email/mcp.svg)](https://www.npmjs.com/package/@vanish-email/mcp)
[![Build & Release](https://github.com/coldpatch/vanish-mcp/actions/workflows/publish.yml/badge.svg)](https://github.com/coldpatch/vanish-mcp/actions/workflows/publish.yml)

A Model Context Protocol (MCP) server for [Vanish Email](https://vanish.host), allowing AI agents to manage temporary email addresses and read incoming messages.

## Features

- **Get Domains**: List available email domains.
- **Generate Email**: Create unique temporary email addresses.
- **List Emails**: Check for incoming messages in a mailbox.
- **Get Email**: Read the full content of a specific email, including attachments.
- **Delete Email/Mailbox**: Clean up temporary data.

## Installation & Configuration

### 1. Claude Desktop

Add this to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
	"mcpServers": {
		"vanish-email": {
			"command": "npx",
			"args": ["-y", "@vanish-email/mcp"],
			"env": {
				"VANISH_API_KEY": "your_api_key_here"
			}
		}
	}
}
```

### 2. Cursor

Add to `~/.cursor/mcp.json` (or `%USERPROFILE%\.cursor\mcp.json` on Windows):

```json
{
	"mcpServers": {
		"vanish-email": {
			"command": "npx",
			"args": ["-y", "@vanish-email/mcp"],
			"env": {
				"VANISH_API_KEY": "your_api_key_here"
			}
		}
	}
}
```

### 3. VS Code (GitHub Copilot)

Ensure `chat.mcp.enabled` is set to `true` in settings. Then add to your workspace or user `mcp.json`:

```json
{
	"mcpServers": {
		"vanish-email": {
			"command": "npx",
			"args": ["-y", "@vanish-email/mcp"],
			"env": {
				"VANISH_API_KEY": "your_api_key_here"
			}
		}
	}
}
```

### 4. Claude Code (CLI)

Run the following command:

```bash
claude mcp add vanish-email --scope project --env VANISH_API_KEY=your_api_key_here -- npx -y @vanish-email/mcp
```

### 5. Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
	"mcpServers": {
		"vanish-email": {
			"command": "npx",
			"args": ["-y", "@vanish-email/mcp"],
			"env": {
				"VANISH_API_KEY": "your_api_key_here"
			}
		}
	}
}
```

## Available Tools

- `get-domains`: Get list of available email domains.
- `generate-email`: Generate a unique temporary email address.
  - `domain` (optional): Specific domain to use.
  - `prefix` (optional): Prefix for the email address.
- `list-emails`: List emails for a mailbox address.
  - `address`: The email address to check.
  - `limit` (optional): Max emails to return.
- `get-email`: Get full details of a specific email.
  - `emailId`: The ID of the email to retrieve.
- `delete-email`: Delete a specific email.
  - `emailId`: The ID of the email to delete.
- `delete-mailbox`: Delete all emails in a mailbox.
  - `address`: The email address of the mailbox to clear.

## License

MIT
