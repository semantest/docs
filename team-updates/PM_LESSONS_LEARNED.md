# PM Lessons Learned - Tmux Best Practices

## ✅ CORRECT Agent Spawning Method
```bash
# Create windows in main session for easy navigation
tmux new-window -t chatgpt-extension-v2 -n Backend1
tmux new-window -t chatgpt-extension-v2 -n Backend2
tmux new-window -t chatgpt-extension-v2 -n Frontend
# etc...
```

## ❌ What I Did Wrong
```bash
# Created separate sessions - harder to navigate
tmux new-session -d -s backend1
tmux new-session -d -s backend2
# etc...
```

## Why Windows Are Better
1. **Single session navigation**: Can switch with Ctrl+B, n/p
2. **See all agents**: Ctrl+B, w shows window list
3. **Easier coordination**: All in one place
4. **Better for Orchestrator**: Can monitor team easily

## Current Status
- Continuing with separate sessions since team is productive
- 6/7 agents delivered successfully
- Not worth disrupting for navigation improvement
- Will apply lesson in future spawns

## For Next Time
Always use `-t chatgpt-extension-v2 -n AgentName` pattern!

---
Documented: 2025-01-21 23:05 UTC
Lesson Type: Tmux navigation optimization