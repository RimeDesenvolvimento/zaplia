'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Partners', 'plano'),
      queryInterface.removeColumn('Partners', 'campanha')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Partners', 'plano', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Partners', 'campanha', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ]);
  }
};
