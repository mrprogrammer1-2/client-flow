import { db } from "@/db";
import {
  clientPortalAccess,
  projectOnboardings,
  projectOnboardingStepResponses,
  projectOnboardingSteps,
} from "@/db/schema";
import { createHash, randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { uploadToCloudinary } from "./upload-to-cloudinary";

type SubmitClientResponseInput = {
  token: string;
  stepId: string;
  value?: string;
  file?: File;
};

export async function submitClientResponse({
  token,
  value,
  stepId,
  file,
}: SubmitClientResponseInput) {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [portalAccess] = await db
    .select()
    .from(clientPortalAccess)
    .where(eq(clientPortalAccess.tokenHash, tokenHash))
    .limit(1);

  if (!portalAccess) {
    throw new Error("Invalid token");
  }

  if (portalAccess.revokedAt) {
    throw new Error("Token has been revoked");
  }

  if (portalAccess.expiresAt && portalAccess.expiresAt < new Date()) {
    throw new Error("Token has expired");
  }

  const [step] = await db
    .select({
      id: projectOnboardingSteps.id,
      status: projectOnboardingSteps.status,
      projectOnboardingId: projectOnboardingSteps.projectOnboardingId,
      type: projectOnboardingSteps.type,
    })
    .from(projectOnboardingSteps)
    .where(
      and(
        eq(projectOnboardingSteps.id, stepId),
        eq(
          projectOnboardingSteps.projectOnboardingId,
          portalAccess.projectOnboardingId,
        ),
      ),
    )
    .limit(1);

  if (!step) {
    throw new Error("Invalid step");
  }

  if (step.status === "completed") {
    throw new Error("Step has already been completed");
  }

  let cleanValue: string | undefined;

  if (value) {
    cleanValue = value.trim();
  }

  if (step.type === "file") {
    if (!file) {
      throw new Error("File is required.");
    }
  } else {
    if (!cleanValue) {
      throw new Error("Response is required.");
    }
  }

  let uploadedFile: { url: string; publicId: string } | undefined;

  if (step.type === "file" && file) {
    uploadedFile = await uploadToCloudinary(file);
  }

  return await db.transaction(async (tx) => {
    const [currentStep] = await tx
      .select({
        id: projectOnboardingSteps.id,
        status: projectOnboardingSteps.status,
      })
      .from(projectOnboardingSteps)
      .where(eq(projectOnboardingSteps.id, step.id))
      .limit(1);

    if (!currentStep) {
      throw new Error("Step not found.");
    }

    if (currentStep.status === "completed") {
      throw new Error("Step has already been completed.");
    }

    await tx.insert(projectOnboardingStepResponses).values({
      id: randomUUID(),
      projectOnboardingStepId: step.id,
      value: cleanValue,
      fileUrl: uploadedFile?.url ?? null,
      fileName: file?.name ?? null,
    });

    await tx
      .update(projectOnboardingSteps)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projectOnboardingSteps.id, step.id));

    const allSteps = await tx
      .select({
        status: projectOnboardingSteps.status,
      })
      .from(projectOnboardingSteps)
      .where(
        eq(
          projectOnboardingSteps.projectOnboardingId,
          step.projectOnboardingId,
        ),
      );

    const allCompleted = allSteps.every((s) => s.status === "completed");

    const someCompleted = allSteps.some((s) => s.status === "completed");

    const onboardingStatus = allCompleted
      ? "completed"
      : someCompleted
        ? "in_progress"
        : "not_started";

    // 9. Update onboarding status
    await tx
      .update(projectOnboardings)
      .set({
        status: onboardingStatus,
        updatedAt: new Date(),
      })
      .where(eq(projectOnboardings.id, step.projectOnboardingId));
  });
}
