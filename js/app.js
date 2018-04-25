/*
 * Function Definitions
 */
function addProjects(repos) {
  var taskSelection = document.getElementById("repos");
  var q = document.getElementById("queued");
  var inp = document.getElementById("in-progress");
  var c = document.getElementById("complete");

  for (var i = 0; i < repos.length; i++) {

    // Add to the task creation project list
    var e = document.createElement("div");
    e.classList.add("item");
    e.classList.add("project");
    e.innerHTML = repos[i].name;
    taskSelection.appendChild(e);

    // Add active pull requests to scrum board
    var issues = gh.getIssues(config.organization, repos[i].name).listIssues().then(function(issues) {

      // Add to the scrum board
      for (var i = 0; i < issues.data.length; i++) {

        var e = document.createElement("div");
        e.classList.add("task");
        e.innerHTML = "Task: " + issues.data[i].title + "<br />Assignee: " + issues.data[i].assignee.login+ "<br />Repo: " + repos[i].name;

        switch(issues.data[i].labels[0].name) {
          case "queued":
            q.removeChild(q.getElementsByTagName("p")[0]);
            q.appendChild(e);
            break;
          case "in-progress":
            inp.removeChild(inp.getElementsByTagName("p")[0]);
            inp.appendChild(e);
            break;
          case "complete":
            c.removeChild(c.getElementsByTagName("p")[0]);
            c.appendChild(e);
            break;
        }
      }
    });
  }
}

function addEventListeners() {

}


/*
 * Initial Setup
 */

// Set the global configs to synchronous requests
$.ajaxSetup({
    async: false
});

// Load configuration JSON
var config;
$.getJSON("../config.json", function(json) {
    config = json;
});

// Login to GitHub
var gh = new GitHub({
  username: config.githubUser.username,
  password: config.githubUser.password
});

// Get list of organization repos
var org = gh.getOrganization('osu-sustainability-office');
org.getRepos(function(err, repos) {
  if (err) console.log(err);

  // Populate projects list and scrum board with repos
  addProjects(repos);

  // Add event listeners to interactive elements
  addEventListeners();
});
