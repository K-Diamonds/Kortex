-- Kortex initial schema (drizzle migration 0000)
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION kortex_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"email" text,
	"name" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"external_id" text,
	"title" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_user_external_id_unique" UNIQUE("user_id","external_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"source" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"content" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"session_id" text,
	"content" text NOT NULL,
	"metadata" jsonb,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"tool_name" text NOT NULL,
	"input" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"output" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"agent_id" text NOT NULL,
	"agent_name" text NOT NULL,
	"input" text NOT NULL,
	"output" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tool_runs" ADD CONSTRAINT "tool_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tool_runs" ADD CONSTRAINT "tool_runs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "users_external_id_idx" ON "users" USING btree ("external_id");
--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "messages_user_id_idx" ON "messages" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "messages_session_id_idx" ON "messages" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "memories_user_id_idx" ON "memories" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "memories_session_id_idx" ON "memories" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks" USING btree ("document_id");
--> statement-breakpoint
CREATE INDEX "document_chunks_chunk_index_idx" ON "document_chunks" USING btree ("document_id","chunk_index");
--> statement-breakpoint
CREATE INDEX "embeddings_user_id_idx" ON "embeddings" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "embeddings_session_id_idx" ON "embeddings" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "embeddings_embedding_idx" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);
--> statement-breakpoint
CREATE INDEX "tool_runs_user_id_idx" ON "tool_runs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "tool_runs_session_id_idx" ON "tool_runs" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "tool_runs_tool_name_idx" ON "tool_runs" USING btree ("tool_name");
--> statement-breakpoint
CREATE INDEX "agent_runs_user_id_idx" ON "agent_runs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "agent_runs_session_id_idx" ON "agent_runs" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "agent_runs_agent_id_idx" ON "agent_runs" USING btree ("agent_id");
--> statement-breakpoint
CREATE TRIGGER "users_set_updated_at" BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "sessions_set_updated_at" BEFORE UPDATE ON "sessions" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "messages_set_updated_at" BEFORE UPDATE ON "messages" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "memories_set_updated_at" BEFORE UPDATE ON "memories" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "documents_set_updated_at" BEFORE UPDATE ON "documents" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "document_chunks_set_updated_at" BEFORE UPDATE ON "document_chunks" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "embeddings_set_updated_at" BEFORE UPDATE ON "embeddings" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "tool_runs_set_updated_at" BEFORE UPDATE ON "tool_runs" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "agent_runs_set_updated_at" BEFORE UPDATE ON "agent_runs" FOR EACH ROW EXECUTE FUNCTION kortex_set_updated_at();
