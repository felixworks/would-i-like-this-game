'use strict';

const apiGiantBomb = `fec6b7750ced7ec24e9ff54a9b2aeea2b573d5a8`;

function submitButtonHandler() {
    $('.game-form').on('submit', function() {
        event.preventDefault();
        handleGameSearch();
    });
}

function handleGameSearch() {
    let gameTitle = $('#game-search').val().trim().toLowerCase();
    $('#game-search').val('');
    displayGameInfo(gameTitle);
    // FELIX: call your Twitch API function here?
}

function displayGameInfo(gameTitle) {
    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `http://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiGiantBomb}&query=${gameTitle}`,
        success: function(response) {
            // console.log('game info: ', response.results);
            renderGameInfo(response);
            listGamePlatforms(response);
            displayGameReviews(response);
        }
    });
}

function displayGameReviews(response) {
    let gameId = response.results[0].id.toString();

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `http://www.giantbomb.com/api/reviews/?format=jsonp&api_key=${apiGiantBomb}&filter=game:${gameId}&limit=5`,
        success: function(response) {
            renderGameReviews(response);
        }
    });
}

function renderGameInfo(response) {
    $('.giantbomb-info').html(`
        <img class="game-thumbnail" src="${response.results[0].image.thumb_url}" alt="${response.results[0].name} thumbnail">
        <h2 class="game-title">${response.results[0].name}</h2>
        <p><b>Platforms:</b> <span class="game-platforms"></span></p>
        <p><b>Description:</b> ${response.results[0].deck} <a href="${response.results[0].site_detail_url}">Read More...</a></p>`
    );
}

function listGamePlatforms(response) {
    let platforms = [];
    for (let i = 0; i < response.results[0].platforms.length; i++) {
        platforms.push(response.results[0].platforms[i].name);
    }
    platforms.join(', ');
    $('.game-platforms').text(platforms);
}

function renderGameReviews(response) {
    $('.giantbomb-review').html(`
    <h3 class="game-reviews">Reviews</h3>
    <p><b>Score:</b> <span class="game-score">${response.results[0].score}</span>/5</p>
    <p><b>Description:</b> ${response.results[0].deck} <a href="${response.results[0].site_detail_url}">Read More...</a></p>`);
}


$(submitButtonHandler);