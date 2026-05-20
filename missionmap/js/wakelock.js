let wakeLockHandle = null;

const requestWakeLock = async (onVisibilityChange = false) => {
  try {
    wakeLockHandle = await navigator.wakeLock.request('screen');

    wakeLockHandle.addEventListener('release', () => {
	  log('WakeLock was released','log-info');
      wakeLockHandle = null;
    });
	log('WakeLock is active','log-info');
  }
  catch(err) {
	log(`Error ${err}`,'log-error');
  }
};

const releaseWakeLock = () => {
	if(wakeLockHandle)
	{
		wakeLockHandle.release();
		wakeLockHandle = null;
		log('Releasing wakeLock','log-info');
	}
};

const handleVisibilityChange = async () => {
  if (wakeLock == true && document.visibilityState === 'visible') {
    setTimeout(async () => {
      await requestWakeLock(true);
    }, 1000);
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);