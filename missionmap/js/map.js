const mapElement = document.getElementById('map');
let mapsApiReady = false;
let mapInitialised = false;

function mapsReadyCallback() {
	log("Google maps API ready");
	mapsApiReady = true;
	initialiseApp();
}

function initMap() {
	if(mapInitialised == false)
	{
		if(mapMethod == 0)
		{
			log("Adding static map");
			mapElement.innerHTML = '<img src="docs/Basic_Park_map.jpg" style="width: 100%;height: 100%;object-fit: contain;">';
		}
		else if(mapMethod == 1)
		{
			log("Adding embedded iframe map");
			//mapElement.innerHTML = '<iframe	width="100%" height="800" frameborder="0" style="border:1px solid black;" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAUNxj5qu6Y2e6mWH-p55IOn9-r6pH_jHk&q=52.383105,-1.661714&center=52.383966,-1.659957&maptype=satellite&zoom=18"></iframe>';
			mapElement.innerHTML = '<iframe width="100%" height="800" frameborder="0" style="border:1px solid black;" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/d/u/0/embed?mid=13XVdQfZTCCKRI16VmRAObNzYQ6pv7_c&ehbc=2E312F&noprof=1"></iframe>';
		}
		else if(mapMethod == 2)
		{
			log("Adding Javascript API map");
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

			// Create the Google Map using our element and options defined above
			var map = new google.maps.Map(mapElement, mapOptions);

			// The mission marker position
			const missionMarkerPosition = { lat: 52.383105, lng: -1.661714 };
			// The marker
			const marker = new google.maps.marker.AdvancedMarkerElement({
				map,
				position: missionMarkerPosition,
				title: 'Objective'
			});
		}
		mapInitialised = true;
	}
	else
	{
		log("Map already initialised", 'error');
	}
}
