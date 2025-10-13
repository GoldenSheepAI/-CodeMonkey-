# 🔌 MCP Servers Guide for CodeMonkey

Model Context Protocol (MCP) servers extend CodeMonkey's capabilities by connecting to external tools and services.

## Quick Start

MCP servers are **disabled by default** to avoid connection errors. Enable them in `agents.config.json` as needed.

---

## 🚀 Coming Soon: 15 Best MCP Servers for CodeMonkey

These powerful MCP servers will be integrated into CodeMonkey to supercharge your development workflow:

### Developer Workflow

#### 1. **GitHub MCP** 🐙
Full GitHub automation with OAuth-scoped APIs.
- **Tools:** `createIssue`, `commentOnPR`, `getRepoInfo`, `createBranch`, `updateFile`
- **Use cases:** Automated PR management, issue tracking, repository operations

#### 2. **Jira MCP** 📋
Comprehensive Jira ticket management.
- **Tools:** `createTicket`, `addComment`, `listAssignedIssues`, `transitionIssue`
- **Use cases:** Sprint planning, ticket automation, workflow management

#### 3. **GPT Pilot MCP** 🚁
Full-stack AI workflow orchestration from code to deployment.
- **Tools:** `generateCode`, `runTests`, `triggerDeploy`
- **Use cases:** Autonomous development, CI/CD automation, multi-step workflows

### Memory & Planning

#### 4. **Memory Bank MCP** 🧠
Persistent memory across sessions.
- **Tools:** `storeEntry`, `queryEntries`, `deleteEntry`
- **Use cases:** Context retention, session memory, structured data storage

#### 5. **Knowledge Graph MCP** 🕸️
Internal graph for reasoning and entity linking.
- **Tools:** `addNode`, `addEdge`, `queryGraph`
- **Use cases:** Dependency management, entity relationships, graph traversal

#### 6. **Sequential Planner MCP** 📝
Break complex tasks into sequenced steps.
- **Tools:** `createPlan`, `getNextTask`, `markTaskDone`
- **Use cases:** Task decomposition, hierarchical planning, execution tracking

### Automation & Testing

#### 7. **Playwright MCP** 🎭
Browser automation with Playwright.
- **Tools:** `openPage`, `click`, `type`, `assertVisible`, `screenshot`
- **Use cases:** UI testing, regression suites, frontend validation

#### 8. **Puppeteer MCP** 🎪
Fast browser control with Puppeteer.
- **Tools:** `navigate`, `clickElement`, `extractText`, `screenshot`
- **Use cases:** Web scraping, UI checks, DOM interactions

#### 9. **Selenium MCP** 🌐
Classic browser automation with real browsers.
- **Tools:** `navigate`, `findElement`, `click`, `sendKeys`, `getPageSource`
- **Use cases:** Cross-browser testing, headless automation

### Execution & Workflow Control

#### 10. **Desktop Commander MCP** 💻
Local system command and file manager.
- **Tools:** `execCommand`, `readFile`, `writeFile`, `listDirectory`
- **Use cases:** File operations, shell scripting, local automation

#### 11. **OpenAgents MCP** 🤖
Multi-agent coordination and task delegation.
- **Tools:** `registerAgent`, `sendTask`, `getStatus`, `listAgents`
- **Use cases:** Agent orchestration, distributed workflows

#### 12. **Continue MCP** ⏸️
Checkpointing for long-running workflows.
- **Tools:** `saveCheckpoint`, `resumeCheckpoint`, `listCheckpoints`
- **Use cases:** Crash recovery, state management, session persistence

### Data & Security

#### 13. **Fetch Service MCP** 🌐
Web content ingestion and parsing.
- **Tools:** `fetchHTML`, `fetchMarkdown`, `fetchJSON`
- **Use cases:** Content scraping, API consumption, data ingestion

#### 14. **Supabase MCP** 🗄️
Structured database access with Supabase.
- **Tools:** `select`, `insert`, `update`, `delete`
- **Use cases:** Database operations, schema introspection, data management

#### 15. **Snyk MCP** 🔒
Security scanning and vulnerability detection.
- **Tools:** `runScan`, `getIssues`, `generateFixPR`
- **Use cases:** Security audits, CVE detection, automated fixes

---

## Popular MCP Servers

### 1. **Filesystem Server** 📁
Access local files and directories.

```json
{
  "name": "filesystem",
  "enabled": true,
  "command": "npx",
  "args": [
    "@modelcontextprotocol/server-filesystem",
    "/Users/yourusername/projects"
  ],
  "description": "Access local filesystem"
}
```

**Use cases:**
- Read/write project files
- Search through codebases
- File operations

### 2. **GitHub Server** 🐙
Interact with GitHub repositories.

```json
{
  "name": "github",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_TOKEN": "ghp_your_token_here"
  },
  "description": "GitHub repository access"
}
```

**Use cases:**
- Create/update issues
- Review pull requests
- Search repositories
- Manage branches

**Get token:** https://github.com/settings/tokens

