var googleMap = undefined;

function initAutocomplete() {
    googleMap = new google.maps.Map(document.getElementById('googleMap'), {
        center: { lat: 0, lng: 0 },
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

$(document).ready(function () {
    updateAverages();
    updateLocalAverages();
    updateInstallation(currentInstallation.installation);
    updateEquipment(currentInstallation.equipmentList);

    var nbSleep = 0;
    while (true) {
        console.log('WAIT GOOGLE');
        nbSleep++;
        if (nbSleep == 20) {
            break;
        }
        else {
            if (typeof google == 'undefined') {
                sleep(250);
            }
            else {
                if (typeof googleMap == 'undefined') {
                    initAutocomplete();
                    sleep(250);
                }
                else {
                    $('#errorLoadGM').hide();
                    updateInfluences();
                    updateLocation(currentInstallation.location);
                    break;
                }
            }
        }
    }
});

function updateInfluences() {
    var tab = [];
    tab.push({ 'pourcentage': locationInfluence, 'target': 'location' });
    tab.push({ 'pourcentage': inverterInfluence, 'target': 'inverter' });
    tab.push({ 'pourcentage': technologyInfluence, 'target': 'technology' });
    tab.push({ 'pourcentage': npInfluence, 'target': 'np' });
    tab.push({ 'pourcentage': slopeInfluence, 'target': 'slope' });
    tab.push({ 'pourcentage': azimuthInfluence, 'target': 'azimuth' });

    tab.sort(function (a, b) {
        return b.pourcentage - a.pourcentage;
    });

    tab.forEach(function (item) {
        switch (item.target) {
            case 'location': $('#divInfluences').append('<b>Location</b> = ' + locationInfluence + ' %</br>');
                break;
            case 'inverter': $('#divInfluences').append('<b>Inverter efficiency</b> = ' + inverterInfluence + ' %</br>');
                break;
            case 'technology': $('#divInfluences').append('<b>Technology</b> = ' + technologyInfluence + ' %</br>');
                break;
            case 'np': $('#divInfluences').append('<b>Nominal power</b> = ' + npInfluence + ' %</br>');
                break;
            case 'slope': $('#divInfluences').append('<b>Slope</b> = ' + slopeInfluence + ' %</br>');
                break;
            case 'azimuth': $('#divInfluences').append('<b>Azimuth</b> = ' + azimuthInfluence + ' %</br>');
                break;
        }
    });
}

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

function updateAverages() {
    $('#table-averages tbody').append(
        '<td>' + averages[0] + '</td>' +
        '<td>' + averages[1] + '</td>' +
        '<td>' + averages[2] + '</td>' +
        '<td>' + averages[3] + '</td>' +
        '</tr>');
}

function updateLocalAverages() {
    if (local_averages.length == 0) {
        $('#table-local-averages tbody').append(
            '<td>No Data</td>' +
            '<td>No Data</td>' +
            '<td>No Data</td>' +
            '<td>No Data</td>' +
            '</tr>');
    }
    else {
        $('#table-local-averages tbody').append(
            '<td>' + local_averages[0] + '</td>' +
            '<td>' + local_averages[1] + '</td>' +
            '<td>' + local_averages[2] + '</td>' +
            '<td>' + local_averages[3] + '</td>' +
            '</tr>');
    }
}