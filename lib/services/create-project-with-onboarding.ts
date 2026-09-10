import { createHash, randomBytes, randomUUID } from "crypto";
import { eq, asc } from "drizzle-orm";

import { db } from "@/db";
import {
  clientPortalAccess,
  clients,
  onboardingTemplateSteps,
  onboardingTemplates,
  projectOnboardingSteps,
  projectOnboardings,
  projects,
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

  // IDs are created before the transaction so all inserts can reference them.
  const projectId = randomUUID();
  const onboardingId = randomUUID();

  // This raw token goes only in the portal URL.
  const portalToken = randomBytes(32).toString("base64url");

  // Neon stores only this hash, never the usable raw token.
  const tokenHash = createHash("sha256").update(portalToken).digest("hex");

  const description = input.description?.trim() || null;

  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is missing.");
  }

  // 4. All database writes succeed together or fail together.
  await db.transaction(async (tx) => {
    await tx.insert(projects).values({
      id: projectId,
      clientId: input.clientId,
      name: input.name,
      description: description,
    });

    await tx.insert(projectOnboardings).values({
      id: onboardingId,
      projectId,
      templateId: input.templateId,
    });

    const templateSteps = await tx
      .select({
        id: onboardingTemplateSteps.id,
        title: onboardingTemplateSteps.title,
        description: onboardingTemplateSteps.description,
        type: onboardingTemplateSteps.type,
        position: onboardingTemplateSteps.position,
        required: onboardingTemplateSteps.required,
      })
      .from(onboardingTemplateSteps)
      .where(eq(onboardingTemplateSteps.templateId, input.templateId))
      .orderBy(asc(onboardingTemplateSteps.position));

    if (templateSteps.length === 0) {
      throw new Error("This template has no steps.");
    }

    await tx.insert(projectOnboardingSteps).values(
      templateSteps.map((step) => ({
        templateStepId: step.id,
        projectOnboardingId: onboardingId,
        title: step.title,
        description: step.description,
        type: step.type,
        position: step.position,
        required: step.required,
      })),
    );

    await tx.insert(clientPortalAccess).values({
      id: randomUUID(),
      projectOnboardingId: onboardingId,
      tokenHash,
    });
  });

  return {
    projectId,
    onboardingId,

    // Show/send this once. Never save it to the database.
    portalUrl: `${appUrl}/client-portal/${portalToken}`,
  };
}
