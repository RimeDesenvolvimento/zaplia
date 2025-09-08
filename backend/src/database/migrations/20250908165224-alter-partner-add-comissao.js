module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Partners", "porcentagemComissao", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 40
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Partners", "porcentagemComissao");
  }
};
