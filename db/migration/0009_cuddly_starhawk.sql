CREATE TABLE "onboarding_template_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"step_id" uuid NOT NULL,
	"question" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_onboarding_question_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_onboarding_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_onboarding_step_id" uuid NOT NULL,
	"question" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_template_questions" ADD CONSTRAINT "onboarding_template_questions_step_id_onboarding_template_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."onboarding_template_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_onboarding_question_responses" ADD CONSTRAINT "project_onboarding_question_responses_question_id_project_onboarding_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."project_onboarding_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_onboarding_questions" ADD CONSTRAINT "project_onboarding_questions_project_onboarding_step_id_project_onboarding_steps_id_fk" FOREIGN KEY ("project_onboarding_step_id") REFERENCES "public"."project_onboarding_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "template_question_position_unique" ON "onboarding_template_questions" USING btree ("step_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "question_response_unique" ON "project_onboarding_question_responses" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_step_position_unique" ON "project_onboarding_questions" USING btree ("project_onboarding_step_id","position");