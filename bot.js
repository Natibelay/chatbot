require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);

// =========================
// USER TRACKING
// =========================
const usersFile = 'users.json';
function addUser(userId) {
    let users = [];
    if (fs.existsSync(usersFile)) {
        users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    }
    if (!users.includes(userId)) {
        users.push(userId);
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }
}

// =========================
// START COMMAND & MENU
// =========================
bot.start((ctx) => {
    addUser(ctx.from.id);
    ctx.reply(
        `👋 Hello ${ctx.from.first_name}! Welcome to your Trading & Gold Bot.`,
        Markup.keyboard([
            ['📈 BTC Price', '🟡 Gold Price'],
            ['ℹ️ About Bot', '❓ Help']
        ]).resize()
    );
});

// =========================
// BTC PRICE
// =========================
bot.hears('📈 BTC Price', async (ctx) => {
    try {
        const res = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        ctx.reply(`💰 Bitcoin price: $${res.data.bitcoin.usd}`);
    } catch (err) {
        console.error(err);
        ctx.reply('❌ Failed to fetch BTC price.');
    }
});

// =========================
// GOLD PRICE
// =========================
bot.hears('🟡 Gold Price', async (ctx) => {
    try {
        const res = await axios.get('https://www.goldapi.io/api/XAU/USD', {
            headers: {
                'x-access-token': process.env.GOLD_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        ctx.reply(`💰 Gold price: $${res.data.price} per ounce`);
    } catch (err) {
        console.error(err);
        ctx.reply('❌ Failed to fetch Gold price. Check your API key.');
    }
});

// =========================
// ABOUT BOT
// =========================
bot.hears('ℹ️ About Bot', (ctx) => {
    ctx.reply(
`👨‍💻 Bot Developer: Nati
📍 Addis Ababa, Ethiopia
🔹 Features: BTC & Gold Price, User Tracking, Menu Commands`,
    );
});

// =========================
// HELP
// =========================
bot.hears('❓ Help', (ctx) => {
    ctx.reply(
`Menuuu Commands:
- 📈 BTC Price: Get current Bitcoin price
- 🟡 Gold Price: Get current gold price
- ℹ️ About Bot: Learn about this bot`
    );
});

// =========================
// FALLBACK
// =========================
bot.on('text', (ctx) => {
    ctx.reply("Please use the menu buttons to interact with the bot.");
});

// =========================
// ERROR HANDLING
// =========================
bot.catch((err, ctx) => console.error(`Error for ${ctx.updateType}`, err));

// =========================
// LAUNCH BOT
// =========================
bot.launch().then(() => console.log("🤖 Bot is running..."));

// =========================
// EXPRESS SERVER FOR RENDER
// =========================
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
