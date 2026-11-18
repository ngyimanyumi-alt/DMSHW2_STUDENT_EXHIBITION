CREATE TABLE "gallery_media" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mimeType" varchar(32) NOT NULL,
	"data" "bytea" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
