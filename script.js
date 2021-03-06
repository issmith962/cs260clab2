window.player1id = null; 
window.player2id = null;

window.currentState = "player"; 

window.screenSizeQuery = window.matchMedia("(min-width: 700px)");
// alternate value is "seasonAv"
let player1form = document.getElementById("player1-form");
let player2form = document.getElementById("player2-form");

let playerOp = document.getElementById("player-op"); 
let seasonAvOp = document.getElementById("season-av-op"); 
let allTimeOp = document.getElementById("all-time-op"); 

loadDataValsPlayer();

player1form.addEventListener("submit", function(event) {
	event.preventDefault();
	let playerName = String(document.getElementById("player1-name").value);
	if ((playerName =="") || (playerName.trim().indexOf(' ') == -1)) {
		return; 
	}
	else {
		searchPlayer(playerName).then(function(player) {
			if (player == null) {
				window.player1id = null;
				let p1Data = document.getElementById("p1-data");
				p1Data.innerHTML = "<p>No player found</p>"; 
				p1Data.style.textAlign = "top";
			} else {
				window.player1id = player.id; 
				if (window.currentState == "player") {
					loadPlayerData(window.player1id).then(function(newHTML) {
						document.getElementById("p1-data").innerHTML = newHTML; 
					}); 
				}
				else if (window.currentState == "seasonAv") {
					loadSeasonAvData(window.player2id).then(function(newHTML) {
						document.getElementById("p1-data").innerHTML = newHTML; 
					}); 
				}
				else {
					alert("player" + " " + window.currentState); 
				}
			}

		}); 
	}
});


player2form.addEventListener("submit", function(event) {
	event.preventDefault();
	let playerName = String(document.getElementById("player2-name").value);
	if ((playerName =="") || (playerName.trim().indexOf(' ') == -1)) {
		return; 
	}
	else {
		searchPlayer(playerName).then(function(player) {
			if (player == null) {
				window.player2id = null;
				document.getElementById("p2-data").innerHTML = "<p>No player found</p>"; 
			} else {
				window.player2id = player.id; 
				if (window.currentState == "player") {
					loadPlayerData(window.player2id).then(function(newHTML) {
						document.getElementById("p2-data").innerHTML = newHTML; 
					}); 
				}
				else if (window.currentState == "seasonAv") {
					loadSeasonAvData(window.player2id).then(function(newHTML) {
						document.getElementById("p2-data").innerHTML = newHTML; 
					}); 
				}
				else {
					alert("error: state is " + window.currentState); 
				}
			}
		}); 
	}
});

playerOp.addEventListener("click", function(event) {
	event.preventDefault();
	document.getElementById("search-container").style.display = "flex"; 

	window.currentState = "player";
	loadDataValsPlayer();
	

	if (window.player1id != null) {
		loadPlayerData(window.player1id).then(function(newHTML) {
			document.getElementById("p1-data").innerHTML = newHTML; 
		}); 
	}
	if (window.player2id != null) {
		loadPlayerData(window.player2id).then(function(newHTML) {
			document.getElementById("p2-data").innerHTML = newHTML; 
		}); 
	}

});

seasonAvOp.addEventListener("click", function(event) {
	event.preventDefault();

	document.getElementById("search-container").style.display = "flex"; 
	window.currentState = "seasonAv"; 
	loadDataValsSeasonAvs();

	if (window.player1id != null) {
		loadSeasonAvData(window.player1id).then(function(newHTML) {
			document.getElementById("p1-data").innerHTML = newHTML; 
		}); 
	}
	if (window.player2id != null) {
		loadSeasonAvData(window.player2id).then(function(newHTML) {
			document.getElementById("p2-data").innerHTML = newHTML; 
		}); 
	}

});

