function initMap() {
	// Basic options for a simple Google Map
	// For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
	var mapOptions = {
		mapId: "176317d227790cc97560b870",
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		rotateControl: false,
		// How zoomed in you want the map to start at (always required)
		zoom: 18,

		// The latitude and longitude to center the map (always required)
		center: new google.maps.LatLng(52.383966,-1.659957)
	};

	// Get the HTML DOM element that will contain your map 
	// We are using a div with id="map" seen below in the <body>
	var mapElement = document.getElementById('map');

	// Create the Google Map using our element and options defined above
	var map = new google.maps.Map(mapElement, mapOptions);

	// The mission marker position
	const missionMarkerPosition = { lat: 52.383105, lng: -1.661714 };
	// The marker
	const marker = new google.maps.marker.AdvancedMarkerElement({
		map,
		position: missionMarkerPosition,
		title: 'Objective',
	});
}
