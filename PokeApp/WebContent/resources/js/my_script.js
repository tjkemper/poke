/**
 * Send AJAX request to the RESTful Pokemon API
 * 
 * @author Taylor Kemper
 */

/*
 * Set event handler on button
 */
window.onload = function() {
	document.getElementById("pokemonSubmit").addEventListener("click", getPokemon);
	
}

/*
 * Max is 721, but red-blue has 151 pokemon
 */
var maxNumPokemon = 151;

var pokemonName = "pokemon"; // global, name of pokemon
var opponentName = "opponent";// global, name of opponent

var pokemonJsonData; //global, JSON for pokemon
var opponentJsonData;//global, JSON for opponent

var pokemonHealthStatus;
var opponentHealthStatus;

var pokemonDataSet = false;  //True iff pokemon data up to date
var opponentDataSet = false; //True iff opponent data up to date

var battleStatus = {
					turn : pokemonName //user starts first by default
					};

function getPokemon() {
	
	hideData();
	
	var base_url = "http://pokeapi.co/api/v2/pokemon/";

	var pokemonId = document.getElementById("selectedPokemonId").value;
	
	sendRequest(base_url + pokemonId, pokemonName);


	var randomOpponentId = Math.floor(Math.random() * maxNumPokemon) + 1;

	sendRequest(base_url + randomOpponentId, opponentName);

}

function sendRequest(url, name) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var jsonData = JSON.parse(xhttp.responseText);
		
			if(name === pokemonName){
				pokemonJsonData = jsonData;
			}else if(name === opponentName){
				opponentJsonData = jsonData;
			}
			
			setValuesBoth();
			
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function setValuesBoth(){
	if(!pokemonDataSet){
		setValues(pokemonJsonData, pokemonName);
		pokemonDataSet = true;
		document.getElementById(pokemonName+"Data").style.display = "inherit";

	}
	
	if(!opponentDataSet){
		setValues(opponentJsonData, opponentName);
		opponentDataSet = true;
		document.getElementById(opponentName+"Data").style.display = "inherit";

	}
}

function setValues(pokeJsonData, name) {

	document.getElementById(name + "Name").innerHTML = pokeJsonData.name;
	var imgElement = document.getElementById(name + "Img");
	imgElement.setAttribute("src", pokeJsonData.sprites.front_default);
	imgElement.setAttribute("alt", pokeJsonData.name);

	var movesElement = document.getElementById(name + "Moves");
	movesElement.innerHTML = ""; //reset so it doesn't add on to UL

	/**
	 * pulling Health Points from JSON data
	 */
	var stats = pokeJsonData.stats;
	console.log(stats.length);
	for(var i = 0; i < stats.length; i++){
		var statIndex = stats[i];
		var statObj = statIndex.stat;
		if(statObj.name == "hp"){
			if(name == "pokemon"){
				pokemonHealthStatus = statIndex.base_stat; 
				var hpElement = document.getElementById("pokemonHp");
				hpElement.innerHTML = ""+pokemonHealthStatus;
			}else{
				opponentHealthStatus = statIndex.base_stat;
				var hpElement = document.getElementById("opponentHp");
				hpElement.innerHTML = ""+opponentHealthStatus;
			}
		}
	}
	
	
	var movesArray = pokeJsonData.moves;
	console.log(movesArray.length);
	// Added counter to limit moves to first 4 found.
	var moveToggleCounter = 0;
	for (var i = 0; i < movesArray.length; i++) {
		var versionGroupDetailsArray = movesArray[i].version_group_details;
		var include = false;
		for (var j = 0; j < versionGroupDetailsArray.length; j++) {
			// Changed level_learned_at version to look at level 1.
			if (versionGroupDetailsArray[j].version_group.name === "red-blue"
					&& versionGroupDetailsArray[j].level_learned_at < 2) {
				include = true;
			}
		}
		if (include) {
			// Count to 4, resolve those, then exit to speed things up.
			moveToggleCounter++;
			if(moveToggleCounter<=4){
				var promise = pullMoveDetails(movesArray[i].move);
				
				promise.then(function(result){
					var move = document.createElement("li");
					move.appendChild(document.createTextNode(result.name + " , " + result.details.power));
					if(name!==opponentName){
						var radioElement = document.createElement("input");
					
						radioElement.setAttribute("type","radio");
						radioElement.setAttribute("name","pokemonMoveSelection");
						radioElement.setAttribute("value", result.name);
						if(moveToggleCounter==0){
							radioElement.setAttribute("checked",true);
						}
						move.appendChild(radioElement);
					}
					movesElement.appendChild(move);
				},function(err){
					console.log(err);
				});
			}else{
				// Remove move from array to keep track of actives
				movesArray.splice(i,1);
				i--;
			}
		}else{
			// Remove move from array to keep track of actives
			movesArray.splice(i,1);
			i--;
		}
	}

}


function hideData(){

	pokemonDataSet = false;
	opponentDataSet = false;
	
	document.getElementById(pokemonName+"Data").style.display = "none";
	document.getElementById(opponentName+"Data").style.display = "none";
	
}

// Get details for a move.
function pullMoveDetails(move){
	
	var promise =new Promise( function(resolve,reject){
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", move.url, true);
		xhttp.onload = function(){
			if(xhttp.status === 200){
				var jsonData = JSON.parse(xhttp.responseText);
				move.details = jsonData
				return resolve(move);
				
			}else{
				return reject("Error");
			}
		}
		xhttp.send();
	});
	
	return promise;
	
}

function generateOpponentMove(){
	//TODO: include probability
	var moves = opponentJsonData.moves;
	var randomMoveIndex = Math.floor(Math.random() * moves.length);
	return moves[randomMoveIndex];
}

function inflictDamageFromMove(move, name){
	var power = move.details.power;
	//call jake's function passing power and name
}
