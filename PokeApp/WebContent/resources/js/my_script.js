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

var pokemonDataSet = false;  //True iff pokemon data up to date
var opponentDataSet = false; //True iff opponent data up to date

function getPokemon() {
	pokemonDataSet = false;
	opponentDataSet = false;
	
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
	}
	
	if(!opponentDataSet){
		setValues(opponentJsonData, opponentName);
		opponentDataSet = true;
	}
}

function setValues(pokeJsonData, name) {

	document.getElementById(name + "Name").innerHTML = pokeJsonData.name;
	var imgElement = document.getElementById(name + "Img");
	imgElement.setAttribute("src", pokeJsonData.sprites.front_default);
	imgElement.setAttribute("alt", pokeJsonData.name);

	var movesElement = document.getElementById(name + "Moves");
	movesElement.innerHTML = ""; //reset so it doesn't add on to UL

	var movesArray = pokeJsonData.moves;
	console.log(movesArray.length);
	for (var i = 0; i < movesArray.length; i++) {
		var versionGroupDetailsArray = movesArray[i].version_group_details;
		var include = false;
		for (var j = 0; j < versionGroupDetailsArray.length; j++) {
			if (versionGroupDetailsArray[j].version_group.name === "red-blue"
					&& versionGroupDetailsArray[j].level_learned_at === 0) {
				include = true;
			}
		}
		if (include) {
			var move = document.createElement("li");
			move.appendChild(document.createTextNode(movesArray[i].move.name));
			movesElement.appendChild(move);

		}
	}

}