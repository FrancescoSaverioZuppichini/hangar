I want to build `hanger`, here in this folder. The project will solve the following issue (focusing on webdev and nextjs for now). When I am coding a nextjs app and I want to use coding assistant to do multiple tasks I cannot lunch all of them at the same file since they will collide with the file system and they cannot create multiple branches on my git at the same time. What I am thinking is to spawn an e2b sandbox with vscode server, opencode, a web terminal I made and the web app running (see sandboxes/e2b/nextjs/build.py). I've validated that it works. 

I need to orchestrate them, the solution will allow to have sandboxes with your app on it and a engineer interface (vscode) so you can edit code if you want, not vibecoding without control. Now, we need to create two things to orchestrate a cli and a dashboard. 

We need first to decide how to organize the project, I'd like this to be a monorepo. e2b has also sdks in ts so we can have everything under the same language (https://e2b.dev/docs/template/quickstart.md).

I was thinking of a monorepo, but not sure to setup. The dashboard will be in nextjs, the database will be sqlite. Both dashboard and cli will read from the same db so it makes sense to have a common package with code to read/write the db.

This is for devs, the cli must be smart and be smooth for instance when you call if `hangar init` the first time it will guide to create a config system, e..g your github pat. WHen you are in your project and you call `hangar start` or whatever, we need to think about nice names, it will detect if you are on a git repo, and auto build the sandbox with that repo and ask you about it, which branch it the default to clone etc (default like main). So when you spawn the sandbox it will be immediate (no cloning at runtime). It should also create an auto branch (we can have in the main config) and with flag as well, e.g. --auto-branch yes/no. It should detect it you have an *.env.* and ask you about it and store the vars in sqlite so we can auto inject in the sandbox. Stuff like that. So we need to understand
- how to setup the code (maybe https://turborepo.dev/docs?)
- all the commands for the cli

In the dashboard you can see your repos in the left, like a filesystem with the branches with active sandboxes, you can always see whatever is going on

We can also setup notifications, like hangar config --notification_channel "telegram|slack|discors" we can like tag @hangar on a gh issue with a command and can spawn a sandbox to do that issue ad auto pr it

This is something that doesn't exists, market focus on vibecoding solution but not ochestrator stuff for devs