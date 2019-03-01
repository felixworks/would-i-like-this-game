'use strict';

const igdbKey = '8b9e048aae57e52cf42765a9d130c173';

function submitButtonHandler() {
    $('.game-form').on('submit', function() {
        event.preventDefault();
        handleGameSearch();
        console.log('Button works');
    });
}

function handleGameSearch() {
    let gameTitle = $('#game-search').val().trim().toLowerCase();
    console.log('Searched for: '+ gameTitle);
    $('#game-search').val('');
    fetchIgdb(gameTitle);
    // FELIX: call your Twitch API function here?
}

function fetchIgdb(gameTitle) {
    fetch(`https://api-v3.igdb.com/?user-key=${igdbKey}&fields=name,websites.url,genres.name,rating&search=${gameTitle}`)
    .then(response => response.json())
    .then(responseJson => console.log(responseJson));
}

$(submitButtonHandler());