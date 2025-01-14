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
const getHoroscope = async (sign, date) => {
    try {
        const response = await axios.post('https://aztro.sameerkumar.website/', null, {
            params: {
                sign: sign,
                day: date 
            }
        });
        return response.data.description;
    } catch (error) {
        console.error('Ошибка при получении гороскопа:', error.message);
        return 'Не удалось получить гороскоп. Попробуйте позже.';
    }
};
const wishes = [
    "Ты станешь улыбаться чаще и искреннее.",
    "Все твои планы будут уверенно двигаться к реализации.",
    "Ты найдешь подход даже к самым сложным задачам.",
    "Любимые люди всегда будут готовы тебя поддержать.",
    "Твоя жизнь наполнится радостью и гармонией.",
    "Каждый день будет приносить новые возможности.",
    "Твои мечты начнут воплощаться в реальность.",
    "Ты будешь окружен(а) только искренними людьми.",
    "Всё, за что ты возьмешься, будет приносить успех.",
    "Твои усилия всегда будут достойно вознаграждены.",
    "Ты всегда будешь находить верные решения.",
    "Каждый твой день будет наполнен счастьем.",
    "Твои идеи вдохновят окружающих.",
    "У тебя появится энергия для новых свершений.",
    "Ты будешь гордиться своими достижениями.",
    "Твои близкие будут счастливы рядом с тобой.",
    "Любовь будет сопровождать тебя во всех начинаниях.",
    "Твои труды принесут достойные плоды.",
    "Твоя вера в себя будет только крепнуть.",
    "Все испытания сделают тебя сильнее.",
    "Ты найдешь время для своих хобби и увлечений.",
    "Твои финансы будут всегда в порядке.",
    "Ты будешь радоваться каждому моменту жизни.",
    "Удача будет идти рядом с тобой.",
    "Ты всегда будешь находить нужные слова.",
    "Твое здоровье станет крепче с каждым днем.",
    "Ты встретишь людей, которые изменят твою жизнь к лучшему.",
    "Все твои цели будут постепенно достигнуты.",
    "Твои идеи найдут поддержку и признание.",
    "Ты будешь чувствовать себя уверенно в любой ситуации.",
    "Твои старания будут оценены по достоинству.",
    "Ты будешь вдохновлять и мотивировать других.",
    "Тебя ждут удивительные открытия и впечатления.",
    "Каждое утро будет приносить вдохновение.",
    "Ты будешь всегда в нужное время в нужном месте.",
    "Твое окружение станет еще более поддерживающим.",
    "Ты найдешь силы для реализации самых смелых планов.",
    "Твоя жизнь будет наполнена светлыми моментами.",
    "Ты получишь то, о чем давно мечтал(а).",
    "Ты научишься ценить каждую мелочь в жизни.",
    "Твои возможности будут только расти.",
    "Ты встретишь людей, которые станут твоими друзьями на всю жизнь.",
    "Ты будешь гордиться своими успехами.",
    "Ты найдешь баланс между работой и отдыхом.",
    "Твоя интуиция станет твоим верным помощником.",
    "Твои старания будут замечены и оценены.",
    "Ты откроешь для себя что-то совершенно новое.",
    "Ты будешь наслаждаться каждым днем своей жизни.",
    "Ты станешь более уверенным(ой) в своих силах.",
    "Твоя жизнь станет ярче и насыщеннее.",
    "Ты будешь находить радость даже в мелочах.",
    "Ты будешь гордиться собой за свои достижения.",
    "Ты будешь окружен(а) теплотой и заботой.",
    "Твои мечты будут всегда вести тебя вперед.",
    "Ты найдешь способ сделать свою жизнь еще лучше.",
    "Твое терпение будет вознаграждено.",
    "Ты будешь чувствовать себя счастливым и довольным.",
    "Ты получишь признание за свои труды.",
    "Твоя жизнь наполнится прекрасными моментами.",
    "Ты будешь успешен(успешна) во всех начинаниях.",
    "Твоя жизнь станет более насыщенной и интересной.",
    "Ты найдешь решение для любой проблемы.",
    "Ты откроешь в себе новые таланты.",
    "Ты будешь вдохновляться тем, что делаешь.",
    "Ты станешь примером для других.",
    "Ты будешь находить радость в простых вещах.",
    "Твои близкие будут счастливы рядом с тобой.",
    "Ты научишься наслаждаться каждым днем.",
    "Ты будешь уверен(а), что делаешь все правильно.",
    "Твоя жизнь будет полна удивительных событий.",
    "Ты всегда будешь двигаться только вперед.",
    "Ты найдешь время для того, что тебе действительно важно.",
    "Ты будешь получать радость от каждого мгновения.",
    "Ты будешь окружен(а) вдохновляющими людьми.",
    "Ты сможешь преодолеть любые препятствия.",
    "Ты всегда будешь находить правильное решение.",
    "Ты научишься видеть возможности даже в сложных ситуациях.",
    "Твои мечты будут только увеличивать твою уверенность.",
    "Ты получишь то, чего так долго ждал(а).",
    "Твоя жизнь станет еще более яркой и интересной.",
    "Ты всегда будешь находить поддержку у своих близких.",
    "Твои усилия будут приносить плоды.",
    "Ты почувствуешь, что ты на верном пути.",
    "Ты будешь наслаждаться каждым мгновением жизни.",
    "Твои цели станут еще ближе к осуществлению.",
    "Ты будешь радоваться своим успехам.",
    "Ты всегда будешь находить позитив даже в трудных ситуациях.",
    "Ты будешь вдохновлять окружающих своим примером.",
    "Твои достижения будут только расти.",
    "Твои труды принесут тебе заслуженное признание.",
    "Твоя жизнь будет наполнена только радостью и светом.",
    "Ты будешь находить радость даже в обыденных делах."
];
const rules = [
    "Не бойся начинать сначала, если чувствуешь, что это необходимо.",
    "Ставь перед собой реальные и достижимые цели.",
    "Всегда учись на своих ошибках.",
    "Дорожи временем, оно невосполнимо.",
    "Будь благодарен за каждое достижение, каким бы маленьким оно ни было.",
    "Слушай других, но принимай решения самостоятельно.",
    "Каждый день находи время для себя.",
    "Уважай чужие границы и свои тоже.",
    "Не откладывай дела на потом.",
    "Работай над своей дисциплиной ежедневно.",
    "Не сравнивай себя с другими, только с собой вчерашним.",
    "Не бойся спрашивать, если что-то непонятно.",
    "Делай то, что приносит радость и удовлетворение.",
    "Оценивай свои поступки с точки зрения их последствий.",
    "Сохраняй позитивный настрой в сложных ситуациях.",
    "Ставь перед собой цели, которые тебя вдохновляют.",
    "Заботься о своем здоровье — физическом и ментальном.",
    "Будь честным с собой и другими.",
    "Не бойся менять свое мнение, если получил новые знания.",
    "Окружай себя людьми, которые тебя поддерживают.",
    "Избегай негативного влияния и токсичных людей.",
    "Всегда стремись к развитию и новым знаниям.",
    "Не зацикливайся на прошлом — живи настоящим.",
    "Извлекай уроки из каждой ситуации.",
    "Находи время для отдыха и восстановления.",
    "Не бойся выражать свои чувства.",
    "Планируй свой день, чтобы быть продуктивным.",
    "Доверяй своим инстинктам, но проверяй факты.",
    "Будь терпелив к себе и другим.",
    "Не забывай о своих хобби и увлечениях.",
    "Помогай другим, если можешь это сделать.",
    "Будь верен своим принципам.",
    "Учись находить радость в мелочах.",
    "Пытайся видеть хорошее в каждом человеке.",
    "Развивай в себе благодарность.",
    "Не бойся мечтать и ставить амбициозные цели.",
    "Уважай чужое мнение, даже если не согласен.",
    "Инвестируй время в самообразование.",
    "Не забывай радоваться своим достижениям.",
    "Будь готов к переменам и используй их в свою пользу.",
    "Учись прощать и отпускать обиды.",
    "Не перегружай себя обязанностями — знай свои границы.",
    "Следи за тем, как используешь свое время.",
    "Не бойся признавать свои ошибки.",
    "Стремись к балансу между работой и личной жизнью.",
    "Не зацикливайся на неудачах — продолжай двигаться вперед.",
    "Не забывай благодарить людей за их помощь.",
    "Учись принимать себя таким, какой ты есть.",
    "Делись своими знаниями с другими.",
    "Будь настойчивым в достижении своих целей."
];


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
const getRandomWish = () => {
    return wishes[Math.floor(Math.random() * wishes.length)];
};
const getRandomRule = () => {
    return rules[Math.floor(Math.random() * rules.length)];
};
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
                    ['Послание 💌', 'Погода ⛅️', 'Rules 📜']
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
                    ['Послание 💌', 'Погода ⛅️', 'Rules 📜']
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
        if (text === 'Послание 💌') {
            const randomWish = getRandomWish();
            return bot.sendMessage(chatId, randomWish);
        }
        if (text === 'Rules 📜') {
            const randomRule = getRandomRule();
            return bot.sendMessage(chatId, randomRule);
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