### 3. **Git Server** 🌿
Git operations and repository management.

```json
{
  "name": "git",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-git"],
  "description": "Git operations"
}
```

**Use cases:**
- Commit changes
- Create branches
- View git history
- Manage remotes

### 4. **Brave Search** 🔍
Web search capabilities.

```json
{
  "name": "brave-search",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "your_brave_api_key"
  },
  "description": "Web search via Brave"
}
```

**Use cases:**
- Search the web
- Find documentation
- Research topics

**Get API key:** https://brave.com/search/api/

### 5. **Postgres Server** 🐘
PostgreSQL database access.

```json
{
  "name": "postgres",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:pass@localhost:5432/dbname"
  },
  "description": "PostgreSQL database"
}
```

**Use cases:**
- Query databases
- Schema inspection
- Data analysis

### 6. **Puppeteer Server** 🎭
Browser automation and web scraping.

```json
{
  "name": "puppeteer",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-puppeteer"],
  "description": "Browser automation"
}
```

**Use cases:**
- Web scraping
- Screenshot capture
- Automated testing
- Form filling

### 7. **Slack Server** 💬
Slack workspace integration.

```json
{
  "name": "slack",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-token",
    "SLACK_TEAM_ID": "T1234567"
  },
  "description": "Slack integration"
}
```

**Use cases:**
- Send messages
- Read channels
- Manage workspace

### 8. **Memory Server** 🧠
Persistent memory across sessions.

```json
{
  "name": "memory",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-memory"],
  "description": "Persistent memory"
}
```

**Use cases:**
- Remember user preferences
- Store context between sessions
- Long-term memory

### 9. **Sequential Thinking** 🤔
Enhanced reasoning capabilities.

```json
{
  "name": "sequential-thinking",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-sequential-thinking"],
  "description": "Enhanced reasoning"
}
```

**Use cases:**
- Complex problem solving
- Step-by-step reasoning
- Planning

### 10. **Fetch Server** 🌐
HTTP requests and API calls.

```json
{
  "name": "fetch",
  "enabled": true,
  "command": "npx",
  "args": ["@modelcontextprotocol/server-fetch"],
  "description": "HTTP requests"
}
```

**Use cases:**
- API testing
- Data fetching
- Web requests

## How to Enable MCP Servers

### 1. Edit `agents.config.json`

```json
{
  "codemonkey": {
    "providers": [...],
    "mcpServers": [
      {
        "name": "filesystem",
        "enabled": true,
        "command": "npx",
        "args": [
          "@modelcontextprotocol/server-filesystem",
          "/Users/yourusername/projects"
        ],
        "description": "Access local filesystem"
      }
    ]
  }
}
```

### 2. Restart CodeMonkey

```bash
/restart
```

Or:
```bash
./start-with-restart.sh
```

### 3. Verify Connection

```bash
/mcp
```

Should show connected servers.

## Recommended Combinations

### For Web Development:
- ✅ filesystem
- ✅ git
- ✅ github
- ✅ puppeteer

### For Data Work:
- ✅ filesystem
- ✅ postgres
- ✅ fetch
- ✅ brave-search

### For Team Collaboration:
- ✅ github
- ✅ slack
- ✅ git
- ✅ memory

## Troubleshooting

### "Connection closed" Error

**Problem:** MCP server is enabled but not configured properly.

**Solution:**
1. Set `"enabled": false` if not using
2. Or configure with proper credentials
3. Restart CodeMonkey

### "Command not found"

**Problem:** MCP server package not installed.

**Solution:**
```bash
# Install globally
npm install -g @modelcontextprotocol/server-filesystem

# Or let npx handle it (slower first time)
```

### Permission Denied

**Problem:** Filesystem server can't access directory.

**Solution:**
- Use absolute paths
- Check directory permissions
- Ensure directory exists

## Security Notes

⚠️ **Important:**
- Never commit API keys to git
- Use environment variables for sensitive data
- Limit filesystem access to specific directories
- Review MCP server permissions

## More MCP Servers

Browse all available servers:
- https://github.com/modelcontextprotocol
- https://www.npmjs.com/search?q=%40modelcontextprotocol

## Example: Complete Setup

```json
{
  "codemonkey": {
    "providers": [
      {
        "name": "Local Ollama",
        "enabled": true,
        "baseUrl": "http://localhost:11434/v1",
        "models": [],
        "autoDetectModels": true
      }
    ],
    "mcpServers": [
      {
        "name": "filesystem",
        "enabled": true,
        "command": "npx",
        "args": [
          "@modelcontextprotocol/server-filesystem",
          "/Users/yourusername/projects"
        ]
      },
      {
        "name": "git",
        "enabled": true,
        "command": "npx",
        "args": ["@modelcontextprotocol/server-git"]
      },
      {
        "name": "github",
        "enabled": true,
        "command": "npx",
        "args": ["@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "ghp_your_token_here"
        }
      }
    ]
  }
}
```

---

**Need help?** Type `/mcp` in CodeMonkey to see MCP server status!
