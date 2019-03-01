'use strict';

function submitButtonHandler() {
    $('.game-form').on('submit', function() {
        event.preventDefault();
        handleGameSearch();
        console.log('Button works');
    });
}

function handleGameSearch() {
    let gameTitle = $('#game-search').val().trim().toLowerCase();
    console.log('Searched for: ' + gameTitle);
    $('#game-search').val('');
    fetchIgdb(gameTitle);
    // FELIX: call your Twitch API function here?
}

function fetchIgdb(gameTitle) {
    const options = {
        headers: {
            'user-key': '142f6aed468c4dbcd5e740fd58fc0b12',
            accept: 'json'
        },
        mode: 'no-cors'
    };

    fetch(`https://api-v3.igdb.com/games/?search=bioshock&fields=name,websites.url,genres.name,rating`, options)
    .then(response => response.json())
    .then(responseJson => console.log(responseJson))
    .catch(e => { console.log("Error: ", e); });
}

$(submitButtonHandler());