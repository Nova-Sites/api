'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add created_by
    await queryInterface.addColumn('users', 'created_by', {
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
    await queryInterface.addColumn('users', 'updated_by', {
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
    await queryInterface.addIndex('users', ['created_by'], {
      name: 'users_created_by_index',
    });
    await queryInterface.addIndex('users', ['updated_by'], {
      name: 'users_updated_by_index',
    });

    // Explicit constraints (for clarity in some dialects)
    await queryInterface.addConstraint('users', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'users_created_by_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('users', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'users_updated_by_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'users_updated_by_fkey');
    await queryInterface.removeConstraint('users', 'users_created_by_fkey');
    await queryInterface.removeIndex('users', 'users_updated_by_index');
    await queryInterface.removeIndex('users', 'users_created_by_index');
    await queryInterface.removeColumn('users', 'updated_by');
    await queryInterface.removeColumn('users', 'created_by');
  }
};


