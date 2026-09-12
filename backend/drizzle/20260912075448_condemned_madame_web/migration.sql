CREATE TABLE "genders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "genders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL UNIQUE
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "genderId" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "rolesId" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_genderId_genders_id_fkey" FOREIGN KEY ("genderId") REFERENCES "genders"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_rolesId_roles_id_fkey" FOREIGN KEY ("rolesId") REFERENCES "roles"("id");