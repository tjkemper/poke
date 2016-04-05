/**
 * Send AJAX request to the RESTful Pokemon API
 */

/*
 * Only run Javascript when page has loaded
 */
window.onload = function(){
	document.getElementById("pokemonSubmit")
		.addEventListener("click", getPokemon);
}

function getPokemon(){
	
	var pokemonId = document.getElementById("pokemonId").value;
	
	console.log("got to function: " + pokemonId);
	  var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
	    	var pokemon = JSON.parse(xhttp.responseText);
	    	setValues(pokemon);
	    }
	  };
	  xhttp.open("GET", "http://pokeapi.co/api/v2/pokemon/"+pokemonId, true);
	  xhttp.send();
}

function setValues(pokemon){
	document.getElementById("pokemonName").innerHTML = pokemon.name;
	var pokemonImgElement = document.getElementById("pokemonImg");
	pokemonImgElement.setAttribute("src", pokemon.sprites.front_default);
	pokemonImgElement.setAttribute("alt", pokemon.name);
}