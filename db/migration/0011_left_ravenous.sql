CREATE TYPE "public"."client_status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "status" "client_status" DEFAULT 'active' NOT NULL;