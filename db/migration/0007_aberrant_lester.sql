CREATE TYPE "public"."project_onboarding_step_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TABLE "project_onboarding_step_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_onboarding_step_id" uuid NOT NULL,
	"value" text,
	"file_url" text,
	"file_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_onboarding_step_responses_project_onboarding_step_id_unique" UNIQUE("project_onboarding_step_id")
);
--> statement-breakpoint
CREATE TABLE "project_onboarding_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_onboarding_id" uuid NOT NULL,
	"template_step_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"type" "onboarding_step_type" NOT NULL,
	"position" integer NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"status" "project_onboarding_step_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_onboarding_step_responses" ADD CONSTRAINT "project_onboarding_step_responses_project_onboarding_step_id_project_onboarding_steps_id_fk" FOREIGN KEY ("project_onboarding_step_id") REFERENCES "public"."project_onboarding_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_onboarding_steps" ADD CONSTRAINT "project_onboarding_steps_project_onboarding_id_project_onboardings_id_fk" FOREIGN KEY ("project_onboarding_id") REFERENCES "public"."project_onboardings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_onboarding_steps" ADD CONSTRAINT "project_onboarding_steps_template_step_id_onboarding_template_steps_id_fk" FOREIGN KEY ("template_step_id") REFERENCES "public"."onboarding_template_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_onboarding_step_position_unique" ON "project_onboarding_steps" USING btree ("project_onboarding_id","position");