document.getElementById("game-op").addEventListener("click", function(event) {
	getRandomGameOfSeason().then(function(games) {
		let rand = Math.floor(Math.random() * games.data.length); 
		let newHTML = 
			"<h2>A Random Game from a Recent Season</h2>" + 
			hsw3("Date: " + games.data[rand].date.slice(0,10)) + 
			hsw3("Season: " + games.data[rand].season) +  
			hsw3("Home Team City: " + games.data[rand].home_team.city) +  
			hsw3("Home Team Name: " + games.data[rand].home_team.name) +  
			hsw3("Visiting Team City: " + games.data[rand].visitor_team.city) + 
			hsw3("Visiting Team Name: " + games.data[rand].visitor_team.name);  
			hsw3("Home Team Score: " + games.data[rand].home_team_score) +  
			hsw3("Visitor Team Score: " + games.data[rand].visitor_team_score); 

		let dataVals = document.getElementById("data-vals"); 
		dataVals.innerHTML = newHTML;
		dataVals.style.width = "100%"; 
		document.getElementById("search-container").style.display = "none"; 
		document.getElementById("p1-data").innerHTML = ""; 
		document.getElementById("p2-data").innerHTML = ""; 
		window.player1id = null;
		window.player2id = null;
	}); 
});





// Paragraph Sandwich (for html element)
function psw(str) {
	return "<p>" + str + "</p>"; 
} 
// Header Sandwich (for html element) 
function hsw3(str) {
	return "<h3>" + str + "</h3>"; 
}
function hsw4(str) {
	return "<h4>" + str + "</h4>"; 
}

function loadDataValsPlayer() {
	let dataVals = document.getElementById("data-vals"); 
	
	/* First Name - first_name
	 * Last Name - last_name
	 * Position - position
	 * Height - height_feet + "' " + height_inches "\""
	 * weight - weight_pounds + "lb."
	 * City - team.city
	 * Team - team.name
	 * Team Division - team.division
	 * Team Conference - team.conference
	 */
	
	let newHTML = 
		hsw4("First Name") + hsw4("Last Name") + hsw4("Position") 
		+ hsw4("Height") + hsw4("Weight") + hsw4("City") + hsw4("Team") 
		+ hsw4("Team Division") + hsw4("Team Conference"); 
	dataVals.innerHTML = newHTML; 
	
	if (window.screenSizeQuery.matches) {
		document.getElementById("p1-data").style.width = "15vw";
		document.getElementById("p2-data").style.width = "15vw";
		document.getElementById("data-vals").style.width = "20vw";
	}
	else {
		document.getElementById("p1-data").style.width = "25vw";
		document.getElementById("p2-data").style.width = "25vw";
		document.getElementById("data-vals").style.width = "40vw";
	}

	
}
async function loadPlayerData(id) {
	let data = await getPlayer(id); 
	let newHTML = hsw4(data.first_name) + hsw4(data.last_name); 
	if (data.position != "") {
		newHTML = newHTML + hsw4(data.position); 
	} else {
		newHTML = newHTML + hsw4("-"); 
	}
	if ((data.height_feet != null) && (data.height_inches != null)) {
		newHTML = newHTML + hsw4(data.height_feet + "' " + data.height_inches + '"'); 
	} else {
		newHTML = newHTML + hsw4("-"); 
	}
	if (data.weight_pounds != null) {
		newHTML = newHTML + hsw4(data.weight_pounds + " lb"); 
	} else {
		newHTML = newHTML + hsw4("-"); 
	}
	if (data.team != null) {
		newHTML = newHTML + 
			hsw4(data.team.city) + 
			hsw4(data.team.name) + 
			hsw4(data.team.division) + 
			hsw4(data.team.conference); 
	} else {
		newHTML = newHTML + hsw4("-") + hsw4("-") + hsw4("-"); 
	}
	return newHTML;
}

