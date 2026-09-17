#!/bin/bash
# Kills any already-running copy of the bot first so a login-triggered
# start never ends up with two instances double-firing crons/replies.
pkill -f "node .*backend/bot.js" 2>/dev/null
sleep 1

cd "/Users/Rakeeen/Files/Hamed/H ... Rakeeen/Projects/Rakeeen ... Home/backend" || exit 1
exec /Users/Rakeeen/.nvm/versions/node/v24.21.0/bin/node bot.js
