'use strict';

function submitButtonHandler() {
    $('.game-form').on('submit', function() {
        event.preventDefault();
        storeSearchTerm();
        // console.log("Button works");
    });
}

function storeSearchTerm() {
    let game = $('#game-search').val().trim();
    console.log(game);
}

$(submitButtonHandler());