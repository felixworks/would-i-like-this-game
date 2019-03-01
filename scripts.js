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
    // fetchIgdb(gameTitle);
    fetchGiantBomb(gameTitle);
    // FELIX: call your Twitch API function here?
}

function fetchGiantBomb(gameTitle) {
    const apiKey = `fec6b7750ced7ec24e9ff54a9b2aeea2b573d5a8`;

    $.ajax ({
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'json_callback',
        url: `http://www.giantbomb.com/api/search/?format=jsonp&api_key=${apiKey}&query=${gameTitle}`,
        complete: function() {
            console.log('done');
        },
        success: function(data) {
            console.log(data);
        }
    });

    // fetch(`https://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query=${gameTitle}`, {mode: 'no-cors'})
    // .then(response => response.json())
    // .then(responseJson => console.log(responseJson));
}

$(submitButtonHandler);