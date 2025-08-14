'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the ENUM to include new roles
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_USER', 'ROLE_GUEST') 
      NOT NULL DEFAULT 'ROLE_USER'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('ROLE_ADMIN', 'ROLE_USER', 'ROLE_STAFF') 
      NOT NULL DEFAULT 'ROLE_USER'
    `);
  }
};
