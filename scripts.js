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

    fetch(`http://www.giantbomb.com/api/search/?api_key=${apiKey}&format=jsonp&json_callback=jsonp&query=${gameTitle}`, {mode: 'no-cors'})
    .then(response => response.json())
    .then(responseJson => console.log(responseJson))
    // .then(data => console.log(JSON.stringify(data)))
    .catch(error => console.log(`ERROR: ${error}`));

    // Looks like I need json_callback to = a callback function?




    // AJAX IS NOT ALLOWED (MUST USE FETCH) BUT THIS WORKS

    // $.ajax ({
    //     type: 'GET',
    //     dataType: 'jsonp',
    //     crossDomain: true,
    //     jsonp: 'json_callback',
    //     url: `http://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiKey}&query=${gameTitle}`,
    //     // complete: function() {
    //     //     console.log('done');
    //     // },
    //     success: function(response) {
    //         console.log(response.results[0]);
    //         $('.giantbomb-results').html(`
    //         <h2>${response.results[0].name}</h2>
    //         <img src="${response.results[0].image.thumb_url}" alt="${gameTitle} thumbnail">
    //         <p>${response.results[0].deck}</p>
    //         `);
    //     }
    // });

}

$(submitButtonHandler);