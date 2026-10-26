CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "exhibition_card_overrides" (
	"cardId" integer PRIMARY KEY NOT NULL,
	"nameZh" text,
	"nameEn" text,
	"keywordsZh" text,
	"keywordsEn" text,
	"descriptionZh" text,
	"descriptionEn" text,
	"artist" varchar(160),
	"imageUrl" varchar(1024),
	"driveUrl" varchar(2048),
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exhibition_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"titleZh" varchar(200) NOT NULL,
	"titleEn" varchar(200) NOT NULL,
	"statementZh" text NOT NULL,
	"statementEn" text NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guestbook_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL,
	"message" varchar(600) NOT NULL,
	"photoUrl" varchar(1024),
	"hidden" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
