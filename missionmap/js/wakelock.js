let wakeLockHandle = null;

const requestWakeLock = async (onVisibilityChange = false) => {
  try {
    wakeLockHandle = await navigator.wakeLock.request('screen');

    wakeLockHandle.addEventListener('release', () => {
      console.log('Wake Lock was released');
      wakeLockHandle = null;
    });
    console.log('Wake Lock is active');
  }
  catch(err) {
    console.error(err);
  }
};

const releaseWakeLock = () => {
  console.log('releasing wakeLock');

  wakeLockHandle.release();
  wakeLockHandle = null;
};

const handleVisibilityChange = async () => {
  if (wakeLock == true && document.visibilityState === 'visible') {
    setTimeout(async () => {
      await requestWakeLock(true);
    }, 1000);
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);