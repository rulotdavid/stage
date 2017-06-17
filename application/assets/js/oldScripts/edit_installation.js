var isTipTechnolgyDisplayed = false;
var isTipNominalPowerDisplayed = false;
var isTipSlopeDisplayed = false;
var isTipAzimuthDisplayed = false;
var isTipProductionDisplayed = false;
var isTipInverterEfficiencyDisplayed = false;

var address = {};
var installation = {};
var mapEquipment = new Map();

var googleMap = undefined;
var isCreation = true;
var countEquipment = 0;

function refreshModalCreateEquipment() {
  $('#form-equipment').attr('action', 'javascript:createEquipment();');

  $('#equipment-nominal-power').val('');
  $('#equipment-slope').val('');
  $('#equipment-azimuth').val('');
}

function refreshModalEditEquipment(id) {
  $('#form-equipment').attr('action', 'javascript:editEquipment(' + id + ');');

  $('#equipment-nominal-power').val(mapEquipment.get(id).nominal_power);
  $('#equipment-slope').val(mapEquipment.get(id).slope);
  $('#equipment-azimuth').val(mapEquipment.get(id).azimuth);
}

function createEquipment() {
  var equipment = {
    technologyId: $('#select-currentTechnologies').val(),
    nominal_power: $('#equipment-nominal-power').val(),
    slope: $('#equipment-slope').val(),
    azimuth: $('#equipment-azimuth').val()
  };

  var id = countEquipment++;
  mapEquipment.set(id, equipment);

  var technologyText;
  currentTechnologies.forEach(function (technology) {
    if (technology.id == $("#select-currentTechnologies").val()) {
      technologyText = technology.type;
    }
  });

  $('#table-equipment tbody').append(
    '<tr id="trEquipment' + id + '">' +
    '<td>' + technologyText + '</td>' +
    '<td>' + equipment.nominal_power + '</td>' +
    '<td>' + equipment.slope + '</td>' +
    '<td>' + equipment.azimuth + '</td>' +
    '<td><button onclick="refreshModalEditEquipment(' + id + ');" type="button" class="btn btn-link btn-xs" style="border-color: black;" data-toggle="modal" data-target="#modal-equipment">Edit</button></td>' +
    '<td><button onclick="deleteEquipment(' + id + ');" type="button" class="btn btn-link btn-xs" style="border-color: black;">Remove</button></td>' +
    '</tr>');

  $('#modal-equipment').modal('hide');
  $('#btAddEquipment').hide();
}

function editEquipment(id) {
  mapEquipment.get(id).technologyId = $('#select-currentTechnologies').val();
  mapEquipment.get(id).nominal_power = $('#equipment-nominal-power').val();
  mapEquipment.get(id).slope = $('#equipment-slope').val();
  mapEquipment.get(id).azimuth = $('#equipment-azimuth').val();

  var technologyText;
  currentTechnologies.forEach(function (technology) {
    if (technology.id == mapEquipment.get(id).technologyId) {
      technologyText = technology.type;
    }
  });

  var cells = $('#trEquipment' + id + ' td');
  cells.eq(0).html(technologyText);
  cells.eq(1).html(mapEquipment.get(id).nominal_power);
  cells.eq(2).html(mapEquipment.get(id).slope);
  cells.eq(3).html(mapEquipment.get(id).azimuth);

  $('#modal-equipment').modal('hide');
}

function deleteEquipment(id) {
  swal({
    title: "Are you sure?",
    text: "Your will not be able to recover this equipment.",
    type: "warning",
    showCancelButton: true,
    confirmButtonClass: "btn-danger",
    confirmButtonText: "Yes, delete it!",
    closeOnConfirm: false
  },
    function () {
      $('#trEquipment' + id).remove();
      mapEquipment.delete(id);
      swal('Deleted!', 'Your equipment has been deleted.', 'success');
      $('#btAddEquipment').show();
    });
}

