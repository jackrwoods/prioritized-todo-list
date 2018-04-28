/*
 * Function Definitions
 */
 var k = 0;
function addProjects(repos) {
  // Look for url filters, and save username into user variable
  var url = new URL(window.location.href);
  var user = url.searchParams.get("user");
  console.log(user)

  var taskSelection = document.getElementById("repos");
  var q = document.getElementById("queued");
  var inp = document.getElementById("in-progress");
  var c = document.getElementById("complete");
  var g = document.getElementById("user");

  for (k = 0; k < repos.length; k++) {
    // Add to the task creation project list
    var e = document.createElement("div");
    e.classList.add("item");
    e.classList.add("project");
    e.setAttribute("repo", repos[k].name);
    if(repos[k].name.length > 20) {
      e.innerHTML = repos[k].name.substring(0, 20) + ". . .";
    } else {
      e.innerHTML = repos[k].name;
    }
    taskSelection.appendChild(e);
    e.addEventListener("click", addTaskStepOne);

    // Add contributors to "guru" list
    var repo = gh.getRepo(config.organization, repos[k].name);
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
    var issue = gh.getIssues(config.organization, repos[k].name);
    issue.listIssues().then(function(issues) {
      for (var j = 0; j < issues.data.length; j++) {
        if (user == null || issues.data[j].assignee.login == user) {
          var repoName = issues.data[j].repository_url.slice(issues.data[j].repository_url.lastIndexOf("/") + 1, issues.data[j].repository_url.length);
          var e = document.createElement("li");
          e.classList.add("task");
          e.innerHTML = "Task: " + issues.data[j].title + "<br />Assignee: " + issues.data[j].assignee.login+ "<br />Repo: " + repoName;
          e.setAttribute("title", issues.data[j].title);
          e.setAttribute("assignee", issues.data[j].assignee.login);
          e.setAttribute("repo", repoName);
          e.setAttribute("id", issues.data[j].number);

          // Github shuffles the order of the labels for priority and scrum location.
          var labelIndex = 1;
          var priorityIndex = 0;
          if (issues.data[j].labels[0].name.indexOf("priority") < 0) {
            labelIndex = 0;
            priorityIndex = 1;
          }
          e.classList.add(issues.data[j].labels[priorityIndex].name);
          switch(issues.data[j].labels[labelIndex].name) {
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
      }
    });
  }

  // Add event listener for "Add Task" button
  document.getElementById("add-task").addEventListener("click", addTask);

  // Event listeners for priority buttons
  var buttons = document.getElementsByClassName("btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", changePriority);
  }
}

// Selects a repo for the new task
var addTaskStepOne = function addTaskStepOne(e) {
  task.repo = e.currentTarget.getAttribute("repo");
  document.getElementById("select-project").classList.add("blocked");
  document.getElementById("select-user").classList.remove("blocked");
}

// Selects a contributor for the new task
var addTaskStepTwo = function addTaskStepTwo(e) {
  task.assignees = [e.currentTarget.innerHTML];

  document.getElementById("select-user").classList.add("blocked");
  document.getElementById("enter-desc").classList.remove("blocked");
}

var changePriority = function(e) {
  task.priority = e.currentTarget.id;
  var buttons = document.getElementsByClassName("btn");
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].classList.contains("active")) {
      buttons[i].classList.remove("active");
    }
  }
  e.currentTarget.classList.add("active");
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
    task.labels = ["queued", task.priority];
    var priority_temp = task.priority;
    delete task.priority; // If this isn't deleted, the task object is unrecognizable by GitHub.
    console.log(task)
    var repo = gh.getIssues(config.organization, task.repo).createIssue(task, function(err, a) {
      console.log(err)
      // If the issue is created, add it to the scrum board asynchronously.
      var q = document.getElementById("queued");
      var e = document.createElement("li");
      e.classList.add("task");
      e.classList.add(task.labels[1]);
      e.setAttribute("title", task.title);
      e.setAttribute("assignee", task.assignees[0]);
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

      // Restore priority
      task.priority = priority_temp;
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
      var priorityIndex = 0;
      if (iObj.data.labels[0].name.indexOf("priority") < 0) priorityIndex = 1;
      var newIssue = {
        labels: [label.data, iObj.data.labels[priorityIndex]]
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
    "username": "YOUR USERNAME HERE", // ex: osu-sustainability or jackrwoods
    "password": "YOUR PASSWORD HERE" // Password for the account used above.
  },
  "organization": "YOUR ORGANIZATION HERE" // ex: osu-sustainability-office
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
var task = {
  priority: "priority-med"
};

// Get list of organization repos
var org = gh.getOrganization('osu-sustainability-office');
var contributors = [];
org.getRepos(function(err, repos) {
  if (err) console.log(err);

  // Populate projects list and scrum board with repos
  addProjects(repos);
});
