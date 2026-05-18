const mapElement = document.getElementById('map');
var map;
let mapsApiReady = false;
let mapInitialised = false;
let grangeCentre;

function mapsReadyCallback() {
	log("Google maps API ready");
	mapsApiReady = true;
	initialiseApp();
}

async function initMap() {
	if(mapInitialised == false)
	{
		const [{ InfoWindow }, { AdvancedMarkerElement, PinElement }] =
			await Promise.all([
				google.maps.importLibrary('maps'),
				google.maps.importLibrary('marker'),
			]);
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
			grangeCentre = new google.maps.LatLng(52.383966,-1.659957);	//Use this to centre the Grange when not following
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
				center: grangeCentre //new google.maps.LatLng(52.383966,-1.659957)
			};

			// Get the HTML DOM element that will contain your map 
			// We are using a div with id="map" seen below in the <body>

			// Create the Google Map using our element and options defined above
			map = new google.maps.Map(mapElement, mapOptions);
			
			//Marker positions

			const markers = [
				{
					position: { lat: 52.38469, lng: -1.66174 },
					title: 'Park Ranger Office',
				},
				{
					position: { lat: 52.38469, lng: -1.66174 },
					title: 'Derelict Tin Mine',
				},
				{
					position: { lat: 52.38398, lng: -1.65998 },
					title: 'Derelict Gold Mining Town',
				},
				{
					position: { lat: 52.38387, lng: -1.65899 },
					title: 'Derelict Gold Mine',
				},
				{
					position: { lat: 52.38294, lng: -1.6593 },
					title: "Hunters' Lodges",
				},
			];

			// Create an info window to share between markers.
			const infoWindow = new InfoWindow();

			// Create the markers.
			markers.forEach(({ position, title }, i) => {
				const pin = new PinElement({
					glyphText: `${i + 1}`,
					scale: 1.5,
				});
				const marker = new AdvancedMarkerElement({
					position,
					title: `${i + 1}. ${title}`,
					gmpClickable: true,
				});
				marker.append(pin);
				mapElement.append(marker);
				// Add a click listener for each marker, and set up the info window.
				marker.addEventListener('gmp-click', () => {
					infoWindow.close();
					infoWindow.setContent(marker.title);
					infoWindow.open(marker.map, marker);
				});
			});			

			/*
			// The mission marker position
			//const missionMarkerPosition = { lat: 52.383105, lng: -1.661714 };
			// The marker
			//const marker = new google.maps.marker.AdvancedMarkerElement({map,position: missionMarkerPosition,title: 'Objective'});
			//Shared Info window
			const infoWindow = new InfoWindow();
			//Park Ranger Office
			const parkRangerOfficeLatLong = { lat: 52.38469, lng: -1.66174};
			const parkRangerOfficeMarker = new google.maps.marker.AdvancedMarkerElement({map,position: parkRangerOfficeLatLong,title: 'Park Ranger Office'}, gmpClickable: true,);
			parkRangerOfficeMarker.addEventListener('gmp-click', () => {
				infoWindow.close();
				infoWindow.setContent(parkRangerOfficeMarker.title);
				infoWindow.open(parkRangerOfficeMarker.map, parkRangerOfficeMarker);
			});
			//Derelict Tin Mine
			const derelictTinMineLatLong = { lat: 52.38309, lng: -1.66172};
			const derelictTinMineMarker = new google.maps.marker.AdvancedMarkerElement({map,position: derelictTinMineLatLong,title: 'Derelict Tin Mine'}, gmpClickable: true,);
			//Derelict Gold Mining Town
			const derelictGoldMiningTownLatLong = { lat: 52.38398, lng: -1.65998};
			const derelictGoldMiningTownMarker = new google.maps.marker.AdvancedMarkerElement({map,position: derelictGoldMiningTownLatLong,title: 'Derelict Gold Mining Town', gmpClickable: true,},gmpClickable: true,);
			//Derelict Gold Mine
			const derelictGoldMineLatLong = { lat: 52.38387, lng: -1.65899};
			const derelictGoldMineMarker = new google.maps.marker.AdvancedMarkerElement({map,position: derelictGoldMineLatLong,title: 'Derelict Gold Mine'}, gmpClickable: true,);
			//Hunters' Lodges
			const huntersLodgesLatLong = { lat: 52.38294, lng: -1.6593};
			const huntersLodgesMarker = new google.maps.marker.AdvancedMarkerElement({map,position: huntersLodgesLatLong,title: "Hunters' Lodges"}, gmpClickable: true,);
			*/
		}
		mapInitialised = true;
		initGeolocation();
	}
	else
	{
		log("Map already initialised", 'error');
	}
	if(rotate == true)
	{
		initCompass();
	}
}

function centreMap(lat,lon)
{
	//log(`Centering map on lat:${lat} lon:${lon}`,'log-info');
	if(mapInitialised == true && mapMethod == 2)
	{
		var latLng = new google.maps.LatLng(lat, lon);
		map.panTo(latLng);	//Move smoothly
		//map.setCenter(latLng);
	}
}

function homeMap()
{
	if(mapInitialised == true && mapMethod == 2)
	{
		map.setCenter(grangeCentre);	//Jump home
	}
}

function rotateMap(angle)
{
	if(mapInitialised == true && mapMethod == 2 && map.getHeading() != angle)
	{
		//log(`Rotating map to ${angle}`,'log-info');
		map.setHeading(360-angle);
		//document.getElementById('heading').innerHTML = `Heading ${angle}`;
	}
}