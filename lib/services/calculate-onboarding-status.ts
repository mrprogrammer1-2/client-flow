type OnboardingStep = {
  status: "pending" | "completed";
  required: boolean;
};

export default function calculateOnboardingStatus(steps: OnboardingStep[]) {
  const requiredSteps = steps.filter((step) => step.required);

  const allRequiredCompleted =
    requiredSteps.length > 0 &&
    requiredSteps.every((step) => step.status === "completed");

  const someRequiredCompleted = requiredSteps.some(
    (step) => step.status === "completed",
  );

  let onboardingStatus: "not_started" | "in_progress" | "completed";

  if (allRequiredCompleted) {
    onboardingStatus = "completed";
  } else if (someRequiredCompleted) {
    onboardingStatus = "in_progress";
  } else {
    onboardingStatus = "not_started";
  }

  return onboardingStatus;
}
