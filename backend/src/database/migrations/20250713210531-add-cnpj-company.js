'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Companies', 'cpfCnpj', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ""
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Companies', 'cpfCnpj');
  }
};
