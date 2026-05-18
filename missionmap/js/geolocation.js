let geolocationInitialised = false;
let geolocationSuccessful = false;
let geolocationWatchPositionEnabled = false;
var lastKnownLatitude;
var lastKnownLongitude;
var geolocationPollingInterval;

// The date of the last geolocation update.
var lastUpdate = new Date();
const Second = 1000;
const Minute = 60 * Second;

function geolocationWatchUpdatePosition(pos) {
	const coordinates = pos.coords;
	lastKnownLatitude = coordinates.latitude;
	lastKnownLongitude = coordinates.longitude;
	let d = new Date() - lastUpdate;
	let min = Math.floor(d / Minute);
	let sec = Math.floor(d % Minute / Second);
	lastUpdate = new Date();
	log(`Geolocation watch update after ${min}m ${sec}s`,'log-info');
	if(follow == true)
	{
		log(`Centering map on lat:${lastKnownLatitude} lon:${lastKnownLongitude}`,'log-info');
	}
	else
	{
		log(`New position lat:${lastKnownLatitude} lon:${lastKnownLongitude}`,'log-info');
	}
}

function geolocationPollUpdatePosition() {
	let d = new Date() - lastUpdate;
	let min = Math.floor(d / Minute);
	let sec = Math.floor(d % Minute / Second);
	lastUpdate = new Date();
	log(`Geolocation poll update after ${min}m ${sec}s`,'log-info');
	navigator.geolocation.getCurrentPosition(geolocationPollSuccess, geolocationPollError);
}

function geolocationPollSuccess(position) {
	lastKnownLatitude = position.coords.latitude;
	lastKnownLongitude = position.coords.longitude;
	geolocationSuccessful = true;
	log(`Current location ${lastKnownLatitude},${lastKnownLongitude}`,'log-success');
	if(geolocationWatchPositionEnabled == false)
	{
		enableGeolocationWatchPosition();
	}
}

function geolocationPollError() {
	log("Unable to retrieve location",'log-error');
	geolocationSuccessful = false;
}


function enableGeolocationWatchPosition()
{
	if(geolocationSuccessful == true)
	{
		if(geolocationWatchPositionEnabled == false)
		{
			log("Enabling location watchPosition",'log-info');
			navigator.geolocation.watchPosition(g => {
				//Success function
				geolocationWatchUpdatePosition();
			}, 
				//Error function
				geolocationWatchError
			, {
				//Options
				enableHighAccuracy: true,
			});
			geolocationWatchPositionEnabled = true;
			//Also poll on a slow interval
			log("Enabling location polling",'log-info');
			geolocationPollingInterval = setInterval(geolocationPollUpdatePosition, 30000);
		}
		else
		{
			log("Geolocation watchPosition already enabled",'log-info');
		}
	}
	else
	{
		log("Geolocation watchPosition not possible",'log-info');
	}
}

function geolocationWatchError()
{
	log("Geolocation watch error",'log-error');
}

function initGeolocation()
{
	log("Initialising geolocation",'log-info');
	if(geolocationInitialised == false)
	{
		if(follow == true)
		{
			if (!navigator.geolocation) {
				log("Geolocation unavailable",'log-error');
				return;
			}
			else
			{
				navigator.geolocation.getCurrentPosition(geolocationPollSuccess, geolocationPollError);
				log("Geolocation initialised",'log-success');
			}
			geolocationInitialised = true;
		}
		else
		{
			log("Geolocation not requested",'log-info');
		}
	}
	else
	{
		log("Geolocation already requested",'log-info');
		enableGeolocationWatchPosition();
	}
}