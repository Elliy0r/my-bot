const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const axios = require('axios');
const sequelize = require('./db');
const UserModel = require('./models')
const token = '8141777064:AAEDCEeg4j-fX_nkk5osPZ59Ptm9HeP0qNQ'
const bot = new TelegramApi(token, { polling: true })
const API_URL = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/';

const tomorrowApiKey = 'DZGXSbC9zCwzoNn6quBk7wAO4x4nXVFC';

const chats = {}

const sendLocationKeyboard = {
    reply_markup: {
        keyboard: [
            [
                { text: "Отправить геолокацию 📍", request_location: true }
            ],
            ["Вернуться в главное меню"]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};
const getSelectedCurrencyRates = async (chatId, username) => {
    try {
        const response = await axios.get(API_URL);
        const rates = response.data;
        const selectedCurrencies = ['USD', 'EUR', 'RUB', 'CAD', 'GBP', 'TRY', 'JPY', 'AED', 'KZT'];
        const filteredRates = rates.filter(rate => selectedCurrencies.includes(rate.Ccy));

        if (filteredRates.length > 0) {
            let message = `💱 Курсы нужных вам валют уважаемый @${username}\n\n`;
            filteredRates.forEach(rate => {
                message += `1 ${rate.Ccy} = ${rate.Rate} UZS\n`;
            });
            bot.sendMessage(chatId, message);
        } else {
            bot.sendMessage(chatId, 'Популярные валюты не найдены.');
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при получении данных. Попробуйте позже.');
        console.error('Ошибка при получении данных:', error.message);
    }
};
const formatDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toISOString();
};
const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен угадать')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай 🥹', gameOptions)

    setTimeout(() => {
        if (chats[chatId]) {
            delete chats[chatId];
            console.log(`Данные для чата ${chatId} удалены из-за бездействия.`);
        }
    }, 5 * 60 * 1000);
}
const getWeather = async (latitude, longitude) => {
    const apiUrl = 'https://api.tomorrow.io/v4/weather/forecast';
    let result = '';
    try {
        const response = await axios.get(apiUrl, {
            params: {
                location: `${latitude},${longitude}`,
                apikey: tomorrowApiKey,
                timesteps: '1d',
                units: 'metric',
            },
        });

        const forecast = response.data.timelines.daily[0];
        const temp = forecast.values.temperatureAvg || 'нет данных';

        result = `Средняя температура: ${temp}°C`;
    } catch (error) {
        console.error('Ошибка запроса к Tomorrow.io:', error.response?.data || error.message);
        result = 'Не удалось получить данные о погоде. Попробуйте позже.';
    }
    return result;
};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.location) {
        const { latitude, longitude } = msg.location;

        const weather = await getWeather(latitude, longitude);
        bot.sendMessage(chatId, weather);
    } 
});
const messageCounts = new Map();
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text || '';
    const messageKey = `${userId}-${text}`;
    
    if (text) {
        const count = messageCounts.get(messageKey) || 0;
        messageCounts.set(messageKey, count + 1);
        if (count + 1 > 100) {
            bot.sendMessage(chatId, `Вы заблокированы за спам!`);
            console.log(`Пользователь ${userId} заблокирован за спам.`);
            return;
        }
    }
});

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log("Подключение к бд сломалось");
    }
    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию о пользователе' },
        { command: '/game', description: 'Угадай цифру' },
        { command: '/exchange', description: 'Курс денег' },
        { command: '/weather', description: 'Погода' }
    ])
    bot.on('message', async msg => {
        console.log(msg)
        const text = msg.text;  
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const isBot = msg.from.is_bot;
        const username = msg.from.username || msg.from.first_name;
        const isPremium = msg.from.is_premium || false;
        const requestDate = formatDate(msg.date);
        const locations = msg.location;
        try {
            if (locations) {
                const { latitude, longitude } = locations;
                const location = `${latitude},${longitude}`;

                await UserModel.upsert({
                    user_id: msg.from.id,
                    username: msg.from.username || null,
                    first_name: msg.from.first_name || null,
                    last_name: msg.from.last_name || null,
                    language_code: msg.from.language_code || null,
                    chat_id: chatId,
                    is_premium: isPremium,
                    message_id: messageId,
                    request_date: requestDate,
                    text: text || null,
                    location: location,
                    is_bot: isBot,
                });
            } else {
                await UserModel.upsert({
                    user_id: msg.from.id,
                    username: msg.from.username || null,
                    first_name: msg.from.first_name || null,
                    last_name: msg.from.last_name || null,
                    language_code: msg.from.language_code || null,
                    chat_id: chatId,
                    is_premium: isPremium,
                    message_id: messageId,
                    request_date: requestDate,
                    text: text || null,
                    is_bot: isBot,
                });
            }
        } catch (error) {
            console.error('Ошибка при сохранении пользователя:', error.message);
        }
        const formattedDate = formatDate(msg.date);
        console.log(`Запрос от пользователя: ${msg.from.first_name} (@${msg.from.username})`);
        console.log(`Дата и время запроса: ${formattedDate}`);
        const mainMenu = {
            reply_markup: {
                keyboard: [
                        ['Угадай цифру 🎲', 'Курсы валют 💸'],
                        ['Погода ⛅️']
                ],
                resize_keyboard: true,
                one_time_keyboard: false 
            }
        };

    if (msg.text === "Вернуться в главное меню") {
        const mainMenu = {
            reply_markup: {
                keyboard: [
                    ['Угадай цифру 🎲', 'Курсы валют 💸'],
                    ['Погода ⛅️']
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            }
        };
        await bot.sendMessage(chatId, "Главное меню", mainMenu);
    }
        if (text === '/start') {
            await bot.sendSticker(chatId, `https://t.me/sssassssssasas/1429`)
            return bot.sendMessage(chatId, `Добро пожаловать в мой телеграм бот 🫠`, mainMenu)
        }
        if (text === '/info') {
            if (msg.from.username) {
                await bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`);
                await bot.sendMessage(chatId, `Никнейм: @${msg.from.username}`);
            } else {
                await bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`);
                return bot.sendMessage(chatId, 'У тебя никнейма нет.');
            }
        }
        if (text === '/game') {
            return startGame(chatId);
        }
        if (text === '/exchange') {
            return getSelectedCurrencyRates(chatId, username);
        }
        if (text === '/weather') {
            return bot.sendMessage(chatId, 'Отправьте геолокацию чтобы узнать среднюю температуру');
        }
        if (text === 'Угадай цифру 🎲') {
            return startGame(chatId);
        }
        if (text === 'Курсы валют 💸') {
            return getSelectedCurrencyRates(chatId, username);
        }
        if (text === 'Погода ⛅️') {
            return bot.sendMessage(chatId, 'Отправьте геолокацию чтобы узнать среднюю температуру', sendLocationKeyboard);
        }
    })
    bot.on('callback_query', async callbackQuery => {
        const { data, message } = callbackQuery;
        const chatId = message.chat.id;

        if (data === '/game') {
            return startGame(chatId);
        }

        if (data === '/exchange') {
            return getSelectedCurrencyRates(chatId, message.from.username);
        }

        if (data === '/weather') {
            return bot.sendMessage(chatId, 'Отправьте геолокацию чтобы узнать среднюю температуру');
        }
        if (data === '/again') {
            return startGame(chatId);
        }

        if (data == chats[chatId]) {
            await bot.sendSticker(chatId, `https://t.me/sssassssssasas/1430`);
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions);
        } else {
            await bot.sendMessage(chatId, `К сожалению, ты не угадал. Бот загадал цифру ${chats[chatId]}`, againOptions);
        }
        delete chats[chatId];
    });
}
start()