function save() {
  try {
    check_input();

    var equipmentList = [];
    mapEquipment.forEach(function (equipment) {
      equipmentList.push(equipment);
    });

    installation.production = $('#installation-production').val();
    installation.inverter_efficiency = $('#installation-inverter-efficiency').val();

    axios.post('/save', {
      isCreation: isCreation,
      address: address,
      installation: installation,
      equipmentList: equipmentList
    }).then(function (response) {
      switch (String(response.data)) {
        case '1':
          window.location.replace('/installations');
          break;
        case '-1':
          swal('Error', 'Addresse already used', 'error');
          break;
        case '-2':
          swal('Error', 'Creation location failed', 'error');
          break;
        case '-3':
          swal('Error', 'Creation installation failed', 'error');
          break;
        case '-4':
          swal('Error', 'Creation equipment failed', 'error');
          break;
        case '-5':
          swal('Error', 'Verfication location failed', 'error');
          break;
        case '-6':
          swal('Error', 'Update failed', 'error');
          break;
      }
    }).catch(function (error) {
      swal('Error', error, 'error');
    });
  }
  catch (e) {
    swal('Warning', e, 'warning');
    return;
  }
}

function check_input() {
  if (address.google_place_id == undefined) {
    throw 'Location is missing';
  }
  else {
    if (address.street_number == undefined || address.street_number == null) {
      throw 'Location is not complete';
    }
  }

  if (mapEquipment.size == 0) {
    throw 'Equipment is missing';
  }

  if ($('#installation-production').val().length == 0) {
    throw 'Production is missing';
  }

  if ($('#installation-production').val() < 0) {
    throw 'Production is not correct';
  }

  if ($('#installation-inverter-efficiency').val().length == 0) {
    throw 'Inverter efficiency is missing';
  }

  if ($('#installation-inverter-efficiency').val() < 0 || $('#installation-inverter-efficiency').val() > 100) {
    throw 'Inverter efficiency is not correct';
  }
}

function initAutocomplete() {
  googleMap = new google.maps.Map(document.getElementById('googleMap'), {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);

  googleMap.addListener('bounds_changed', function () {
    searchBox.setBounds(googleMap.getBounds());
  });

  var markers = [];
  searchBox.addListener('places_changed', function () {
    var bounds = new google.maps.LatLngBounds();
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    places.forEach(function (place) {
      address.google_place_id = place.place_id;
      address.lat = place.geometry.location.lat();
      address.lng = place.geometry.location.lng();
      setComponents(place.address_components);

      var infowindow = new google.maps.InfoWindow({
        content: place.formatted_address
      });

      var marker = new google.maps.Marker({
        map: googleMap,
        position: place.geometry.location
      });

      marker.addListener('click', function () {
        infowindow.open(googleMap, marker);
      });

      markers.push(marker);

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });

    googleMap.fitBounds(bounds);
  });
}

$(document).ready(function () {
  updateTechnologies();

  if (currentInstallation != null) {
    isCreation = false;
    updateInstallation(currentInstallation.installation);
    updateEquipment(currentInstallation.equipmentList);
  }

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
          if (currentInstallation != null) {
            updateLocation(currentInstallation.location);
          }
          break;
        }
      }
    }
  }
});

function updateLocation(currentLocation) {
  address = {
    id: currentLocation.id,
    google_place_id: currentLocation.google_place_id,
    lat: currentLocation.lat,
    lng: currentLocation.lng,
    street_number: currentLocation.street_number,
    route: currentLocation.route,
    locality: currentLocation.locality,
    postal_code: currentLocation.postal_code,
    country: currentLocation.country
  };

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
        infowindow.setContent(address.route + ' ' + address.street_number + ', ' + address.postal_code + ' ' + address.locality + ', ' + address.country);
        infowindow.open(googleMap, this);
      });

    });

  googleMap.setZoom(15);
  googleMap.setCenter(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));
}

function updateInstallation(currentInstallation) {
  installation.id = currentInstallation.id;
  $('#installation-production').val(currentInstallation.production);
  $('#installation-inverter-efficiency').val(currentInstallation.inverter_efficiency);
}

