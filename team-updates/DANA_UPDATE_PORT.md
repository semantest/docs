# 📝 Dana - Update Shell Script Port

## Port has changed from 8080 → 3003

### Required Changes in `generate-image.sh`:

```bash
# Change any references from:
ws://localhost:8080

# To:
ws://localhost:3003
```

### If using curl/websocat:
```bash
# OLD:
echo "$EVENT_JSON" | websocat ws://localhost:8080

# NEW:
echo "$EVENT_JSON" | websocat ws://localhost:3003
```

### Quick Test:
```bash
# Test connection
websocat ws://localhost:3003

# Should connect without errors
```

This aligns with Eva's extension fix. Both client and extension now use port 3003.

Please update and test ASAP!

- PM