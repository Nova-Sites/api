'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add created_by
    await queryInterface.addColumn('products', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add updated_by
    await queryInterface.addColumn('products', 'updated_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Indexes
    await queryInterface.addIndex('products', ['created_by'], {
      name: 'products_created_by_index',
    });
    await queryInterface.addIndex('products', ['updated_by'], {
      name: 'products_updated_by_index',
    });

    // Explicit constraints (for clarity in some dialects)
    await queryInterface.addConstraint('products', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'products_created_by_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('products', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'products_updated_by_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('products', 'products_updated_by_fkey');
    await queryInterface.removeConstraint('products', 'products_created_by_fkey');
    await queryInterface.removeIndex('products', 'products_updated_by_index');
    await queryInterface.removeIndex('products', 'products_created_by_index');
    await queryInterface.removeColumn('products', 'updated_by');
    await queryInterface.removeColumn('products', 'created_by');
  }
};


