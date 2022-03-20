'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('./Base');

class UpcellLog extends Model {}

UpcellLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  upcell_info_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'UpcellInfo',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  log: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
},{
  createdAt: false,
  updatedAt: false,
  sequelize, // We need to pass the connection instance
  modelName: 'upcell_log' // We need to choose the model name
});


module.exports = UpcellLog;