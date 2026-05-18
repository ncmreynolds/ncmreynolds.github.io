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

function geolocationPollError(err) {
	log(`Unable to retrieve location (${err.code}): ${err.message}`,'log-error');
	geolocationSuccessful = false;
}


function geolocationWatchSuccess(pos) {
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
		centreMap(lastKnownLatitude,lastKnownLongitude);
	}
	else
	{
		log(`New position lat:${lastKnownLatitude} lon:${lastKnownLongitude}`,'log-info');
	}
}

function geolocationWatchError()
{
	log("Geolocation watch error",'log-error');
}

function enableGeolocationWatchPosition()
{
	if(geolocationSuccessful == true)
	{
		if(geolocationWatchPositionEnabled == false)
		{
			log("Enabling location watchPosition",'log-info');
			navigator.geolocation.watchPosition(
				//Success function
				geolocationWatchSuccess
			,
				//Error function
				geolocationWatchError
			,
			{
				//Options
				enableHighAccuracy: true,
			}
			);
			geolocationWatchPositionEnabled = true;
			//Also poll on a slow interval
			log("Enabling location polling",'log-info');
			geolocationPollingInterval = setInterval(geolocationPollUpdatePosition, 90000); //Only do this every 90s
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