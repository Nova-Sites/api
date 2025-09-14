'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_tech_stacks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tech_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tech_stacks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add indexes for better performance
    await queryInterface.addIndex('product_tech_stacks', ['product_id']);
    await queryInterface.addIndex('product_tech_stacks', ['tech_id']);
    
    // Add unique constraint to prevent duplicate relationships
    await queryInterface.addIndex('product_tech_stacks', ['product_id', 'tech_id'], {
      unique: true,
      name: 'unique_product_tech'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_tech_stacks');
  }
};
