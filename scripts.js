'use strict';

const apiGiantBomb = `fec6b7750ced7ec24e9ff54a9b2aeea2b573d5a8`;

function submitButtonHandler() {
    $('.game-form').on('submit', function(event) {
        event.preventDefault();
        let userInput = $('input.game-search').val();
        $('.searched-for').html(`<p>Showing results for: <b>${userInput}</b></p>`);
        $('.twitch-clip-results').empty();
        generateTwitchRequest(userInput);
        handleGameSearch();
    });
}

function createTwitchIdUrl(userInput) {
    let modifiedUserInput = encodeURIComponent(userInput);
    let requestUrl = `https://api.twitch.tv/helix/games?name=${modifiedUserInput}`;
    return requestUrl;
}

function createTwitchClipUrl(response) {
    let modifiedResponse = encodeURIComponent(response);
    let requestUrl = `https://api.twitch.tv/helix/clips?game_id=${modifiedResponse}`;
    return requestUrl;
}

function generateTwitchRequest(userInput) {
    const options = {
        headers: {
            'Client-id': 'lzvscy091kgp5i7muvi8xhpd9uo5dc'
        }
    };

    fetch(createTwitchIdUrl(userInput), options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusTest);
    })
    .then(responseJson => {
        if (responseJson.data.length > 0) {
            return responseJson.data[0].id;
        }   
        throw new Error("No results");
    })
    // .then(twitchId => console.log('TwitchID', twitchId))
    .then(twitchId => createTwitchClipUrl(twitchId))
    .then(clipUrl => fetch(clipUrl, options))
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusTest);
    })
    // .then(responseJson => console.log('Twitch clip', responseJson))
    .then(responseJson => displayTwitchClip(responseJson))
    .catch(error => $('.twitch-clip-results').empty().append('Something went wrong: ' + error.message));
}

function displayTwitchClip(responseJson) {
    // console.log('from displayTwitchClip', responseJson.data[0].id)
    let clipId = responseJson.data[0].id;
    let results = `
    <h2>Most Popular Twitch Clip:</h2>
    <iframe
    src="https://clips.twitch.tv/embed?clip=${clipId}&autoplay=false"
    height="100%"
    width="100%"
    frameborder="0"
    scrolling="no"
    allowfullscreen="true">
    </iframe>`;
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
                fetchUserReviews(response);
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

function fetchUserReviews(response) {
    let gameId = response.results[0].id.toString();

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `https://www.giantbomb.com/api/user_reviews/?format=jsonp&api_key=${apiGiantBomb}&filter=game:3030-${gameId}&limit=5`,
        success: function(response) {
            // console.log(response);
            renderUserReviews(response);
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
        <h3 class="game-reviews">Reviews</h3>
        <p><b>Score:</b> <img src="img/game-stars-${response.results[0].score}.png" alt="${response.results[0].score} out of 5 stars"></p>
        <p>${response.results[0].deck} <a href="${response.results[0].site_detail_url}" target="_blank">Read More</a></p>
    `);
}

function renderUserReviews(response) {
    let userRevs = [];
    for (let i = 0; i < 5; i++) {
        userRevs.push(`<p><img src="img/game-stars-${response.results[i].score}.png" alt="${response.results[i].score} out of 5 stars"> <b>${response.results[i].deck}</b> <a href="${response.results[i].site_detail_url}" target="_blank">Read More</a></p>`);
    }
    $('.user-reviews').html(userRevs.join(''));
}

function displayErrorMessage() {
    $('.giantbomb-info').html(`
        <p>Error: Game does not exist!</p>
    `);
}

function displayNoReviews() {
    $('.giantbomb-review').html(`
        <h3 class="game-reviews">Reviews</h3>
    `);
}


$(submitButtonHandler);
