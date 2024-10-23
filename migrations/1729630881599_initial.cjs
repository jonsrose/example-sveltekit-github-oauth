/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('app_user', {
    id: 'id',
    github_id: { type: 'integer', notNull: true },
    email: { type: 'varchar(255)', notNull: true },
    username: { type: 'varchar(255)', notNull: true }
  });

  pgm.createTable('session', {
    id: { type: 'varchar(255)', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"app_user"',
      onDelete: 'CASCADE'
    },
    expires_at: { type: 'timestamp', notNull: true }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('session');
  pgm.dropTable('app_user');
};
