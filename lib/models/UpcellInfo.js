'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('./Base');

class UpcellInfo extends Model {}

UpcellInfo.init({

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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  memo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  current_product: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  upcell_product: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  createdAt: false,
  updatedAt: false,
  sequelize, // We need to pass the connection instance
  modelName: 'upcell_info' // We need to choose the model name
});


module.exports = UpcellInfo;