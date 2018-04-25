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
    e.innerHTML = repos[i].name;
    taskSelection.appendChild(e);

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
    async: false,
    error: function(err) {alert(err);}
});

// Load configuration JSON
var config;
$.getJSON("../config.json", function(json) {
    config = json;
});

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

// Get list of organization repos
var org = gh.getOrganization('osu-sustainability-office');
var contributors = [];
org.getRepos(function(err, repos) {
  if (err) console.log(err);

  // Populate projects list and scrum board with repos
  addProjects(repos);

  // Add event listeners to interactive elements
  addEventListeners();
});
