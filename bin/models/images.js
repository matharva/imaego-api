const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const db = require('../../connection')
const imagesSchema = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: Sequelize.STRING(512),
    defaultValue: 'IMAGE',
  },
  sequence: {
    type: Sequelize.INTEGER(),
  },
  key: {
    type: Sequelize.STRING(512),
    get() {
      return `${process.env.AWS_CDN_DOMAIN}`+this.getDataValue("key");
      
    }
  },
  // relation_id:{
  //   type: Sequelize.STRING(256),
  // }
}

module.exports = db.define('images', imagesSchema, {
  freezeTableName: true,
})
