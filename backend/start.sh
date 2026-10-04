#!/bin/bash
# Kills any already-running copy of the bot first so a login-triggered
# start never ends up with two instances double-firing crons/replies.
pkill -f "node .*backend/bot.js" 2>/dev/null
sleep 1

# Resolves via its own invocation path, so this keeps working no matter where
# the project folder is renamed/moved to — as long as ~/.rakeeen-backend (a
# symlink) still points at it. Update that one symlink after a rename;
# nothing here or in the launchd plist needs touching again.
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR" || exit 1
exec /Users/Rakeeen/.nvm/versions/node/v24.21.0/bin/node bot.js
