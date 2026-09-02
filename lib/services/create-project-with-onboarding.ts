import { createHash, randomBytes, randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { db, sql } from "@/db";
import {
  clients,
  onboardingTemplateSteps,
  onboardingTemplates,
} from "@/db/schema";

type CreateProjectWithOnboardingInput = {
  agencyId: string;
  clientId: string;
  templateId: string;
  name: string;
  description?: string;
};

export async function createProjectWithOnboarding(
  input: CreateProjectWithOnboardingInput,
) {
  // 1. Confirm that the client belongs to the signed-in user's agency.
  const [client] = await db
    .select({
      id: clients.id,
      agencyId: clients.agencyId,
    })
    .from(clients)
    .where(eq(clients.id, input.clientId))
    .limit(1);

  if (!client || client.agencyId !== input.agencyId) {
    throw new Error("Client was not found for this agency.");
  }

  // 2. Confirm that the template belongs to the same agency.
  const [template] = await db
    .select({
      id: onboardingTemplates.id,
      agencyId: onboardingTemplates.agencyId,
    })
    .from(onboardingTemplates)
    .where(eq(onboardingTemplates.id, input.templateId))
    .limit(1);

  if (!template || template.agencyId !== input.agencyId) {
    throw new Error("Template was not found for this agency.");
  }

  // 3. Do not create an onboarding from an empty template.
  const [firstTemplateStep] = await db
    .select({ id: onboardingTemplateSteps.id })
    .from(onboardingTemplateSteps)
    .where(eq(onboardingTemplateSteps.templateId, input.templateId))
    .limit(1);

  if (!firstTemplateStep) {
    throw new Error("This template has no steps.");
  }

  // IDs are created before the transaction so all inserts can reference them.
  const projectId = randomUUID();
  const onboardingId = randomUUID();

  // This raw token goes only in the portal URL.
  const portalToken = randomBytes(32).toString("base64url");

  // Neon stores only this hash, never the usable raw token.
  const tokenHash = createHash("sha256").update(portalToken).digest("hex");

  const description = input.description?.trim() || null;

  // 4. All database writes succeed together or fail together.
  await sql.transaction([
    sql`
      INSERT INTO projects (id, client_id, name, description)
      VALUES (
        ${projectId},
        ${input.clientId},
        ${input.name},
        ${description}
      )
    `,

    sql`
      INSERT INTO project_onboardings (id, project_id, template_id)
      VALUES (
        ${onboardingId},
        ${projectId},
        ${input.templateId}
      )
    `,

    // Copy template steps into this project's own onboarding steps.
    sql`
      INSERT INTO project_onboarding_steps (
        id,
        project_onboarding_id,
        template_step_id,
        title,
        description,
        type,
        position,
        required
      )
      SELECT
        gen_random_uuid(),
        ${onboardingId},
        id,
        title,
        description,
        type,
        position,
        required
      FROM onboarding_template_steps
      WHERE template_id = ${input.templateId}
      ORDER BY position
    `,

    sql`
      INSERT INTO client_portal_access (
        id,
        project_onboarding_id,
        token_hash
      )
      VALUES (
        ${randomUUID()},
        ${onboardingId},
        ${tokenHash}
      )
    `,
  ]);

  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is missing.");
  }

  return {
    projectId,
    onboardingId,

    // Show/send this once. Never save it to the database.
    portalUrl: `${appUrl}/client-portal/${portalToken}`,
  };
}
