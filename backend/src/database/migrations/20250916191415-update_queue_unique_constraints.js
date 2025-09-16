"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .removeConstraint("Queues", "Queues_name_key")
      .catch(() => {});
    await queryInterface
      .removeConstraint("Queues", "Queues_color_key")
      .catch(() => {});

    await queryInterface.addIndex("Queues", ["name", "companyId"], {
      name: "queue_name_company_unique",
      unique: true
    });

    await queryInterface.addIndex("Queues", ["color", "companyId"], {
      name: "queue_color_company_unique",
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Queues", "queue_name_company_unique");
    await queryInterface.removeIndex("Queues", "queue_color_company_unique");

    await queryInterface.addConstraint("Queues", {
      fields: ["name"],
      type: "unique",
      name: "Queues_name_key"
    });

    await queryInterface.addConstraint("Queues", {
      fields: ["color"],
      type: "unique",
      name: "Queues_color_key"
    });
  }
};
