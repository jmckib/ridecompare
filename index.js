var input_start = document.getElementById('input-start');
var input_dest = document.getElementById('input-dest');

var start = null;
var dest = null;
var $result = $('#result');
var $lyft_result = $('#lyft-result');
var $uber_result = $('#uber-result');

var directions_service = new google.maps.DirectionsService;
var directionsDisplay = new google.maps.DirectionsRenderer;
var map = new google.maps.Map(document.getElementById('map'), {
	zoom: 7,
	center: {lat: 41.85, lng: -87.65}
});
directionsDisplay.setMap(map);

function get_lyft_cost(minutes, miles) {
	return (1.75 + Math.max(6, .90 + .12 * minutes + .78 * miles)).toFixed(2);
}

function get_uber_cost(minutes, miles) {
	return Math.max(6.75, 1 + .12 * minutes + .75 * miles + 1.75).toFixed(2);
}

function get_directions() {
	if (!start || !dest) {
		return;
	}

	directions_service.route({
		origin: {'placeId': start.place_id},
		destination: {'placeId': dest.place_id},
		travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {
		if (status === google.maps.DirectionsStatus.OK) {
			var directions = response.routes[0].legs[0];
			var minutes = directions.duration.value / 60.0;  // value in seconds
			var miles = directions.distance.value / 1609.34;  // value in meters

			var lyft_cost = get_lyft_cost(minutes, miles);
			var uber_cost = get_uber_cost(minutes, miles);

			var winner = '';
			var lyft_string = "Lyft Standard";
			var uber_string = "UberX";
			if (lyft_cost < uber_cost) {
				winner = lyft_string;
			} else if (uber_cost < lyft_cost) {
				winner = uber_string;
			}
			var result = "<strong><mark>" + winner + "</strong></mark> is cheaper by $" + Math.abs(lyft_cost - uber_cost).toFixed(2);

			if (uber_cost == lyft_cost) {
				result = "It's a tie!"
			}
			$result.html(result);

			$lyft_result.html(lyft_string + ": $" + lyft_cost);
			$uber_result.html(uber_string + ": $" + uber_cost);

			directionsDisplay.setDirections(response);
			$('#map-container').show();
			google.maps.event.trigger(map, 'resize');
		} else {
			window.alert('Directions request failed due to ' + status);
		}
	});
}

var autocomplete_start = new google.maps.places.Autocomplete(input_start);
autocomplete_start.addListener('place_changed', function() {
	start = autocomplete_start.getPlace();
	get_directions();
});

var autocomplete_dest = new google.maps.places.Autocomplete(input_dest);
autocomplete_dest.addListener('place_changed', function() {
	dest = autocomplete_dest.getPlace();
	get_directions();
});

