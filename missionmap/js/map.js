const mapElement = document.getElementById('map');
var map;
let mapsApiReady = false;
let mapInitialised = false;
let grangeCentre;
let personMarker;
let showPersonMarker = true;

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
			
			//Insert a gmp-map element
			//mapElement.innerHTML = '<gmp-map></gmp-map>';

			// Create the Google Map using our element and options defined above
			map = new google.maps.Map(mapElement, mapOptions);
			
			//Marker positions

			const markers = [
				{
					position: { lat: 52.38469, lng: -1.66174 },
					title: 'Park Ranger Office',
					pinLegend: "Rangers",
					pinInfo: "Lots more info",
				},
				{
					position: { lat: 52.38309, lng: -1.66172 },
					title: 'Derelict Tin Mine',
					pinLegend: "Tin Mine",
					pinInfo: "Lots more info",
				},
				{
					position: { lat: 52.38398, lng: -1.65998 },
					title: 'Derelict Gold Mining Town',
					pinLegend: "Town",
					pinInfo: "Lots more info",
				},
				{
					position: { lat: 52.38387, lng: -1.65899 },
					title: 'Derelict Gold Mine',
					pinLegend: "Gold Mine",
					pinInfo: "Lots more info",
				},
				{
					position: { lat: 52.38294, lng: -1.6593 },
					title: "Hunters' Lodges",
					pinLegend: "Lodges",
					pinInfo: "Lots more info",
				},
			];

			// Create an info window to share between markers.
			const infoWindow = new InfoWindow();

			// Create the markers.
			markers.forEach(({ position, title, pinLegend, pinInfo }, i) => {
				const pin = new PinElement({
					//glyphText: `${i + 1}`,
					glyphText: `${pinLegend}`,
					glyphColor: 'black',
					background: 'white',
					borderColor: 'grey',
					scale: 1.5,
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
			
			if(showPersonMarker == true)
			{
				//Old style marker, which CAN be mnoved!
				personMarker = new google.maps.Marker( {icon: {
						url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
						// This marker is 20 pixels wide by 32 pixels high.
						size: new google.maps.Size(20, 32),
						// The origin for this image is (0, 0).
						origin: new google.maps.Point(0, 0),
						// The anchor for this image is the base of the flagpole at (0, 32).
						anchor: new google.maps.Point(0, 32)
					}, position: grangeCentre, map: map} );
				personMarker.setMap( map );
				personMarker.setPosition( grangeCentre );
			}
			//Add a marker for current position
			//const personGlyphImgSrc = new URL('images/icons/Person_icon_BLACK-01.svg', import.meta.url);
			//const personGlyphSvgPinElement = new PinElement({glyphSrc: personGlyphImgSrc,});
			
			/*
			const parser = new DOMParser();
			
			const pinSvgString =
    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none"><rect width="56" height="56" rx="28" fill="#7837FF"></rect><path d="M46.0675 22.1319L44.0601 22.7843" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.9402 33.2201L9.93262 33.8723" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M27.9999 47.0046V44.8933" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M27.9999 9V11.1113" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M39.1583 43.3597L37.9186 41.6532" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.8419 12.6442L18.0816 14.3506" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.93262 22.1319L11.9402 22.7843" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M46.0676 33.8724L44.0601 33.2201" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M39.1583 12.6442L37.9186 14.3506" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.8419 43.3597L18.0816 41.6532" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M28 39L26.8725 37.9904C24.9292 36.226 23.325 34.7026 22.06 33.4202C20.795 32.1378 19.7867 30.9918 19.035 29.9823C18.2833 28.9727 17.7562 28.0587 17.4537 27.2401C17.1512 26.4216 17 25.5939 17 24.7572C17 23.1201 17.5546 21.7513 18.6638 20.6508C19.7729 19.5502 21.1433 19 22.775 19C23.82 19 24.7871 19.2456 25.6762 19.7367C26.5654 20.2278 27.34 20.9372 28 21.8649C28.77 20.8827 29.5858 20.1596 30.4475 19.6958C31.3092 19.2319 32.235 19 33.225 19C34.8567 19 36.2271 19.5502 37.3362 20.6508C38.4454 21.7513 39 23.1201 39 24.7572C39 25.5939 38.8488 26.4216 38.5463 27.2401C38.2438 28.0587 37.7167 28.9727 36.965 29.9823C36.2133 30.9918 35.205 32.1378 33.94 33.4202C32.675 34.7026 31.0708 36.226 29.1275 37.9904L28 39Z" fill="#FF7878"></path></svg>';
			
			const pinSvg = parser.parseFromString(pinSvgString,'image/svg+xml').documentElement;
			
			personMarker = new google.maps.marker.AdvancedMarkerElement(
				{
					map,
					position: grangeCentre,
					zIndex: 0,	//Lowest so it goes under
					collisionBehavior: 'OPTIONAL_AND_HIDES_LOWER_PRIORITY',	//Hide when under other things
					//title: `${title}`,
					//gmpClickable: true,
				});
			personMarker.append(pinSvg);
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
	personMarker.setPosition( new google.maps.LatLng( lastKnownLatitude, lastKnownLongitude ) );
}