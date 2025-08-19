'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add created_by
    await queryInterface.addColumn('categories', 'created_by', {
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
    await queryInterface.addColumn('categories', 'updated_by', {
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
    await queryInterface.addIndex('categories', ['created_by'], {
      name: 'categories_created_by_index',
    });
    await queryInterface.addIndex('categories', ['updated_by'], {
      name: 'categories_updated_by_index',
    });

    // Explicit constraints (for clarity in some dialects)
    await queryInterface.addConstraint('categories', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'categories_created_by_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('categories', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'categories_updated_by_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('categories', 'categories_updated_by_fkey');
    await queryInterface.removeConstraint('categories', 'categories_created_by_fkey');
    await queryInterface.removeIndex('categories', 'categories_updated_by_index');
    await queryInterface.removeIndex('categories', 'categories_created_by_index');
    await queryInterface.removeColumn('categories', 'updated_by');
    await queryInterface.removeColumn('categories', 'created_by');
  }
};


