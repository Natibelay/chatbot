require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// =========================
// START COMMAND & MENU
// =========================
bot.start((ctx) => {
    ctx.reply(
        `Hello ${ctx.from.first_name}! Welcome to our bot.`,
        Markup.keyboard([
            ['🔹 BTC Price', '🔹 Gold Price'],
            ['🔹 About Bot', '🔹 Help']
        ]).resize()
    );
});

// =========================
// BTC PRICE
// =========================
bot.hears('🔹 BTC Price', async (ctx) => {
    try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        ctx.reply(`Bitcoin price: $${res.data.bitcoin.usd}`);
    } catch (err) {
        console.error(err);
        ctx.reply('❌ Failed to fetch BTC price.');
    }
});

// =========================
// GOLD PRICE
// =========================
bot.hears('🔹 Gold Price', async (ctx) => {
    try {
        const res = await axios.get('https://www.goldapi.io/api/XAU/USD', {
            headers: {
                'x-access-token': 'goldapi-abt0wusmd8o1lzm-io',
                'Content-Type': 'application/json'
            }
        });
        ctx.reply(`Gold price: $${res.data.price} per gram`);
    } catch (err) {
        console.error(err);
        ctx.reply('❌ Failed to fetch gold price. Make sure you have a valid API key.');
    }
});

// =========================
// ABOUT BOT
// =========================
bot.hears('🔹 About Bot', (ctx) => {
    ctx.reply("This bot is developed by Nati Belay. 👨‍💻\n\nProvides BTC & Gold prices and info about the bot.");
});

// =========================
// HELP
// =========================
bot.hears('🔹 Help', (ctx) => {
    ctx.reply(
`Menu Commands:
- 🔹 BTC Price: Get current Bitcoin price
- 🔹 Gold Price: Get current gold price
- 🔹 About Bot: Learn about this bot`
    );
});

// =========================
// FALLBACK FOR UNKNOWN TEXT
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

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
