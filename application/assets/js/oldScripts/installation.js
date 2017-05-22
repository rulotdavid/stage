function removeLocation(idLocation) {
    swal({
        title: "Are you sure?",
        text: "Your will not be able to recover this installation.",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    },
        function () {
            axios.post('/installation/delete', {
                idLocation: idLocation
            }).then(function (response) {
                switch (String(response.data)) {
                    case '1':
                        $('#trLocation' + idLocation).remove();
                        swal('Deleted!', 'Your installation has been deleted.', 'success');
                        break;
                    case '-1':
                        swal('Error', 'Your installation has not been deleted.', 'error');
                        break;
                }
            }).catch(function (error) {
                swal('Error', 'Your installation has not been deleted.', 'error');
            });
        });
}

function compareLoading() {
    $('#myPleaseWait').modal('show');
}