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
				if(geolocationInitialised == false)	//Only use compass if geolocation didn't start
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