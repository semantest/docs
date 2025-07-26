# Semantest CLI API Reference

The Semantest Command Line Interface provides powerful tools for managing distributed tests, configurations, and real-time monitoring.

## Installation

```bash
npm install -g @semantest/cli
# or
yarn global add @semantest/cli
```

## Global Options

All commands support these global options:

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Path to configuration file | `./semantest.config.json` |
| `--server` | `-s` | WebSocket server URL | `ws://localhost:3000` |
| `--verbose` | `-v` | Enable verbose logging | `false` |
| `--quiet` | `-q` | Suppress all output except errors | `false` |
| `--format` | `-f` | Output format (json, table, raw) | `table` |
| `--help` | `-h` | Show help | - |
| `--version` | - | Show version | - |

## Commands

### `semantest init`

Initialize a new Semantest project in the current directory.

```bash
semantest init [project-name] [options]
```

**Arguments:**
- `project-name` - Optional project name (defaults to current directory name)

**Options:**
- `--template <type>` - Project template (basic, advanced, enterprise)
- `--skip-install` - Skip dependency installation
- `--force` - Overwrite existing configuration

**Example:**
```bash
semantest init my-test-project --template advanced
```

### `semantest config`

Manage test configurations.

#### `semantest config create`

Create a new configuration.

```bash
semantest config create [options]
```

**Options:**
- `--name <name>` - Configuration name (required)
- `--browsers <list>` - Comma-separated browser list
- `--parallel <n>` - Number of parallel executions
- `--timeout <ms>` - Global timeout in milliseconds
- `--retries <n>` - Number of retry attempts

**Example:**
```bash
semantest config create --name production --browsers chrome,firefox --parallel 5
```

#### `semantest config list`

List all configurations.

```bash
semantest config list [options]
```

**Options:**
- `--details` - Show full configuration details

#### `semantest config use`

Set active configuration.

```bash
semantest config use <name>
```

**Arguments:**
- `name` - Configuration name to activate

### `semantest test`

Execute tests with various strategies.

#### `semantest test run`

Run tests with specified configuration.

```bash
semantest test run [pattern] [options]
```

**Arguments:**
- `pattern` - Test file pattern (glob supported)

**Options:**
- `--config <name>` - Configuration to use
- `--parallel <n>` - Override parallel execution count
- `--watch` - Watch mode for file changes
- `--bail` - Stop on first failure
- `--dry-run` - Show what would run without executing

**Example:**
```bash
semantest test run "**/*.test.ts" --config production --parallel 10
```

#### `semantest test status`

Get current test execution status.

```bash
semantest test status [options]
```

**Options:**
- `--json` - Output as JSON
- `--follow` - Follow status updates in real-time

### `semantest monitor`

Real-time test monitoring and analytics.

```bash
semantest monitor [options]
```

**Options:**
- `--dashboard` - Launch web dashboard
- `--metrics` - Show performance metrics
- `--events` - Show event stream
- `--filter <type>` - Filter events by type

**Example:**
```bash
semantest monitor --dashboard --metrics
```

### `semantest event`

Manage and inspect events.

#### `semantest event list`

List recent events.

```bash
semantest event list [options]
```

**Options:**
- `--limit <n>` - Number of events to show
- `--type <type>` - Filter by event type
- `--since <time>` - Show events since timestamp

#### `semantest event stream`

Stream events in real-time.

```bash
semantest event stream [options]
```

**Options:**
- `--type <type>` - Filter by event type
- `--pretty` - Pretty print JSON events

### `semantest server`

Manage Semantest server connections.

#### `semantest server connect`

Connect to a Semantest server.

```bash
semantest server connect <url> [options]
```

**Arguments:**
- `url` - WebSocket server URL

**Options:**
- `--auth <token>` - Authentication token
- `--retry` - Enable auto-reconnect

#### `semantest server status`

Check server connection status.

```bash
semantest server status [options]
```

**Options:**
- `--detailed` - Show detailed server info

### `semantest generate`

Generate test code and configurations.

```bash
semantest generate <type> [name] [options]
```

**Arguments:**
- `type` - Generation type (test, config, module)
- `name` - Resource name

**Options:**
- `--template <name>` - Template to use
- `--output <path>` - Output directory

**Example:**
```bash
semantest generate test login-flow --template e2e
```

## Configuration File

The CLI uses a configuration file (`semantest.config.json`) for project settings:

```json
{
  "version": "2.0.0",
  "server": {
    "url": "ws://localhost:3000",
    "auth": {
      "type": "token",
      "token": "${SEMANTEST_TOKEN}"
    }
  },
  "configurations": {
    "default": {
      "browsers": ["chrome"],
      "parallel": 1,
      "timeout": 30000,
      "retries": 0
    },
    "production": {
      "browsers": ["chrome", "firefox", "safari"],
      "parallel": 5,
      "timeout": 60000,
      "retries": 2,
      "reporter": ["json", "html"]
    }
  },
  "paths": {
    "tests": "./tests",
    "reports": "./reports",
    "screenshots": "./screenshots"
  }
}
```

## Environment Variables

The CLI respects these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SEMANTEST_SERVER` | WebSocket server URL | `ws://localhost:3000` |
| `SEMANTEST_TOKEN` | Authentication token | - |
| `SEMANTEST_CONFIG` | Configuration file path | `./semantest.config.json` |
| `SEMANTEST_LOG_LEVEL` | Log level (error, warn, info, debug) | `info` |
| `SEMANTEST_TIMEOUT` | Global timeout override | - |

## Exit Codes

The CLI uses standard exit codes:

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |
| 3 | Connection error |
| 4 | Test failure |
| 5 | Timeout |

## Examples

### Basic Test Execution
```bash
# Run all tests with default configuration
semantest test run

# Run specific test files
semantest test run "src/**/*.e2e.ts"

# Run with specific configuration
semantest test run --config production
```

### Configuration Management
```bash
# Create development configuration
semantest config create --name dev --browsers chrome --parallel 1

# Create production configuration
semantest config create --name prod --browsers chrome,firefox,safari --parallel 10

# Switch to production
semantest config use prod
```

### Real-time Monitoring
```bash
# Monitor with dashboard
semantest monitor --dashboard

# Stream events with filtering
semantest event stream --type TestCompleted --pretty
```

### CI/CD Integration
```bash
# CI-friendly execution
semantest test run --config ci --format json --quiet

# With environment variables
SEMANTEST_TOKEN=xxx semantest test run --bail
```

## Plugin System

The CLI supports plugins for extended functionality:

```bash
# Install a plugin
semantest plugin install @semantest/plugin-report-slack

# List installed plugins
semantest plugin list

# Configure plugin
semantest plugin config slack --webhook-url https://...
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```bash
   semantest server status --detailed
   ```

2. **Configuration Not Found**
   ```bash
   semantest config list
   ```

3. **Authentication Error**
   ```bash
   export SEMANTEST_TOKEN=your-token
   semantest server connect ws://server --auth $SEMANTEST_TOKEN
   ```

### Debug Mode

Enable debug logging:
```bash
SEMANTEST_LOG_LEVEL=debug semantest test run -v
```

### Getting Help

```bash
# General help
semantest --help

# Command-specific help
semantest test --help
semantest test run --help
```