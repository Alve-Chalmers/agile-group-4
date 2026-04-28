CREATE TABLE "category" (
	"name" text PRIMARY KEY NOT NULL,
	"default_shelf_life_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "home" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"home_id" integer NOT NULL,
	"name" text NOT NULL,
	"category_name" text,
	"expires_at" timestamp NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_home" (
	"user_id" text NOT NULL,
	"home_id" integer NOT NULL,
	CONSTRAINT "user_home_home_id_user_id_pk" PRIMARY KEY("home_id","user_id"),
	CONSTRAINT "user_home_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_home_id_home_id_fk" FOREIGN KEY ("home_id") REFERENCES "public"."home"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_name_category_name_fk" FOREIGN KEY ("category_name") REFERENCES "public"."category"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_home" ADD CONSTRAINT "user_home_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_home" ADD CONSTRAINT "user_home_home_id_home_id_fk" FOREIGN KEY ("home_id") REFERENCES "public"."home"("id") ON DELETE no action ON UPDATE no action;