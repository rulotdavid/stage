var googleMap = undefined;

function initAutocomplete() {
    googleMap = new google.maps.Map(document.getElementById('googleMap'), {
        center: { lat: 0, lng: 0 },
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

$(document).ready(function () {
    while (true) {
        if (googleMap == undefined) {
            initAutocomplete();
            sleep(250);
        }
        else {
            break;
        }
    }

    updateInstallation(currentInstallation.installation);
    updateEquipment(currentInstallation.equipmentList);
    updateLocation(currentInstallation.location);
});

function updateLocation(currentLocation) {
    var infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(googleMap);
    service.getDetails({
        placeId: currentLocation.google_place_id
    },
        function (place, status) {
            var marker = new google.maps.Marker({
                map: googleMap,
                position: place.geometry.location
            });
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(currentLocation.route + ' ' + currentLocation.street_number + ', ' + currentLocation.postal_code + ' ' + currentLocation.locality + ', ' + currentLocation.country);
                infowindow.open(googleMap, this);
            });

        });

    googleMap.setZoom(14);
    googleMap.setCenter(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));
}

function updateInstallation(currentInstallation) {
    $('#installation-production').val(currentInstallation.production);
    $('#installation-inverter-efficiency').val(currentInstallation.inverter_efficiency);
}

function updateEquipment(currentEquipment) {
    currentEquipment.forEach(function (equipment) {
        $('#table-equipment tbody').append(
            '<tr id="trEquipment' + equipment.id + '">' +
            '<td>' + equipment.technologyId + '</td>' + //technologyId => technologyText type
            '<td>' + equipment.nominal_power + '</td>' +
            '<td>' + equipment.slope + '</td>' +
            '<td>' + equipment.azimuth + '</td>' +
            '</tr>');
    });
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}