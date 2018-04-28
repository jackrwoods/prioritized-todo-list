# Jack's Prioritized To-Do List
A simple to-do list/scrum board app implemented in HTML/JS/CSS.
## What does this app do?
This app provides a simple, intuitive interface for non-technical individuals to assign user stories to software developers. They can:
 - Assign prioritized "tasks" using a colorful, high-contrast, and intuitive UI.
 - View the status of any task at any time.
 - Filter tasks by user to evaluate employee performance & workload.

For developers, this app offers a functional scrum board with GitHub integration. Other features include:
 - Easy setup and deployment - this is built to be deployed using GitHub pages.
 - A functional, three phase scrum board that includes "Queued," "In Progress", and "Complete" columns.
 - Simple GitHub issue management - open issues are automatically displayed from all GitHub repos in an organization, and labels can be assigned & re-assigned quickly.

## Why make ANOTHER to-do list app?
As the Oregon State University Sustainability Office hires more folks that are able to contribute to software projects, a new solution will be needed to manage their workload. This app aims to satisfy that need by organizing tasks into user stories on a scrum board. Tasks are listed for the programmers based on priority, and the date in which the respective task was assigned. The app is accessible at: [http://jackstodolist.tk](http://jackstodolist.tk) and [http://sosoftware.tk](http://sosoftware.tk).

## How can I deploy my own to-do list app?
It's easy!
	1. Clone this repo, then edit the "config" variable in app.js.
	2. Create "queued", "in-progress", and "complete" issue labels in your repositories.
	3. Host the files on any web server.

Since GitHub account passwords are stored in plain-text, it is *highly recommended* that this application is only deployed internally.

## How to Use
### Creating Tasks
To assign a task, first select a project at the top of the page. Next, select a user ("guru") to be assigned to this task. Finally, enter the desired title and description of the task and click the "Add Task" button. Automagically, an issue will be created on the task's respective repository and the selected programmer will be assigned to that task.

### Managing Tasks
All tasks are assigned a color-coded priority. If one is not assigned by the user, the task will be created with "medium" priority by default. Depending on the task's status, a task can be dragged & dropped into any column. This updates the corresponding GitHub issue with a new status label.

Currently, this app does not support editing tasks. If a task's priority is changed, the corresponding GitHub issue's label must be updated manually though the respective GitHub repository.

### Filtering Tasks
Tasks can be filtered by username using url GET parameters. For example, this url can be used to only show tasks assigned to jackrwoods:
```
https://jackrwoods.github.io/so-scrum-board/?user=jackrwoods
```


## Planned Features:
	 - Tools for editing tasks: rename, re-assign to a new user, and re-assign a priority
	 - Assigned "Due Dates" for tasks
	 - GitHub Team Integration/Filters
	 - More secure password storage
