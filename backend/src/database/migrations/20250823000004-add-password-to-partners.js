"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Gerar hash da senha padrão
    const passwordHash = await bcrypt.hash("123456parceirozaplia", 8);
    
    await queryInterface.addColumn("Partners", "password", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: passwordHash
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Partners", "password");
  }
};
