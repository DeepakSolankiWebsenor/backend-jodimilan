'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'religion_name', {
      type: Sequelize.STRING(191),
      allowNull: true,
      after: 'religion'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'religion_name');
  }
};
