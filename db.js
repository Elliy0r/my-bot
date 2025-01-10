const {Sequelize} = require('sequelize')


module.exports = new Sequelize(
    'host5939_telega_bot',
    'host5939_root',
    '21235456elyor',
    {
        host:'5.182.26.16',
        port:'5432',
        dialect:'postgres'
    }
)