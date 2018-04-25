// Set the global configs to synchronous
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

// Populate projects list and scrum board with repos

// Add event listeners to interactive elements
