function signup() {
    var email = $('#signup-email').val();
    var password = $('#signup-password').val();

    if (password != $('#signup-confirm-password').val()) {
        swal('Warning', 'Passwords do not match.', 'warning');
        return;
    }

    axios.post('/sign_up', {
        email: email,
        password: password
    })
        .then(function (response) {
            switch (String(response.data)) {
                case '1':
                    window.location.replace('/installations');
                    break;
                case '-1':
                    swal('Error', 'Email already used.', 'error');
                    break;
                case '-2':
                    swal('Error', 'Account creation failed.', 'error');
                    break;
                case '-3':
                    swal('Error', 'Account verification failed.', 'error');
                    break;
            }
        })
        .catch(function (error) {
            swal('Error', 'Connection failed.', 'error');
        });
}

function signin() {
    var email = $('#signin-email').val();
    var password = $('#signin-password').val();

    axios.post('/sign_in', {
        email: email,
        password: password
    })
        .then(function (response) {
            console.log(response);
            switch (String(response.data)) {
                case '1':
                    window.location.replace('/installations');
                    break;
                case '-1':
                    swal('Error', 'Email / Password invalid', 'error');
                    break;
                case '-2':
                    swal('Error', 'Account verification failed', 'error');
                    break;
            }
        })
        .catch(function (error) {
            swal('Error', 'Connection failed.', 'error');
        });
}