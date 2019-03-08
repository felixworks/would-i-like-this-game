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
        $('.twitch-clip-results').empty();
        $('.twitch-stream-results').empty();
        handleGameSearch();
    });
}

function createTwitchUrl(input, selectedUrl) {
    let modifiedInput = encodeURIComponent(input);
    let requestUrl = selectedUrl + modifiedInput;
    console.log('requestUrl', requestUrl);
    return requestUrl;
}

function generateTwitchStream(userInput) {
    fetch(createTwitchUrl(userInput, twitchIdUrl), options)
    .then(response => {
        if (response.ok) {
            console.log(response);
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        if (responseJson.data.length > 0) {
            return responseJson.data[0].id;
        }
        console.log('no results response', responseJson);
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
    // .then(responseJson => console.log('Twitch clip', responseJson))
    .then(responseJson => displayTwitchStream(responseJson))
    .catch(error => $('.twitch-stream-results').empty().append('<h2>Most Popular Twitch Streams:</h2> ' + error.message));
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
        console.log('no results response', responseJson);
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
    .catch(error => $('.twitch-clip-results').empty().append('<h2>Most Popular Twitch Clip:</h2> ' + error.message));
}

function displayTwitchStream(responseJson) {
    let userNames = [responseJson.data[0].user_name, responseJson.data[1].user_name, responseJson.data[2].user_name];
    let results = [`<h2>Most Popular Twitch Streams:</h2>`]
    userNames.map(userName => {
        results.push(`
        <iframe
        src="https://player.twitch.tv/?channel=${userName}&autoplay=false"
        height="100%"
        width="100%"
        frameborder="0"
        scrolling="no"
        allowfullscreen="true">
        </iframe>`)
    })
    $('.twitch-stream-results').append(results);
}

function displayTwitchClip(responseJson) {
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
        url: `https://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiGiantBomb}&query=${gameTitle}`,
        success: function(response) {
            if (response.results.length > 0) {
                renderGameInfo(response);
                listGamePlatforms(response);
                displayGameReviews(response);
                // We are calling generateTwitchClip() here in order to feed the Twitch API with Giantbomb's somewhat smarter search results. The ternary operator is a hack to make Red Dead Redemption 2 pull from Twitch correctly.
                generateTwitchStream(response.results[0].name);
                generateTwitchClip((response.results[0].name === "Red Dead Redemption II") ? "Red Dead Redemption 2" : response.results[0].name);
            } else {
                displayErrorMessage();
                $('.giantbomb-review').empty();
            }
        }
    });
}

// rename displayGameReviews -- not actually displaying anything
function displayGameReviews(response) {
    let gameId = response.results[0].id.toString();

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `https://www.giantbomb.com/api/reviews/?format=jsonp&api_key=${apiGiantBomb}&filter=game:${gameId}&limit=5`,
        success: function(response) {
            if (response.results.length > 0) {
                renderGameReviews(response);
            } else {
                displayNoReviews();
            }
        }
    });
}

function renderGameInfo(response) {
    $('.giantbomb-info').html(`
    <img class="game-thumbnail" src="${response.results[0].image.thumb_url}" alt="${response.results[0].name} thumbnail">
    <h2 class="game-title">${response.results[0].name}</h2>
    <p><b>Platforms:</b> <span class="game-platforms"></span></p>
    <p><b>Description:</b> ${response.results[0].deck} <a href="${response.results[0].site_detail_url}" target="_blank">Read More...</a></p>`);
}

function listGamePlatforms(response) {
    let platforms = [];
    for (let i = 0; i < response.results[0].platforms.length; i++) {
        platforms.push(response.results[0].platforms[i].name);
    }
    $('.game-platforms').text(platforms.join(', '));
}

function renderGameReviews(response) {
    $('.giantbomb-review').html(`
    <h3 class="game-reviews">Reviews</h3>
    <p><b>Score:</b> <span class="game-score">${response.results[0].score}</span>/5</p>
    <p>${response.results[0].deck} <a href="${response.results[0].site_detail_url}" target="_blank">Read More...</a></p>`);
}

function displayErrorMessage() {
    $('.giantbomb-info').html(`<p>Error: Game does not exist.</p>`);
}

function displayNoReviews() {
    $('.giantbomb-review').html(`<p>No reviews for this game exist.</p>`);
}


$(submitButtonHandler);
