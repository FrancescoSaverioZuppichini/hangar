CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`localPath` text NOT NULL,
	`repoUrl` text,
	`branch` text,
	`templateAlias` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_localPath_unique` ON `projects` (`localPath`);--> statement-breakpoint
CREATE TABLE `sandboxes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sandboxId` text NOT NULL,
	`projectId` integer,
	`templateId` text NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`vsCodeUrl` text NOT NULL,
	`appUrl` text NOT NULL,
	`terminalUrl` text NOT NULL,
	`openCodeUrl` text NOT NULL,
	`startedAt` integer NOT NULL,
	`stoppedAt` integer,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sandboxes_sandboxId_unique` ON `sandboxes` (`sandboxId`);