$(document).ready(function () {
    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        const username = $('#username').val().trim();
        const password = $('#password').val().trim();

        if (username === '' || password === '') {
            $('#login-error').text('Username and password are required.').show();
            return;
        }

        $.ajax({
            url: '/Account/Login',
            method: 'POST',
            data: { username: username, password: password },
            success: function (response) {
                if (response.success) {
                    window.location.href = response.redirectUrl;
                } else {
                    $('#login-error').text(response.message).show();
                }
            },
            error: function (xhr, status, error) {
                $('#login-error').text('An error occurred. Please try again later.').show();
            }
        });
    });
});
