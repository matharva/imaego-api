const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const db = require('../../connection')
const relationScehma = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  type:{
    type:Sequelize.STRING(255)
  }
}

module.exports = db.define('relation', relationScehma, {
  freezeTableName: true,
})
