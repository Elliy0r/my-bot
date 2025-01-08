const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'my_bot_database',
    'my_bot_user',
    '21235456',
    {
        host:'45.92.173.66',
        port:'22',
        dialect: 'postgres'
    }
)