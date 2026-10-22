CREATE TABLE `exhibition_card_overrides` (
	`cardId` int NOT NULL,
	`nameZh` text,
	`nameEn` text,
	`keywordsZh` text,
	`keywordsEn` text,
	`descriptionZh` text,
	`descriptionEn` text,
	`artist` varchar(160),
	`imageUrl` varchar(1024),
	`driveUrl` varchar(2048),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exhibition_card_overrides_cardId` PRIMARY KEY(`cardId`)
);
--> statement-breakpoint
CREATE TABLE `exhibition_settings` (
	`id` int NOT NULL,
	`titleZh` varchar(200) NOT NULL,
	`titleEn` varchar(200) NOT NULL,
	`statementZh` text NOT NULL,
	`statementEn` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exhibition_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guestbook_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(60) NOT NULL,
	`message` varchar(600) NOT NULL,
	`photoUrl` varchar(1024),
	`hidden` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guestbook_entries_id` PRIMARY KEY(`id`)
);
