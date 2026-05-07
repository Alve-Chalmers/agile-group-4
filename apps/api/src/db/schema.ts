import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const category = pgTable('category', {
  name: text('name').primaryKey(),
  /** Can be `null` */
  defaultShelfLifeSeconds: integer('default_shelf_life_seconds'),
});

export const home = pgTable('home', {
  id: serial().primaryKey(),
});

export const userHome = pgTable(
  'user_home',
  {
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id),
    homeId: integer('home_id')
      .notNull()
      .references(() => home.id),
  },
  (t) => [primaryKey({ columns: [t.homeId, t.userId] })],
);

export const product = pgTable('product', {
  id: serial().primaryKey(),
  homeId: integer('home_id')
    .references(() => home.id)
    .notNull(),
  name: text('name').notNull(),
  category: text('category_name').references(() => category.name),
  expiresAt: timestamp('expires_at').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productRelations = relations(product, ({ one }) => ({
  home: one(home, {
    fields: [product.homeId],
    references: [home.id],
  }),
  category: one(category, {
    fields: [product.category],
    references: [category.name],
  }),
}));

export const userHomeRelations = relations(userHome, ({ one }) => ({
  user: one(user, {
    fields: [userHome.userId],
    references: [user.id],
  }),
  home: one(home, {
    fields: [userHome.homeId],
    references: [home.id],
  }),
}));

export const homeRelations = relations(home, ({ many }) => ({
  userHomes: many(userHome),
  products: many(product),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  /** 0..1 row per user (`user_home.user_id` is unique). Use nested `with: { home: true }` to load the home. */
  userHome: one(userHome),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
