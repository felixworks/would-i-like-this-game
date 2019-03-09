'use strict';

const apiGiantBomb = `fec6b7750ced7ec24e9ff54a9b2aeea2b573d5a8`;

const twitchIdUrl = 'https://api.twitch.tv/helix/games?name=';

const twitchClipUrl = 'https://api.twitch.tv/helix/clips?game_id=';

const twitchStreamUrl = 'https://api.twitch.tv/helix/streams?game_id=';

const options = {
    headers: {
        'Client-id': 'lzvscy091kgp5i7muvi8xhpd9uo5dc'
    }
};

function submitButtonHandler() {
    $('.game-form').on('submit', function(event) {
        event.preventDefault();
        let userInput = $('input.game-search').val();
        $('.searched-for').html(`<p>Showing results for: <span class="search-term">${userInput}</span></p>`);
        $('.twitch-clip-results').empty();
        $('.twitch-stream-results').empty();
        handleGameSearch();
    });
}

function createTwitchUrl(input, selectedUrl) {
    let modifiedInput = encodeURIComponent(input);
    let requestUrl = selectedUrl + modifiedInput;
    // console.log('requestUrl', requestUrl);
    return requestUrl;
}

function generateTwitchStream(userInput) {
    fetch(createTwitchUrl(userInput, twitchIdUrl), options)
    .then(response => {
        if (response.ok) {
            // console.log(response);
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        if (responseJson.data.length > 0) {
            console.log('returning responseJson from generateTwitchStream', responseJson);
            return responseJson.data[0].id;
        }
        // console.log('no results response', responseJson);
        throw new Error("No results for the selected game available.");
    })
    // .then(twitchId => console.log('TwitchID', twitchId))
    .then(twitchId =>  {
        let twitchUrls = {
        clipUrl: createTwitchUrl(twitchId, twitchClipUrl),
        streamUrl: createTwitchUrl(twitchId, twitchStreamUrl)
        };
        return twitchUrls;
    })
    .then(twitchUrls => fetch(twitchUrls.streamUrl, options))
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    // .then(responseJson => console.log('Twitch stream', responseJson))
    .then(responseJson => displayTwitchStream(responseJson))
    .catch(error => $('.twitch-stream-results').empty().append('<h2>Most Popular Twitch Streams</h2>' + error.message));
}

function generateTwitchClip(userInput) {
    fetch(createTwitchUrl(userInput, twitchIdUrl), options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        if (responseJson.data.length > 0) {
            return responseJson.data[0].id;
        }
        // console.log('no results response', responseJson);
        throw new Error("No results for the selected game available.");
    })
    // .then(twitchId => console.log('TwitchID', twitchId))
    .then(twitchId =>  {
        let twitchUrls = {
        clipUrl: createTwitchUrl(twitchId, twitchClipUrl),
        streamUrl: createTwitchUrl(twitchId, twitchStreamUrl)
        };
        return twitchUrls;
    })
    .then(twitchUrls => fetch(twitchUrls.clipUrl, options))
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    // .then(responseJson => console.log('Twitch clip', responseJson))
    .then(responseJson => displayTwitchClip(responseJson))
    .catch(error => $('.twitch-clip-results').empty().append('<h2>Most Popular Twitch Clip</h2>' + error.message));
}

function displayTwitchStream(responseJson) {
    console.log('before userNames has been created', responseJson);
    let userNames = [];
    for (let i=0; i<responseJson.data.length && i<3; i++) {
        userNames.push(responseJson.data[i].user_name);
    }
    let results = [`<h2>Most Popular Twitch Streams:</h2>`];
    console.log('list of channel names', userNames)
    userNames.map(userName => {
        results.push(`
        <div class="iframe-container">
        <iframe
        src="https://player.twitch.tv/?channel=${userName}&autoplay=false"
        allowfullscreen>
        </iframe>
        </div>`)
    })
    $('.twitch-stream-results').append(results);
}

function displayTwitchClip(responseJson) {
    let clipId = responseJson.data[0].id;
    let results = `
        <h2>Most Popular Twitch Clip</h2>
        <div class="iframe-container">
        <iframe
        src="https://clips.twitch.tv/embed?clip=${clipId}&autoplay=false"
        allowfullscreen>
        </iframe>
        </div>`;
    // console.log(results);
    $('.twitch-clip-results').append(results);
}

function handleGameSearch() {
    let gameTitle = $('#game-search').val().trim().toLowerCase();
    $('#game-search').val('');
    displayGameInfo(gameTitle);
}

function displayGameInfo(gameTitle) {
    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `https://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiGiantBomb}&query=${gameTitle}&resources=game`,
        success: function(response) {
            if (response.results.length > 0) {
                fetchGameInfo(response);
                fetchGameReviews(response);
                renderMoreInfo(response);

                // We are calling generateTwitchClip() here in order to feed the Twitch API with Giantbomb's somewhat smarter search results. The ternary operator is a hack to make Red Dead Redemption 2 pull from Twitch correctly.
                generateTwitchStream((response.results[0].name === "Red Dead Redemption II") ? "Red Dead Redemption 2" : response.results[0].name);
                generateTwitchClip((response.results[0].name === "Red Dead Redemption II") ? "Red Dead Redemption 2" : response.results[0].name);
            } else {
                displayErrorMessage();
                $('.giantbomb-review').empty();
            }
        }
    });
}

