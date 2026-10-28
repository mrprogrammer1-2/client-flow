CREATE TABLE "client_portal_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_portal_access_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_portal_verifications" ADD CONSTRAINT "client_portal_verifications_client_portal_access_id_client_portal_access_id_fk" FOREIGN KEY ("client_portal_access_id") REFERENCES "public"."client_portal_access"("id") ON DELETE cascade ON UPDATE no action;