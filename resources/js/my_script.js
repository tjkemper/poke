/**
 * Send AJAX request to the RESTful Pokemon API
 * 
 * @author Taylor Kemper, Jacob Eanes, Jeffrey Goyette
 */

/*
 * Set event handler on button
 */
window.onload = function() {

/*
 * Max is 721, but red-blue has 151 pokemon
 */

var POKE = {
  maxNumPokemon : 151,
  pokemonName : "pokemon", 		// name of pokemon
  opponentName : "opponent", 	// name of opponent
  pokemonJsonData : {}, 		// JSON for pokemon
  opponentJsonData : {},		// JSON for opponent
  pokemonStatus : {},			// full status of chosen pokemon
  opponentStatus : {}, 			// full status of generated opponent
  pokemonDataSet : false, 		// True iff pokemon data up to date
  opponentDataSet : false, 		// True iff opponent data up to date
  battleStatus : {
			turn : "pokemon" 	//user starts first by default
			},
  audio  : {
	  battle  : new Audio('resources/mp3/battle-vs-wild-pokemon.mp3'),
	  victory : new Audio('resources/mp3/victory-vs-wild-pokemon.mp3')
  },
  getPokemon : function() {
	  
	    document.getElementById("selectPokemonDiv").style.display = "none";
		document.getElementById("battleBanner").style.display = "block";
		var battleBannerAlert = document.getElementById("battleBannerAlert");
		battleBannerAlert.className = "alert alert-warning";
		battleBannerAlert.innerHTML = "Time to battle!";
		
		POKE.hideData();
		
		var base_url = "http://pokeapi.co/api/v2/pokemon/";

		var pokemonId = document.getElementById("selectedPokemonId").value;
		
		POKE.sendRequest(base_url + pokemonId, POKE.pokemonName);


		var randomOpponentId = Math.floor(Math.random() * POKE.maxNumPokemon) + 1;

		POKE.sendRequest(base_url + randomOpponentId, POKE.opponentName);

	},
  sendRequest : function (url, name) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				var jsonData = JSON.parse(xhttp.responseText);
			
				if(name === POKE.pokemonName){
					POKE.pokemonJsonData = jsonData;
				}else if(name === POKE.opponentName){
					POKE.opponentJsonData = jsonData;
				}
				
				POKE.setValuesBoth();
				
			}
		};
		xhttp.open("GET", url, true);
		xhttp.send();
	},
  setValuesBoth : function (){
		if(!POKE.pokemonDataSet){
			POKE.setValues(POKE.pokemonJsonData, POKE.pokemonName);
			POKE.pokemonDataSet = true;
			document.getElementById(POKE.pokemonName+"Data").style.display = "inherit";
			var hpBar = document.getElementById("pokemonHpBar");
			hpBar.style.width = "100%";
			hpBar.className = "progress-bar progress-bar-success";
		}
		
		if(!POKE.opponentDataSet){
			POKE.setValues(POKE.opponentJsonData, POKE.opponentName);
			POKE.opponentDataSet = true;
			document.getElementById(POKE.opponentName+"Data").style.display = "inherit";
			var hpBar = document.getElementById("opponentHpBar");
			hpBar.style.width = "100%";
			hpBar.className = "progress-bar progress-bar-success";
		}
		if(POKE.pokemonDataSet && POKE.opponentDataSet){
			
			POKE.audio.battle.play();
		}
	},
  setValues : function (pokeJsonData, name) {

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
					var HP = statIndex.base_stat * 5;
					POKE.pokemonStatus.startHP = HP;
					POKE.pokemonStatus.currentHP = HP;
					var hpElement = document.getElementById("pokemonHp");
					hpElement.innerHTML = ""+POKE.pokemonStatus.startHP;
				}else{
					var HP = statIndex.base_stat * 5;
					POKE.opponentStatus.startHP = HP;
					POKE.opponentStatus.currentHP = HP;
					var hpElement = document.getElementById("opponentHp");
					hpElement.innerHTML = ""+POKE.opponentStatus.startHP;
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
				
				if(moveToggleCounter<4){
					var promise = POKE.pullMoveDetails(movesArray[i].move);
					
					promise.then(function(result){
						var move = document.createElement("li");
//						move.appendChild(document.createTextNode("<span class=\"label label-info\">"+result.name + "<span> , <span class=\"badge\">" + (result.details.power||0) +"</span>"));
						
						var moveName = document.createElement("span");
						moveName.setAttribute("class", "label label-info");
						moveName.appendChild(document.createTextNode(result.name));
						move.appendChild(moveName);
						
						var movePower = document.createElement("span");
						movePower.setAttribute("class", "badge");
						movePower.appendChild(document.createTextNode(result.details.power||0));
						move.appendChild(movePower);
						
						if(name!=POKE.opponentName){
							var radioElement = document.createElement("input");
						
							radioElement.setAttribute("type","radio");
							radioElement.setAttribute("name","pokemonMoveSelection");
							radioElement.setAttribute("value", result.name);
							if(moveToggleCounter==0){
								radioElement.setAttribute("checked","checked");
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
				moveToggleCounter++;
			}else{
				// Remove move from array to keep track of actives
				movesArray.splice(i,1);
				i--;
			}
		}

	},
  hideData : function (){

	  POKE.pokemonDataSet = false;
	  POKE.opponentDataSet = false;
		
		document.getElementById(POKE.pokemonName+"Data").style.display = "none";
		document.getElementById(POKE.opponentName+"Data").style.display = "none";
		
	},
  pullMoveDetails : 
	  // Get details for a move.
	  function (move){
		
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
		
	},
  deductHealth : 
	  /**
	   * fucntion to deduct the opposition's health points
	   * @param pokeType
	   * @param pointDeduction
	   */
	  function (name, pointDeduction){
	  	var statPercentage = 0;
	  	var currentHP = 0;
	  	var startingHP = 0;
	  	if(name == POKE.pokemonName){
	  		currentHP = POKE.pokemonStatus.currentHP - pointDeduction;
	  		startingHP = POKE.pokemonStatus.startHP;
	  	}else{
	  		currentHP = POKE.opponentStatus.currentHP - pointDeduction;
	  		startingHP = POKE.opponentStatus.startHP;
	  	}
	  	statPercentage = (currentHP / startingHP) * 100;
	  	statPercentage = Math.floor(statPercentage);
	  	var hpElement = document.getElementById(name+"Hp");
	  	var hpBar = document.getElementById(name+"HpBar");
	  	if(statPercentage > 15 && statPercentage <= 40 ){
	  		hpBar.className = "progress-bar progress-bar-warning";
	  	}else if(statPercentage >= 0 && statPercentage <= 15){
	  		hpBar.className = "progress-bar progress-bar-danger";
	  	}else if(statPercentage < 0){
	  		hpBar.className = "progress-bar progress-bar-danger";
	  		statPercentage = 0;
	  		currentHP = 0;
	  	}
	  	if(name == POKE.pokemonName){
	  		POKE.pokemonStatus.currentHP = currentHP;
	  	}else{
	  		POKE.opponentStatus.currentHP = currentHP;
	  	}
	  	hpBar.style.width = statPercentage+"%";
	  	hpElement.innerHTML = ""+currentHP;
	  },
  generateOpponentMove : function (){
		//TODO: include probability
		var moves = POKE.opponentJsonData.moves;
		var randomMoveIndex = Math.floor(Math.random() * moves.length);
		console.log(moves[randomMoveIndex]);
		return moves[randomMoveIndex].move;
	},
  selectPokemonMove : function (){
	    
	    if(POKE.battleStatus.turn == "pokemon"){
			var moves = POKE.pokemonJsonData.moves;
			console.log('In move selection');
		    var cboxes = document.getElementsByName('pokemonMoveSelection');
		    console.log(cboxes);
		    var len = cboxes.length;
		    console.log(len);
		    for (var i=0; i<len; i++) {
		    	console.log("current checkbox " + i);
		    	console.log("current checkbox is " + cboxes[i].checked);
		    	if(cboxes[i].checked){
		    		console.log("move is check");
		    		for(var j = 0; j < moves.length; j++){
		    			if(moves[j].move.name == cboxes[i].value){
		    				POKE.inflictDamageFromMoveToName(moves[j].move, POKE.opponentName);
		    				//break to stop early
		    				break;
		    			}
		    		}
		    		// break to stop early
		    		break;
		    	}
		    }
		    POKE.setToFront(POKE.pokemonName);
		    if(POKE.isGameOver()){
		    	POKE.endGame();
		    }else {
			    POKE.battleStatus.turn = POKE.opponentName;
			    
			    setTimeout(function(){
			    		     POKE.inflictDamageFromMoveToName(POKE.generateOpponentMove(), POKE.pokemonName)
			    			 POKE.setToFront(POKE.opponentName);
			    		     
			    		     if(POKE.isGameOver()){
			    		    	 POKE.endGame();
			    		     }else{
			    		    	 POKE.battleStatus.turn = POKE.pokemonName;
			    		     }
			    		   },
			    		   3000);
		    }
	    }
	    
	},
  inflictDamageFromMoveToName : function (move, name){
		console.log(move);
		var power = move.details.power || 0;
		POKE.deductHealth(name, power);
		POKE.updateBattleBannerAlert(move, power, name);
	},
  updateBattleBannerAlert : function(move, power, name){
	  var battleBannerAlert = document.getElementById("battleBannerAlert");
	  var toName   = name == POKE.pokemonName ? POKE.pokemonJsonData.name  : POKE.opponentJsonData.name;
	  var fromName = name == POKE.pokemonName ? POKE.opponentJsonData.name : POKE.pokemonJsonData.name;
	  var className = name == POKE.pokemonName ? "alert alert-danger" : "alert alert-success";
	  var text = fromName + " used " + move.name + " and inflicted " + power + " damage to " + toName;
	  
	  battleBannerAlert.className = className;
	  battleBannerAlert.innerHTML = text;
		
  },
  setToFront : function(name){
	  var imgElement = document.getElementById(name + "Img");	  
	  imgElement.setAttribute("src", POKE[name+"JsonData"].sprites.front_default);
  },
  isGameOver : function(){
	  if(POKE.pokemonStatus.currentHP <= 0){
		  return true;
	  }
	  if(POKE.opponentStatus.currentHP <= 0){
		  return true;
	  }
	  return false;
	  
  },
  endGame : function(){
	  
	  clearInterval(POKE.flipPictureInterval);
	  
	  POKE.audio.battle.pause();
	  POKE.audio.victory.play();
	  
	  var battleBannerAlert = document.getElementById("battleBannerAlert");
	  var winnerName;
	  var loserName;
	  var newClassName;
	  var faintedDiv;
	  
	  if(POKE.opponentStatus.currentHP <= 0){
		  winnerName = POKE.pokemonJsonData.name;
		  loserName = POKE.opponentJsonData.name;
		  newClassName = "alert alert-success";
		  faintedDiv = "opponentData";
	  }else {
		  winnerName = POKE.opponentJsonData.name;
		  loserName = POKE.pokemonJsonData.name;
		  newClassName = "alert alert-danger";
		  faintedDiv = "pokemonData";
	  }
	  battleBannerAlert.className = newClassName;
	  battleBannerAlert.innerHTML = winnerName + " has defeated " + loserName;
	  document.getElementById(faintedDiv).style.opacity = 0.5;
	  
	  
	  document.getElementById("pokemonSelectMoveBtn").disabled = "disabled";
	  
  },
  flipPictureInterval : setInterval(function(){
		console.log("HERE - " + POKE.battleStatus.turn);
		if(POKE.pokemonDataSet &&  POKE.battleStatus.turn === POKE.pokemonName){
			var imgElement = document.getElementById(POKE.pokemonName + "Img");
			
			if(imgElement.getAttribute("src") == POKE.pokemonJsonData.sprites.front_default){
				imgElement.setAttribute("src", POKE.pokemonJsonData.sprites.back_default);
			}else {
				imgElement.setAttribute("src", POKE.pokemonJsonData.sprites.front_default);
			}
			
			
			
		}else if(POKE.opponentDataSet && POKE.battleStatus.turn === POKE.opponentName){
			var imgElement = document.getElementById(POKE.opponentName + "Img");
			
			if(imgElement.getAttribute("src") == POKE.opponentJsonData.sprites.front_default){
				imgElement.setAttribute("src", POKE.opponentJsonData.sprites.back_default);
			}else {
				imgElement.setAttribute("src", POKE.opponentJsonData.sprites.front_default);
			}
			
			
		}
	}, 500),
	init : function(){
		POKE.audio.battle.loop = true;
//		POKE.audio.victory.loop = true;

		document.getElementById("pokemonSubmit").addEventListener("click", POKE.getPokemon);
		document.getElementById("pokemonSelectMoveBtn").addEventListener("click", POKE.selectPokemonMove);
	}

};

POKE.init();





} //end window.onload