function updateEquipment(currentEquipment) {
  $('#btAddEquipment').hide();

  currentEquipment.forEach(function (equipment) {
    if (equipment.id > countEquipment) {
      countEquipment = equipment.id;
    }
    countEquipment++;

    mapEquipment.set(equipment.id, {
      id: equipment.id,
      technologyId: equipment.technologyId,
      nominal_power: equipment.nominal_power,
      slope: equipment.slope,
      azimuth: equipment.azimuth
    });

    var technologyText;
    currentTechnologies.forEach(function (technology) {
      if (technology.id == equipment.technologyId) {
        technologyText = technology.type;
        $("#select-currentTechnologies").val(technology.id);
      }
    });

    $('#table-equipment tbody').append(
      '<tr id="trEquipment' + equipment.id + '">' +
      '<td>' + technologyText + '</td>' +
      '<td>' + equipment.nominal_power + '</td>' +
      '<td>' + equipment.slope + '</td>' +
      '<td>' + equipment.azimuth + '</td>' +
      '<td><button onclick="refreshModalEditEquipment(' + equipment.id + ');" type="button" class="btn btn-link btn-xs" style="border-color: black;" data-toggle="modal" data-target="#modal-equipment">Edit</button></td>' +
      '<td><button onclick="deleteEquipment(' + equipment.id + ');" type="button" class="btn btn-link btn-xs" style="border-color: black;">Remove</button></td>' +
      '</tr>');
  });
}

function setComponents(address_components) {
  var street_number = null;
  var route = null;
  var locality = null;
  var postal_code = null;
  var country = null;

  address_components.forEach(function (item) {
    item.types.forEach(function (type) {
      switch (type) {
        case 'street_number':
          street_number = item.long_name;
          break;
        case 'route':
          route = item.long_name;
          break;
        case 'locality':
          locality = item.long_name;
          break;
        case 'postal_code':
          postal_code = item.long_name;
          break;
        case 'country':
          country = item.long_name;
          break;
      }
    });
  });

  address.street_number = street_number;
  address.route = route;
  address.locality = locality;
  address.postal_code = postal_code;
  address.country = country;
}

function updateTechnologies() {
  currentTechnologies.forEach(function (technology) {
    $('#select-currentTechnologies').append($('<option>', {
      value: technology.id,
      text: technology.type
    }));
  });
}

function showTipTechnology() {
  if (isTipTechnolgyDisplayed == false) {
    isTipTechnolgyDisplayed = true;
    $('#tipTechnology').show();
  }
  else {
    isTipTechnolgyDisplayed = false;
    $('#tipTechnology').hide();
  }
}

function showTipNominalPower() {
  if (isTipNominalPowerDisplayed == false) {
    isTipNominalPowerDisplayed = true;
    $('#tipNominalPower').show();
  }
  else {
    isTipNominalPowerDisplayed = false;
    $('#tipNominalPower').hide();
  }
}

function showTipSlope() {
  if (isTipSlopeDisplayed == false) {
    isTipSlopeDisplayed = true;
    $('#tipSlope').show();
  }
  else {
    isTipSlopeDisplayed = false;
    $('#tipSlope').hide();
  }
}

function showTipAzimuth() {
  if (isTipAzimuthDisplayed == false) {
    isTipAzimuthDisplayed = true;
    $('#tipAzimuth').show();
  }
  else {
    isTipAzimuthDisplayed = false;
    $('#tipAzimuth').hide();
  }
}

function showTipProduction() {
  if (isTipProductionDisplayed == false) {
    isTipProductionDisplayed = true;
    $('#tipProduction').show();
  }
  else {
    isTipProductionDisplayed = false;
    $('#tipProduction').hide();
  }
}

function showTipInverterEfficiency() {
  if (isTipInverterEfficiencyDisplayed == false) {
    isTipInverterEfficiencyDisplayed = true;
    $('#tipInverterEffeciency').show();
  }
  else {
    isTipInverterEfficiencyDisplayed = false;
    $('#tipInverterEffeciency').hide();
  }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}