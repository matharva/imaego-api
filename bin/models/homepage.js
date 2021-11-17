const moment = require('moment-timezone');
const Sequelize = require('sequelize');
const db = require('../../connection');
const homepageSchema = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
};

module.exports = db.define('homepage', homepageSchema, {
  freezeTableName: true,
});
