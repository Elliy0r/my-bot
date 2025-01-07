const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require ('./options')
const axios = require('axios');
const token = '8141777064:AAEDCEeg4j-fX_nkk5osPZ59Ptm9HeP0qNQ'

const bot = new TelegramApi(token, { polling: true })
const API_URL = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/';


const chats = {}
// const getUsdRate = async (chatId) => {
//     try {
//         const response = await axios.get(API_URL);
//         const rates = response.data;

//         const usdRate = rates.find(rate => rate.Ccy === 'USD');
//         if (usdRate) {
//               bot.sendMessage(chatId,`1 USD = ${usdRate.Rate} UZS so'm`);
//         } else {
//             console.log('Курс USD не найден.');
//         }
//     } catch (error) {
//         console.error('Ошибка при получении данных:', error.message);
//     }
// }
// const getCurrencyRate = async (chatId, currencyCode) => {
//     try {
//         const response = await axios.get(API_URL);
//         const rates = response.data;

//         // Ищем курс для переданной валюты
//         const currencyRate = rates.find(rate => rate.Ccy === currencyCode.toUpperCase());
//         if (currencyRate) {
//             bot.sendMessage(chatId, `1 ${currencyRate.Ccy} = ${currencyRate.Rate} UZS so'm`);
//         } else {
//             bot.sendMessage(chatId, `Курс для ${currencyCode} не найден.`);
//         }
//     } catch (error) {
//         bot.sendMessage(chatId, 'Ошибка при получении данных. Попробуйте позже.');
//         console.error('Ошибка при получении данных:', error.message);
//     }
// };
// const getAllCurrencyRates = async (chatId) => {
//     try {
//         const response = await axios.get(API_URL);
//         const rates = response.data;

//         if (rates && rates.length > 0) {
//             let message = "💱 Курсы валют:\n\n";
//             rates.forEach(rate => {
//                 message += `1 ${rate.Ccy} = ${rate.Rate} UZS\n`;
//             });
//             bot.sendMessage(chatId, message);
//         } else {
//             bot.sendMessage(chatId, 'Курсы валют не найдены.');
//         }
//     } catch (error) {
//         bot.sendMessage(chatId, 'Ошибка при получении данных. Попробуйте позже.');
//         console.error('Ошибка при получении данных:', error.message);
//     }
// };
const getSelectedCurrencyRates = async (chatId, username) => {
    try {
        const response = await axios.get(API_URL);
        const rates = response.data;

        // Укажите нужные валюты
        const selectedCurrencies = ['USD', 'EUR', 'RUB', 'CAD', 'GBP', 'TRY', 'JPY', 'AED', 'KZT'];

        // Фильтруем данные по выбранным валютам
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
    const date = new Date(unixTimestamp * 1000); // Преобразуем секунды в миллисекунды
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZoneName: 'short' 
    };
    return date.toLocaleString('ru-RU', options); // Локализация для русского языка
};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен угадать')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай 🥹', gameOptions )
}
const start = () => {

    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию о пользователе' },
        { command: '/game', description: 'Угадай цифру' },
        { command: '/exchange', description: 'Курс денег' },
    ])

    bot.on('message', async msg => {
        console.log(msg)
        const text = msg.text;
        const chatId = msg.chat.id;
        const username = msg.from.username || msg.from.first_name;
        const formattedDate = formatDate(msg.date);

        // Выводим в консоль
        console.log(`Запрос от пользователя: ${msg.from.first_name} (@${msg.from.username})`);
        console.log(`Дата и время запроса: ${formattedDate}`);
        if (text === '/start') {
            await bot.sendSticker(chatId, `https://t.me/sssassssssasas/1429`)
            return bot.sendMessage(chatId, `Добро пожаловать в мой телеграм бот`)
        }
        if (text === '/info') {
            if (msg.from.username) {
                await bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`);
                return bot.sendMessage(chatId, `Никнейм: @${msg.from.username}`)
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
        return bot.sendMessage(chatId, 'Я не понимаю попробуй еще раз!')
    })
    
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId =  msg.message.chat.id;
        if(data === '/again'){
            return startGame(chatId);
        }
        if(data == chats[chatId]){
            await bot.sendSticker(chatId, `https://t.me/sssassssssasas/1430`)
            return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else{ 
            return bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
    })
}
start()

