module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Partners", "walletId", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Partners", "walletId");
  }
};
