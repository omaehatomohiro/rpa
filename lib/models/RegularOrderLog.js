'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('./Base');

class RegularOrderLog extends Model {}

RegularOrderLog.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  precs_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Precs',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  exec_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exec_result: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exec_date: {
    type:DataTypes.DATE
  },
  arrival_date: {
    type:DataTypes.DATE
  },
  log: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  createdAt: false,
  updatedAt: false,
  sequelize, // We need to pass the connection instance
  modelName: 'regular_order_log' // We need to choose the model name
});


module.exports = RegularOrderLog;