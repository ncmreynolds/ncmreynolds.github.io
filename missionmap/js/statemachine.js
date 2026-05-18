async function initialiseApp()	{
	await initDB();
	if(allSettingsLoaded == true)
	{
		if(mapsApiReady == true)
		{
			await initMap();
		}
		else
		{
			log("Maps API not ready yet",'error');
		}
	}
	else
	{
		log("Settings not loaded yet",'error');
	}
}