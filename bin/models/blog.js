const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const db = require('../../connection')

const blogSchema = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  title: {
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
  oneliner:{
    type: Sequelize.STRING(1024),
  }
  // relation_id:{
  //   type: Sequelize.STRING(256),
  // }
}

module.exports = db.define('blog', blogSchema, {
  freezeTableName: true,
})
