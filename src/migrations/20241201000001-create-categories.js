'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      image: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: true,
          isUrl: true
        }
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('categories', ['slug'], {
      unique: true,
      name: 'categories_slug_unique'
    });

    await queryInterface.addIndex('categories', ['is_active'], {
      name: 'categories_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  }
}; 