'use strict';

function submitButtonHandler() {
    $('.game-form').on('submit', function(event) {
        event.preventDefault();
        console.log("Button works");
        let userInput = $('input.game-search').val();
        // console.log(userInput);
        generateTwitchRequest(userInput);
        $('input.game-search').empty();
    });
}

function createTwitchUrl(userInput) {
    let modifiedUserInput = encodeURIComponent(userInput);
    let requestUrl = `https://api.twitch.tv/helix/games?name=${modifiedUserInput}`;
    // console.log(requestUrl);
    return requestUrl;
}

function generateTwitchRequest(userInput) {
    const options = {
        headers: {
            'Client-id': 'lzvscy091kgp5i7muvi8xhpd9uo5dc'
        }
    };
    fetch(createTwitchUrl(userInput), options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusTest);
    })
    .then(responseJson => displayTwitchResults(responseJson))
    .catch(error => $('.twitch-results').empty().append('Something went wrong: ' + error.message));
}

function displayTwitchResults(responseJson) {
    $('.twitch-results').empty();
    // returns game id - plug this into another fetch request that calls "GET https://api.twitch.tv/helix/clips" Also figure out whether you can string two fetch requests together. Or how that should work.
    console.log(responseJson.data[0].id);
    let twitchInformation = responseJson.data[0].id;
    let results = `
    <iframe
    src="${twitchInformation}"
    height="360"
    width="640"
    frameborder="0"
    scrolling="no"
    allowfullscreen="true">
    </iframe>`;
    // console.log(results);
    $('.twitch-results').append(results);
}
$(submitButtonHandler());