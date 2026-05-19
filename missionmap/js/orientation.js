let compassInitialised = false;
var compassDirection = 0;

function initCompass()
{
	if(compassInitialised == false)
	{
		log("Initialising compass",'log-info');
		window.addEventListener("deviceorientation", event => {
			if(rotate == true)
			{
				if(geolocationInitialised == false || lastKnownSpeed <= 0.5) //Only use compass if geolocation didn't start or not moving
				{
					let angle = Math.round(event.alpha)
					angle = angle + rotationOffset;
					if(angle > 360)
					{
						angle = angle - 360;
					}
					rotateMap(angle);
				}
			}
		});
		compassInitialised = true;
	}
}