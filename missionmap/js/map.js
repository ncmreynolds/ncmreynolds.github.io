const mapElement = document.getElementById('map');
var map;
let mapsApiReady = false;
let mapInitialised = false;
let grangeCentre;
let personMarker;
let personMarkerInitialised = false;
let showMarker = true;

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
			//grangeCentre = new google.maps.LatLng(52.383966,-1.659957);	//Use this to centre the Grange when not following
			grangeCentre = new google.maps.LatLng(52.384100,-1.660429); //Use this to centre the Grange when not following
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
				mapTypeId: mapType,
				// How zoomed in you want the map to start at (always required)
				zoom: 18,

				// The latitude and longitude to center the map (always required)
				center: grangeCentre //new google.maps.LatLng(52.383966,-1.659957)
			};

			// Get the HTML DOM element that will contain your map 
			// We are using a div with id="map" seen below in the <body>
			
			//Insert a gmp-map element
			//mapElement.innerHTML = '<gmp-map></gmp-map>';

			// Create the Google Map using our element and options defined above
			map = new google.maps.Map(mapElement, mapOptions);

			map.setOptions({
				// Disable the default UI.
				disableDefaultUI: true,
			});
			
			//Marker positions

			const markers = [
				{
					position: { lat: 52.38469, lng: -1.66174 },
					title: 'Park Ranger Office',
					pinLegend: "Rangers",
					pinInfo: "No further information available",
				},
				{
					position: { lat: 52.38309, lng: -1.66172 },
					title: 'Derelict Tin Mine',
					pinLegend: "Tin Mine",
					pinInfo: "No further information available",
				},
				{
					position: { lat: 52.38398, lng: -1.65998 },
					title: 'Derelict Gold Mining Town',
					pinLegend: "Town",
					pinInfo: "No further information available",
				},
				{
					position: { lat: 52.38387, lng: -1.65899 },
					title: 'Derelict Gold Mine',
					pinLegend: "Gold Mine",
					pinInfo: "No further information available",
				},
				{
					position: { lat: 52.38294, lng: -1.6593 },
					title: "Hunters' Lodges",
					pinLegend: "Lodges",
					pinInfo: "No further information available",
				},
			];

			// Create an info window to share between markers.
			const infoWindow = new InfoWindow();

			// Create the markers.
			markers.forEach(({ position, title, pinLegend, pinInfo }, i) => {
				const pin = new PinElement({
					//glyphText: `${i + 1}`,
					glyphText: `${pinLegend}`,
					glyphColor: 'white',
					background: 'red',
					borderColor: 'grey',
					scale: 1.0,
				});
				const marker = new google.maps.marker.AdvancedMarkerElement(
					{
						map,
						position: position,
						title: `${title}`,
						gmpClickable: true,
						zIndex: i,
						collisionBehavior: 'REQUIRED_AND_HIDES_OPTIONAL',	//Hide other things when this is on top
					});
				marker.append(pin);
				//document.querySelector('gmp-map').append(marker);
				// Add a click listener for each marker, and set up the info window.
				marker.addEventListener('gmp-click', () => {
					infoWindow.close();
					infoWindow.setContent(`${pinInfo}`);
					infoWindow.setHeaderDisabled(false);
					infoWindow.setHeaderContent(marker.title);
					infoWindow.open(marker.map, marker);
				});
			});
			
			//Label positions
			const labels = [
				{
					position: { lat: 52.384342, lon: -1.659194 },
					title: 'Towards Bear Camp',
				},
				{
					position: { lat: 52.382566, lon: -1.658955 },
					title: 'Towards Rainy Hollow',
				},
			];
			
			labels.forEach(({ position, title }, i) => {
				
				const label = document.createElement('div');
				label.className = 'map-tag';
				label.textContent = `${title}`;
				
				const marker = new AdvancedMarkerElement({
					position: position,
				});
				marker.append(label);
				mapElement.append(marker);
			});
			
			if(showMarker == true)
			{
				initialisePersonMarker();
			}
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
		//initCompass();
	}
}

function initialisePersonMarker()
{
	if(personMarkerInitialised == false)
	{
		//Old style marker, which CAN be moved!
		personMarker = new google.maps.Marker( {icon: {
				//url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
				url: 'https://ncmreynolds.github.io/missionmap/images/icons/digital-trace-32x32.png',
				// This marker is 32 pixels wide by 32 pixels high.
				size: new google.maps.Size(32, 32),
				// The origin for this image is (0, 0).
				origin: new google.maps.Point(0, 0),
				// The anchor for this image is the centre of the circle
				anchor: new google.maps.Point(16, 16)
			}, position: grangeCentre, map: map} );
		personMarkerInitialised = true;
	}
	personMarker.setMap( map );
	//personMarker.setPosition( grangeCentre );
}
function hidePersonMarker()
{
	if(personMarkerInitialised == true)
	{
		personMarker.setMap( null );
	}
}

function centreMap(lat,lon)
{
	//log(`Centering map on lat:${lat} lon:${lon}`,'log-info');
	if(mapInitialised == true && mapMethod == 2)
	{
		var latLng = new google.maps.LatLng(lat, lon);
		map.panTo(latLng);	//Move smoothly
	}
}

function homeMap()
{
	if(mapInitialised == true && mapMethod == 2)
	{
		map.setCenter(grangeCentre);	//Jump home
		updatePersonMarker();
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

function updatePersonMarker()
{
	//personMarker.setPosition( grangeCentre );
	personMarker.setPosition( new google.maps.LatLng( lastKnownLatitude, lastKnownLongitude ) );
}