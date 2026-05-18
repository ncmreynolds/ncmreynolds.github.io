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