function loadDataValsSeasonAvs() {
	let dataVals = document.getElementById("data-vals"); 
	
	/* Season - season
	 * Games Played - games_played
	 * Minutes Played - min
	 * Points - pts
	 * Field Goals Made - fgm
	 * Field Goals Attempted - fga
	 * Field Goal Percentage - fg_pct
	 * 3 Point Field Goals Made - fg3m 
	 * 3 Point Field Goals Attempted - fg3a
	 * 3 Point Field Goal Percentage - fg3_pct
	 * Free Throws Made - ftm 
	 * Free Throws Attempted - fta
	 * Free Throw Percentage - ft_pct
	 * Offensive Rebounds - oreb
	 * Defensive Rebounds - dreb
	 * Rebounds - reb
	 * Assists - ast
	 * Steals - stl
	 * Blocks - blk
	 * Turnovers - turnover
	 * Personal Fouls - pf
	 */

	let newHTML = 
		hsw4("Season") + 
		hsw4("Games Played") + 
		hsw4("Minutes Played") + 
		hsw4("Points") + 
		hsw4("Field Goals Made") + 
		hsw4("Field Goals Attempted") + 
		hsw4("Field Goal Percentage") + 
		hsw4("3 Point Field Goals Made") + 
		hsw4("3 Point Field Goals Attempted") + 
		hsw4("3 Point Field Goal Percentage") + 
		hsw4("Free Throws Made") + 
		hsw4("Free Throws Attempted") + 
		hsw4("Free Throw Percentage") + 
		hsw4("Offensive Rebounds") + 
	  hsw4("Defensive Rebounds") + 
		hsw4("Rebounds") + 
		hsw4("Assists") + 
		hsw4("Steals") + 
		hsw4("Blocks") + 
		hsw4("Turnovers") + 
		hsw4("Personal Fouls"); 
	dataVals.innerHTML = newHTML; 

	if (window.screenSizeQuery.matches) {
		document.getElementById("p1-data").style.width = "15vw";
		document.getElementById("p2-data").style.width = "15vw";
		document.getElementById("data-vals").style.width = "20vw";
	}
	else {
		document.getElementById("p1-data").style.width = "25vw";
		document.getElementById("p2-data").style.width = "25vw";
		document.getElementById("data-vals").style.width = "40vw";
	}
}
async function loadSeasonAvData(id) {
	let json = await getSeasonAv(id); 
	let data = json.data[0]; 
	
	let newHTML = 
		hsw4(data.season) + 
		hsw4(data.games_played) + 
		hsw4(data.min) + 
		hsw4(data.pts) + 
		hsw4(data.fgm) + 
		hsw4(data.fga) + 
		hsw4(data.fg_pct) + 
		hsw4(data.fg3m) + 
		hsw4(data.fg3a) + 
		hsw4(data.fg3_pct) + 
		hsw4(data.ftm) + 
		hsw4(data.fta) + 
		hsw4(data.ft_pct) + 
		hsw4(data.oreb) + 
		hsw4(data.dreb) + 
		hsw4(data.reb) + 
		hsw4(data.ast) + 
		hsw4(data.stl) + 
		hsw4(data.blk) + 
		hsw4(data.turnover) + 
		hsw4(data.pf); 
	return newHTML; 
}

// Takes in a (playerName : String)
// Returns a player or null
async function searchPlayer(playerName) {
	let firstName = playerName.split(" ")[0].toLowerCase(); 
	let lastName = playerName.split(" ")[1].toLowerCase(); 
	let page = 0; 
	const fetchPlayers = async (p) => {
		let url = "https://www.balldontlie.io/api/v1/players?search=" + firstName
			+ "&page=" + p;
		const response = await fetch(url);
		const players_json = await response.json();
		return players_json;
	}
	while (1) {
		let json = await fetchPlayers(page); 
		for (player of json.data) {
			if (player.first_name.toLowerCase() === firstName) {
				if (player.last_name.toLowerCase() === lastName) {
					return player; 
				}
			}
		}
		page = json.meta.next_page;
		if (page == null) {
			return null;
		}
	}
}


async function getRandomGameOfSeason() {
	let games = await getGamesOfSeason("2020"); 
	return games;
}

async function getPlayer(id) {
	let url = "https://www.balldontlie.io/api/v1/players/" + id; 
	const response = await fetch(url); 
	const player = await response.json();
	return player; 
}

async function getSeasonAv(id) {
	let url = "https://www.balldontlie.io/api/v1/season_averages?player_ids[]=" + id; 
	const response = await fetch(url);
	const stats = await response.json();
	return stats; 
}

async function getGamesOfSeason(season) {
	let url = "https://www.balldontlie.io/api/v1/games?per_page=100&season[]=" + season; 
	const response = await fetch(url);
	const games = await response.json();
	return games;
}
	
		

