const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const db = require('../../connection')
const tokenSchema = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  access: {
    type: Sequelize.STRING(512),
  },
  refresh: {
    type: Sequelize.STRING(512),
  },
}

module.exports = db.define('tokens', tokenSchema, {
  freezeTableName: true,
})
