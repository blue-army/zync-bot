# Setup instructions for local testing/development:
- Check that botbuilder, botbuilder-azure, and restify are installed
- Install the Bot Framework Emulator (https://docs.microsoft.com/en-us/bot-framework/debug-bots-emulator)
  - Make sure to leave the App ID and App Password fields blank
- export NODE_ENV=development to run in development mode
- Run index.js to start the server
- Interact with the bot at http://localhost:3978/api/messages via the emulator
