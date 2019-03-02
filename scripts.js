'use strict';

function submitButtonHandler() {
    $('.game-form').on('submit', function() {
        event.preventDefault();
        handleGameSearch();
    });
}

function handleGameSearch() {
    let gameTitle = $('#game-search').val().trim().toLowerCase();
    $('#game-search').val('');
    fetchGiantBomb(gameTitle);
    // FELIX: call your Twitch API function here?
}

function fetchGiantBomb(gameTitle) {
    const apiKey = `fec6b7750ced7ec24e9ff54a9b2aeea2b573d5a8`;

    // fetch(`http://www.giantbomb.com/api/search/?api_key=${apiKey}&format=jsonp&json_callback=displayResults&query=${gameTitle}`, {mode: 'no-cors'})
    // // .then(response => response.text())
    // .then(responseJson => displayResults(responseJson))
    // .catch(error => console.log(`${error}`));
    

    // need json_callback to = a callback function?
    // getting an empty object in response to fetch request - that's why response.json() isn't working and it messes up everything else




    // AJAX IS NOT ALLOWED (MUST USE FETCH) BUT THIS WORKS

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `http://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiKey}&query=${gameTitle}`,
        success: function(response) {
            console.log('game info: ', response.results);
            $('.giantbomb-results').html(`
                <h2>${response.results[0].name}</h2>
                <img src="${response.results[0].image.thumb_url}" alt="${gameTitle} thumbnail">
                <p>${response.results[0].deck} <a href="${response.results[0].site_detail_url}">Read More...</a></p>
            `);
        }
    });
}

$(submitButtonHandler);