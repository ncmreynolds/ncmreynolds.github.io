let geolocationInitialised = false;

// The date of the last geolocation update.
var lastUpdate = new Date();
const Second = 1000;
const Minute = 60 * Second;

// Update the duration since the last geolocalisation element.
function updateTime() {
	let d = new Date() - lastUpdate;
	let min = Math.floor(d / Minute);
	let sec = Math.floor(d % Minute / Second);
	//document.getElementById("lastUpdate").textContent = `${min}m ${sec}s`;
}

function geolocationSuccess(position) {
	const latitude = position.coords.latitude;
	const longitude = position.coords.longitude;
	log(`Current location ${latitude},${longitude}`,'log-success');
	//status.textContent = "";
	//mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
	//mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
}

function geolocationError() {
	log("Unable to retrieve location",'log-error');
}

function initGeolocation()
{
	log("Initialising geolocation",'log-info');
	if(geolocationInitialised == false)
	{
		if(follow == true)
		{
			if (!navigator.geolocation) {
				log("Geolocation unavailable",'error');
				return;
			}
			else
			{
				navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
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
	}
}