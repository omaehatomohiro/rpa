'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('./Base');

class Precs extends Model {}

Precs.init({
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  basic_user: {
    type: DataTypes.STRING,
    allowNull: false
  },
  basic_pass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precs_user: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precs_pass: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  createdAt: false,
  updatedAt: false,
  sequelize, // We need to pass the connection instance
  modelName: 'precs' // We need to choose the model name
});


module.exports = Precs;