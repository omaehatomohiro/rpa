'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('./Base');

class User extends Model {}

User.init({
  // Model attributes are defined here
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'user' // We need to choose the model name
});


module.exports = User;