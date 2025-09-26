'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Partners', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cpfCpnj: {
        type: Sequelize.STRING,
        allowNull: true
      },
      urlParceiro: {
        type: Sequelize.STRING,
        allowNull: true
      },
      plano: {
        type: Sequelize.STRING,
        allowNull: true
      },
      campanha: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Sim'
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      criadoEm: {
        type: Sequelize.DATE,
        allowNull: true
      },
      vencimento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('Partners');
  }
};
