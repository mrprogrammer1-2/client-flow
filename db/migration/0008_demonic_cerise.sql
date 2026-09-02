CREATE TABLE "client_portal_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_onboarding_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_portal_access_project_onboarding_id_unique" UNIQUE("project_onboarding_id"),
	CONSTRAINT "client_portal_access_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_project_onboarding_id_project_onboardings_id_fk" FOREIGN KEY ("project_onboarding_id") REFERENCES "public"."project_onboardings"("id") ON DELETE cascade ON UPDATE no action;