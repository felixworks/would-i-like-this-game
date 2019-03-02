'use strict';

function submitButtonHandler() {
    $('.game-form').on('submit', function(event) {
        event.preventDefault();
        console.log("Button works");
        let userInput = $('input.game-search').val();
        // console.log(userInput);
        $('input.game-search').val('');
        $('.twitch-clip-results').empty();
        generateTwitchRequest(userInput);
        
    });
}

function createTwitchIdUrl(userInput) {
    let modifiedUserInput = encodeURIComponent(userInput);
    let requestUrl = `https://api.twitch.tv/helix/games?name=${modifiedUserInput}`;
    console.log('idRequestUrl', requestUrl);
    return requestUrl;
}

function createTwitchClipUrl(response) {
    let modifiedResponse = encodeURIComponent(response);
    let requestUrl = `https://api.twitch.tv/helix/clips?game_id=${modifiedResponse}`;
    console.log('clip request URL', requestUrl);
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
        console.log(responseJson.data.length);
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
    console.log('from displayTwitchClip', responseJson.data[0].id)
    let clipId = responseJson.data[0].id;
    let results = `
    <iframe
    src="https://clips.twitch.tv/embed?clip=${clipId}&autoplay=false"
    height="360"
    width="640"
    frameborder="0"
    scrolling="no"
    allowfullscreen="true">
    </iframe>`;
    // console.log(results);
    $('.twitch-clip-results').append(results);
}
$(submitButtonHandler());