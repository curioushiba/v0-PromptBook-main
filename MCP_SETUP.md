# MCP (Model Context Protocol) Setup

This project now includes MCP packages for enhanced AI context management and browser automation.

## Installed MCP Packages

### 1. Context7 MCP (@upstash/context7-mcp)
- **Purpose**: Enhanced context management for AI applications
- **Version**: 1.0.17
- **Usage**: Provides advanced context handling capabilities

### 2. Playwright MCP (@playwright/mcp)
- **Purpose**: Browser automation and testing with MCP integration
- **Version**: 0.0.36
- **Usage**: Automated browser interactions and testing

## Configuration

The `mcp-config.json` file contains the basic configuration for MCP servers. You'll need to:

1. **Set up Context7 API Key**:
   - Get your API key from [Context7](https://context7.io)
   - Replace `"your-api-key-here"` in `mcp-config.json` with your actual API key

2. **Environment Variables**:
   - Create a `.env.local` file for sensitive configuration
   - Add your Context7 API key: `CONTEXT7_API_KEY=your-actual-key`

## Usage

### Running MCP Servers

```bash
# Start Context7 MCP server
npx @upstash/context7-mcp

# Start Playwright MCP server
npx @playwright/mcp
```

### Integration with Cursor

To use these MCP servers with Cursor:

1. Open Cursor settings
2. Navigate to MCP settings
3. Add the configuration from `mcp-config.json`
4. Restart Cursor to load the MCP servers

## Available Scripts

- `npm run mcp:context7` - Start Context7 MCP server
- `npm run mcp:playwright` - Start Playwright MCP server
- `npm run test:e2e` - Run Playwright end-to-end tests

## Next Steps

1. Configure your Context7 API key
2. Set up your MCP client (like Cursor) to use these servers
3. Start building with enhanced context management and browser automation capabilities
