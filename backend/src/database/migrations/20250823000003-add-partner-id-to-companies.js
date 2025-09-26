'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Companies', 'partnerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Partners',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Companies', 'partnerId');
  }
};

