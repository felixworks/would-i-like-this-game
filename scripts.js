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
    // displayGameReviews(gameTitle);
    // FELIX: call your Twitch API function here?
}

function displayGameInfo(gameTitle) {
    // AJAX IS NOT ALLOWED (MUST USE FETCH) BUT THIS WORKS
    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `http://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiGiantBomb}&query=${gameTitle}`,
        success: function(response) {
            console.log('game info: ', response.results);
            renderGameInfo(response);
            listGamePlatforms(response);
            displayGameReviews(response);
        }
    });
}

function displayGameReviews(response) {
    let guid = response.results[0].guid;

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `http://www.giantbomb.com/api/review/${guid}/?format=jsonp&api_key=${apiGiantBomb}&limit=5`,
        success: function(response) {
            console.log('game reviews: ', response.results, 'game guid: ', guid);
            $('.giantbomb-results').append(`
            <h3>Reviews</h3>
            <p>insert reviews here</p>`);
        }
    });
}

function renderGameInfo(response) {
    $('.giantbomb-results').html(`
        <img src="${response.results[0].image.thumb_url}" alt="${response.results[0].name} thumbnail">
        <h2>${response.results[0].name}</h2>
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


$(submitButtonHandler);