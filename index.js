const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require ('./options')
const token = '8141777064:AAEDCEeg4j-fX_nkk5osPZ59Ptm9HeP0qNQ'

const bot = new TelegramApi(token, { polling: true })


const chats = {}


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен угадать')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}
const start = () => {

    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию о пользователе' },
        { command: '/game', description: 'Угадай цифру' },
    ])

    bot.on('message', async msg => {
        console.log(msg)
        const text = msg.text;
        const chatId = msg.chat.id;
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
        return bot.sendMessage(chatId, 'Я не понимаю попробуй еще раз!')
    })
    
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId =  msg.message.chat.id;
        if(data === '/again'){
            return startGame(chatId);
        }
        if(data === chats[chatId]){
            return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else{
            return bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
    })
}
start()

