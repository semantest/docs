# 📝 Dana - Update ALL Scripts with Fallback Logic

## Important: Fallback applies to shell scripts too!

### Update generate-image.sh:

```bash
#!/bin/bash

# Function to check local server
check_local_server() {
  if curl -s -m 2 http://localhost:3003/semantest-signature 2>/dev/null | grep -q '"service":"semantest"'; then
    return 0  # Local server available
  else
    return 1  # Local server not available
  fi
}

# Determine which server to use
if check_local_server; then
  WEBSOCKET_URL="ws://localhost:3003"
  echo "📍 Using local Semantest server"
else
  WEBSOCKET_URL="wss://api.extension.semantest.com"
  echo "☁️  Using public Semantest server"
fi

# Send the image request
EVENT_JSON='{
  "type": "chatgpt:image/download/requested",
  "payload": {
    "prompt": "'"$1"'",
    "metadata": {
      "downloadFolder": "'"${2:-$HOME/Downloads}"'"
    }
  }
}'

echo "🎨 Sending image generation request..."
echo "$EVENT_JSON" | websocat "$WEBSOCKET_URL"
```

### Update ANY other client scripts:

Same pattern for any script that connects to Semantest:
1. Check localhost:3003/semantest-signature
2. Use local if available
3. Fall back to public if not

### Benefits:
- Scripts work without configuration
- Developers use fast local server
- CI/CD uses public server automatically
- No environment variables needed

### Test both modes:
```bash
# With local server running
./generate-image.sh "test"  # Should say "Using local server"

# Stop local server
./generate-image.sh "test"  # Should say "Using public server"
```

This ensures ALL components behave consistently!

- PM