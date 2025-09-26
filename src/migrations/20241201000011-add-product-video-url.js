'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add video_url
    await queryInterface.addColumn('products', 'video_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
      field: 'video_url',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'video_url');
  }
};


