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
				let angle = Math.round(event.alpha)
				rotateMap(angle);
			}
		});
		compassInitialised = true;
	}
}