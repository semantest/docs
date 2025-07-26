# 📢 Team Update: Communication Protocol Enhancement

## TO: Alex, Eva, Dana, Quinn, Sam

### We're keeping send-claude-message.sh AND adding log markers!

## Continue Using (for important messages):
```bash
./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: "Your message"
```

## NEW: Add These Markers to Your Output

When you print/echo in your normal work, include these markers:

### Status Markers:
```python
# Python
print("[PM-STATUS] Starting WebSocket integration...")
print("[PM-PROGRESS] 50% complete")
print("[PM-COMPLETE] WebSocket integration done!")

# JavaScript
console.log("[PM-BLOCKED] Cannot find config file");
console.log("[PM-ERROR] Connection failed: " + error);

# Bash
echo "[PM-INFO] Using local server at port 3003"
```

## Marker Reference:
- `[PM-STATUS]` → General updates
- `[PM-BLOCKED]` → Need PM help! 
- `[PM-PROGRESS]` → Show % complete
- `[PM-COMPLETE]` → Task done
- `[PM-ERROR]` → Problems occurring
- `[PM-INFO]` → Important info

## When to Use What:

### send-claude-message.sh for:
- 🚨 Blockers
- ✅ Major completions  
- ❓ Questions
- 📊 Important decisions

### Log markers for:
- 📈 Progress tracking
- ℹ️ Status updates
- 🔍 Debugging info
- 📝 General visibility

## Example Workflow:
```python
print("[PM-STATUS] Starting image handler integration")
# ... do work ...
print("[PM-PROGRESS] 25% - Added event listeners")
# ... more work ...
print("[PM-PROGRESS] 75% - Testing connection")
# ... hit issue ...
print("[PM-ERROR] Port 3003 already in use")
# Send critical message
os.system('./tmux-orchestrator/send-claude-message.sh semantest:0 @PM: "[PM-BLOCKED] Port conflict, need guidance"')
```

## Benefits:
- I can monitor your progress
- You don't need to send every update
- Critical issues still get immediate attention
- Better visibility without spam

Start using markers in your output today!

- PM