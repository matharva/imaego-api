const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const db = require('../../connection')
const socialSchema = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: Sequelize.STRING(256),
    defaultValue: 'INSTAGRAM',
  },
  value: {
    type: Sequelize.STRING(1024),
  },
  handle:{
    type: Sequelize.STRING(1024),
  }
}

module.exports = db.define('social', socialSchema, {
  freezeTableName: true,
})
