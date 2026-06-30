# mcp-app-torneo

Local MCP server for the App Torneo project.

## Run

```bash
npm run mcp:app-torneo
```

## Tools

- `app_context`: returns project and MVP context.
- `openspec_change`: reads the OpenSpec MVP artifacts.
- `env_keys`: lists expected environment variable names without exposing values.

## Codex Config Example

Register the server in Codex with a command equivalent to:

```toml
[mcp_servers.mcp-app-torneo]
command = "npm"
args = ["run", "mcp:app-torneo"]
cwd = "C:\\Proyectos\\AppTorneo\\torneo"
startup_timeout_sec = 30
```
