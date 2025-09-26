module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Invoices", "providerInvoiceId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Invoices", "providerInvoiceId");
  }
};
