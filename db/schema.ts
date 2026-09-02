import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const agencies = pgTable("agencies", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  // This is the user.id returned by Kinde — do not generate it ourselves.
  kindeUserId: text("kinde_user_id").notNull().unique(),

  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "cascade" }),

  email: text("email").notNull(),

  // Later, this controls dashboard permissions.
  role: text("role").notNull().default("owner"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),

  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  phone: text("phone"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "completed",
  "archived",
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  description: text("description"),

  status: projectStatusEnum("status").notNull().default("active"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const onboardingTemplates = pgTable("onboarding_templates", {
  id: uuid("id").defaultRandom().primaryKey(),

  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  description: text("description"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const onboardingStepTypeEnum = pgEnum("onboarding_step_type", [
  "text",
  "textarea",
  "file",
  "url",
]);

export const onboardingTemplateSteps = pgTable(
  "onboarding_template_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    templateId: uuid("template_id")
      .notNull()
      .references(() => onboardingTemplates.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),

    type: onboardingStepTypeEnum("type").notNull().default("text"),

    position: integer("position").notNull(),

    required: boolean("required").notNull().default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("template_step_position_unique").on(
      table.templateId,
      table.position,
    ),
  ],
);

export const projectOnboardingStatusEnum = pgEnum("project_onboarding_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const projectOnboardings = pgTable("project_onboardings", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),

  templateId: uuid("template_id")
    .notNull()
    .references(() => onboardingTemplates.id),

  status: projectOnboardingStatusEnum("status")
    .notNull()
    .default("not_started"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectOnboardingStepStatusEnum = pgEnum(
  "project_onboarding_step_status",
  ["pending", "completed"],
);

export const projectOnboardingSteps = pgTable(
  "project_onboarding_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    projectOnboardingId: uuid("project_onboarding_id")
      .notNull()
      .references(() => projectOnboardings.id, {
        onDelete: "cascade",
      }),

    // Keeps a link to the original step, but does not delete this
    // project-specific copy if the template step is removed.
    templateStepId: uuid("template_step_id").references(
      () => onboardingTemplateSteps.id,
      { onDelete: "set null" },
    ),

    title: text("title").notNull(),
    description: text("description"),

    type: onboardingStepTypeEnum("type").notNull(),

    position: integer("position").notNull(),
    required: boolean("required").notNull().default(true),

    status: projectOnboardingStepStatusEnum("status")
      .notNull()
      .default("pending"),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("project_onboarding_step_position_unique").on(
      table.projectOnboardingId,
      table.position,
    ),
  ],
);

export const projectOnboardingStepResponses = pgTable(
  "project_onboarding_step_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    projectOnboardingStepId: uuid("project_onboarding_step_id")
      .notNull()
      .unique()
      .references(() => projectOnboardingSteps.id, {
        onDelete: "cascade",
      }),

    // Used for text, textarea, and URL step types.
    value: text("value"),

    // Used for file step types.
    fileUrl: text("file_url"),
    fileName: text("file_name"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const clientPortalAccess = pgTable("client_portal_access", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectOnboardingId: uuid("project_onboarding_id")
    .notNull()
    .unique()
    .references(() => projectOnboardings.id, {
      onDelete: "cascade",
    }),

  // Store only a hash of the secret token, never the raw token itself.
  tokenHash: text("token_hash").notNull().unique(),

  // Null means the link does not expire.
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
  }),

  // Non-null means the agency has disabled the link.
  revokedAt: timestamp("revoked_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const agenciesRelations = relations(agencies, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  onboardingTemplates: many(onboardingTemplates),
}));

export const usersRelations = relations(users, ({ one }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [clients.agencyId],
    references: [agencies.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  onboarding: one(projectOnboardings),
}));

export const onboardingTemplatesRelations = relations(
  onboardingTemplates,
  ({ one, many }) => ({
    agency: one(agencies, {
      fields: [onboardingTemplates.agencyId],
      references: [agencies.id],
    }),
    steps: many(onboardingTemplateSteps),
    projectOnboardings: many(projectOnboardings),
  }),
);

export const onboardingTemplateStepsRelations = relations(
  onboardingTemplateSteps,
  ({ one, many }) => ({
    template: one(onboardingTemplates, {
      fields: [onboardingTemplateSteps.templateId],
      references: [onboardingTemplates.id],
    }),
    projectOnboardingSteps: many(projectOnboardingSteps),
  }),
);

export const projectOnboardingsRelations = relations(
  projectOnboardings,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectOnboardings.projectId],
      references: [projects.id],
    }),
    template: one(onboardingTemplates, {
      fields: [projectOnboardings.templateId],
      references: [onboardingTemplates.id],
    }),
    steps: many(projectOnboardingSteps),
    portalAccess: one(clientPortalAccess),
  }),
);

export const projectOnboardingStepsRelations = relations(
  projectOnboardingSteps,
  ({ one }) => ({
    onboarding: one(projectOnboardings, {
      fields: [projectOnboardingSteps.projectOnboardingId],
      references: [projectOnboardings.id],
    }),
    templateStep: one(onboardingTemplateSteps, {
      fields: [projectOnboardingSteps.templateStepId],
      references: [onboardingTemplateSteps.id],
    }),
    response: one(projectOnboardingStepResponses),
  }),
);

export const projectOnboardingStepResponsesRelations = relations(
  projectOnboardingStepResponses,
  ({ one }) => ({
    projectOnboardingStep: one(projectOnboardingSteps, {
      fields: [projectOnboardingStepResponses.projectOnboardingStepId],
      references: [projectOnboardingSteps.id],
    }),
  }),
);

export const clientPortalAccessRelations = relations(
  clientPortalAccess,
  ({ one }) => ({
    projectOnboarding: one(projectOnboardings, {
      fields: [clientPortalAccess.projectOnboardingId],
      references: [projectOnboardings.id],
    }),
  }),
);