function fetchGameInfo(response) {
    let gameGuid = response.results[0].guid;

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `https://www.giantbomb.com/api/game/${gameGuid}/?format=jsonp&api_key=${apiGiantBomb}`,
        success: function(response) {
            renderGameInfo(response);
            listGameDevs(response);
            listGameRatings(response);
            listGamePlatforms(response);
            listGameGenres(response);
            listSimilarGames(response);
        }
    });
}

function fetchGameReviews(response) {
    let gameId = response.results[0].id.toString();

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `https://www.giantbomb.com/api/reviews/?format=jsonp&api_key=${apiGiantBomb}&filter=game:${gameId}`,
        success: function(response) {
            if (response.results.length > 0){
                renderGameReviews(response);
            } else {
                displayNoReviews();
            }
        }
    });
}

function renderGameInfo(response) {
    $('.giantbomb-info').html(`
    <img class="game-thumbnail" src="${response.results.image.thumb_url}" alt="${response.results.name} thumbnail"> 
        <h2 class="game-title">${response.results.name}</h2>
        <p><b>Rating:</b> <span class="game-ratings"></span></p>
        <p><b>Developers:</b> <span class="game-devs"></span></p>
        <p><b>Platforms:</b> <span class="game-platforms"></span></p>
        <p><b>Genres:</b> <span class="game-genres"></span></p>
        <p><b>Description:</b> ${response.results.deck} <a href="${response.results.site_detail_url}" target="_blank">Read More</a></p>
        <p><b>Similar Games:</b> <span class="similar-games"></span></p>
    `);
}

function listGameDevs(response) {
    let gameDevs = [];
    for (let i = 0; i < response.results.developers.length; i++) {
        gameDevs.push(response.results.developers[i].name);
    }
    $('.game-devs').text(gameDevs.join(', '));
}

function listGameRatings(response) {
    let ratings = [];
    for (let i = 0; i < response.results.original_game_rating.length; i++) {
        ratings.push(response.results.original_game_rating[i].name);
    }
    $('.game-ratings').text(ratings.join(', '));
}

function listGamePlatforms(response) {
    let platforms = [];
    for (let i = 0; i < response.results.platforms.length; i++) {
        platforms.push(response.results.platforms[i].name);
    }
    $('.game-platforms').text(platforms.join(', '));
}

function listGameGenres(response) {
    let genres = [];
    for (let i = 0; i < response.results.genres.length; i++) {
        genres.push(response.results.genres[i].name);
    }
    $('.game-genres').text(genres.join(', '));
}

function listSimilarGames(response) {
    if (response.results.similar_games == null) {
        $('.similar-games').html(`N/A`);
    } else {
        let simGames = [];
        for (let i = 0; i < response.results.similar_games.length; i++) {
            simGames.push(`<a href="${response.results.similar_games[i].site_detail_url}" target="_blank">${response.results.similar_games[i].name}</a>`);
        }
        let simGamesList = simGames.join(', ');
        $('.similar-games').html(simGamesList);
    }
}

function renderGameReviews(response) {
    $('.giantbomb-review').html(`
        <h2 class="game-reviews">Reviews</h2>
        <p><b>Score:</b> <img src="img/game-stars-${response.results[0].score}.png" alt="${response.results[0].score} out of 5 stars"></p>
        <p>${response.results[0].deck} <a href="${response.results[0].site_detail_url}" target="_blank">Read More</a></p>
    `);
}

function renderMoreInfo(response) {
    let gameGuid = response.results[0].guid;
    let gameTitle = (response.results[0].name === "Red Dead Redemption II") ? "Red Dead Redemption 2" : response.results[0].name;
    let gameTitle2 = gameTitle.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    let gameTitleUrl = gameTitle2.replace(/\s+/g, '-').toLowerCase();
    console.log('gameTitle', gameTitle);
    console.log('gameTitle2', gameTitle2);
    console.log('gameTitleUrl', gameTitleUrl);

    $('.more-info').html(`
    <p><a class="gb-reviews" href="https://www.giantbomb.com/${gameTitleUrl}/${gameGuid}/user-reviews/" target="_blank">See more user reviews for ${gameTitle} on GiantBomb.com</a></p>

    <h2 class="external-links">More Info</h2>
    <p><a class="external" href="https://www.gamespot.com/${gameTitleUrl}/reviews" target="_blank">GameSpot</a><a class="external" href="https://www.ign.com/games/${gameTitleUrl}" target="_blank">IGN</a></p>
    `);
}

function displayErrorMessage() {
    $('.giantbomb-info').html(`
        <h2>Error: Game does not exist!</h2>
    `);
}

function displayNoReviews() {
    $('.giantbomb-review').html(`
        <h2 class="game-reviews">Reviews</h2>
    `);
}

$(submitButtonHandler)