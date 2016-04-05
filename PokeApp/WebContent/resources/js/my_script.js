/**
 * Send AJAX request to the RESTful Pokemon API
 */

/*
 * Only run Javascript when page has loaded
 */
window.onload = function() {
	document.getElementById("pokemonSubmit").addEventListener("click",
			getPokemon);
}

function getPokemon() {
	var base_url = "http://pokeapi.co/api/v2/pokemon/";

	var pokemonId = document.getElementById("pokemonId").value;

	sendRequest(base_url + pokemonId, 1);
	
	var randomOpponentId = Math.floor(Math.random() * 721) + 1;
	
	sendRequest(base_url + randomOpponentId, 2);
	
}

function sendRequest(url, num) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var pokemon = JSON.parse(xhttp.responseText);
			setValues(pokemon, num);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function setValues(pokemon, num) {
	if (num == 1) {
		document.getElementById("pokemonName").innerHTML = pokemon.name;
		var pokemonImgElement = document.getElementById("pokemonImg");
		pokemonImgElement.setAttribute("src", pokemon.sprites.front_default);
		pokemonImgElement.setAttribute("alt", pokemon.name);
		
		var pokemonMovesElement = document.getElementById("pokemonMoves");
	
		var move = document.createElement("li");
		move.appendChild(document.createTextNode("punch"));
		pokemonMovesElement.appendChild(move);
		
		var movesArray = pokemon.moves;
		console.log(movesArray.length);
		for(var i = 0; i < movesArray.length; i++){
			var versionGroupDetailsArray = movesArray[i].version_group_details;
			var include = false;
			for(var j = 0; j < versionGroupDetailsArray.length; j++){
				if(versionGroupDetailsArray[j].version_group.name === "red-blue"
					&& versionGroupDetailsArray[j].level_learned_at === 0){
					include = true;
				}
			}
			if(include){
				console.log(movesArray[i].move.name);
			}
		}
		
		
	}else if(num == 2){
		document.getElementById("opponentName").innerHTML = pokemon.name;
		var pokemonImgElement = document.getElementById("opponentImg");
		pokemonImgElement.setAttribute("src", pokemon.sprites.front_default);
		pokemonImgElement.setAttribute("alt", pokemon.name);		
	}
}