'use strict';

function submitButtonHandler() {
    $('.game-form').on('submit', function() {
        event.preventDefault();
        console.log("Button works");
    });
}

$(submitButtonHandler());