const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const db = require('../../connection')

const talentSchema = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  oneliner: {
    type: Sequelize.STRING(1024),
  },
  content: {
    type: Sequelize.TEXT('long'),
  },
  author: {
    type: Sequelize.STRING(1024),
  },
  active: {
    type: Sequelize.BOOLEAN(),
    defaultValue: true,
  },
  sequence: {
    type: Sequelize.INTEGER(5),
  },
  // relation_id:{
  //   type: Sequelize.STRING(256),
  // }
}

module.exports = db.define('talent', talentSchema, {
  freezeTableName: true,
})
