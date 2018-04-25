/*
 * Function Definitions
 */
function addProjects(repos) {
  var taskSelection = document.getElementById("repos");
  var q = document.getElementById("queued");
  var inp = document.getElementById("in-progress");
  var c = document.getElementById("complete");
  var g = document.getElementById("user");

  for (var i = 0; i < repos.length; i++) {

    // Add to the task creation project list
    var e = document.createElement("div");
    e.classList.add("item");
    e.classList.add("project");
    if(repos[i].name.length > 20) {
      e.innerHTML = repos[i].name.substring(0, 20) + ". . .";
    } else {
      e.innerHTML = repos[i].name;
    }
    taskSelection.appendChild(e);
    e.addEventListener("click", addTaskStepOne);

    // Add contributors to "guru" list
    var repo = gh.getRepo(config.organization, repos[i].name);
    repo.getContributors().then(function(c) {
      for (var i = 0; i < c.data.length; i++) {
        if (contributors.indexOf(c.data[i].login) < 0) {
          contributors.push(c.data[i].login);
          var e = document.createElement("div");
          e.classList.add("item");
          e.classList.add("user");
          e.innerHTML = c.data[i].login;
          g.appendChild(e);
          e.addEventListener("click", addTaskStepTwo);
        }
      }
    });

    // Add active pull requests to scrum board
    var issues = gh.getIssues(config.organization, repos[i].name).listIssues().then(function(issues) {
      // Add to the scrum board
      for (var i = 0; i < issues.data.length; i++) {

        var e = document.createElement("li");
        e.classList.add("task");
        e.innerHTML = "Task: " + issues.data[i].title + "<br />Assignee: " + issues.data[i].assignee.login+ "<br />Repo: " + repos[i].name;
        e.setAttribute("title", issues.data[i].title);
        e.setAttribute("assignee", issues.data[i].assignee.login);
        e.setAttribute("repo", repos[i].name);
        e.setAttribute("id", issues.data[i].number);
        switch(issues.data[i].labels[0].name) {
          case "queued":
            q.appendChild(e);
            break;
          case "in-progress":
            inp.appendChild(e);
            break;
          case "complete":
            c.appendChild(e);
            break;
        }

        e.addEventListener("mouseup", updateTask);
      }
    });
  }

  // Add event listener for "Add Task" button
  document.getElementById("add-task").addEventListener("click", addTask);
}

// Selects a repo for the new task
var addTaskStepOne = function addTaskStepOne(e) {
  task.repo = e.currentTarget.innerHTML;

  document.getElementById("select-project").classList.add("blocked");
  document.getElementById("select-user").classList.remove("blocked");
}

// Selects a contributor for the new task
var addTaskStepTwo = function addTaskStepTwo(e) {
  task.assignees = [e.currentTarget.innerHTML];

  document.getElementById("select-user").classList.add("blocked");
  document.getElementById("enter-desc").classList.remove("blocked");
}

// Adds the task to the scrum board, and creates an issue on the specified repo
// Assigns the selected user to this task
var addTask = function addTask(e) {
  var title = document.getElementById("task-title");
  var desc = document.getElementById("task-desc");

  // If the title box has been populated
  if(title.value.length > 0) {
    // Store text in task object
    task.title = title.value;
    task.body = desc.value;

    // Clear textboxes
    title.value = "";
    desc.value = "";

    // Add issue to repo
    task.labels = ["queued"];
    var repo = gh.getIssues(config.organization, task.repo).createIssue(task, function(e, a) {
      // If the issue is created, add it to the scrum board asynchronously.
      var q = document.getElementById("queued");
      var e = document.createElement("li");
      e.classList.add("task");
      e.setAttribute("title", task.title);
      e.setAttribute("assignee", task.asignees[0]);
      e.setAttribute("repo", task.repo);
      e.setAttribute("id", a.number);
      e.innerHTML = "Task: " + task.title + "<br />Assignee: " + task.assignees[0] + "<br />Repo: " + task.repo;
      q.appendChild(e);
      e.addEventListener("mouseup", updateTask);

      // Clear task object.
      task = {};

      // Block steps 2 and 3
      document.getElementById("select-project").classList.remove("blocked");
      document.getElementById("enter-desc").classList.add("blocked");
    });
  }
}

// This function is called when the user releases a task, located on the
// scrum board, with their mouse. This updates the task's corresponding issue
// in its repo with a new status label.
var updateTask = function updateTask(e) {
  var t = e.currentTarget;
  var issue = gh.getIssues(config.organization, t.getAttribute("repo"));
  issue.getIssue(t.getAttribute("id")).then(function(iObj) {
    issue.getLabel(t.parentElement.id).then(function(label) {
      // Update issue with new label
      iObj.data.labels[0] = label.data;
      var newIssue = {
        labels: [label.data]
      }
      issue.editIssue(iObj.data.number, newIssue).then(function(err) {
        console.log(err)
      });
    });
  });

}

/*
 * Initial Setup
 */

// Set the global configs to synchronous requests
$.ajaxSetup({
    async: false,
    error: function(err) {alert("Oops! An error occured. Check the browser's console for more information."); console.log(err);}
});

// Load configuration
var config = {
  "githubUser": {
    "username": "osu-Sustainability",
    "password": "Dr3@mT3@m"
  },
  "organization": "osu-sustainability-office"
};

// Enable JQuery sortable elements
// https://jqueryui.com/sortable/#empty-lists
$( function() {
  $( "ul.droptrue" ).sortable({
    connectWith: "ul"
  });

  $( "ul.dropfalse" ).sortable({
    connectWith: "ul",
    dropOnEmpty: false
  });

  $( "#complete, #in-progress, #queued" ).disableSelection();
} );

// Login to GitHub
var gh = new GitHub({
  username: config.githubUser.username,
  password: config.githubUser.password
});

// This task is manipulated when a new task is created.
var task = {};

// Get list of organization repos
var org = gh.getOrganization('osu-sustainability-office');
var contributors = [];
org.getRepos(function(err, repos) {
  if (err) console.log(err);

  // Populate projects list and scrum board with repos
  addProjects(repos);
});
