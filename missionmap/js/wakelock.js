
const wakeLockSwitch = document.querySelector('#wake-lock');
const restoreSwitch = document.querySelector('#restore-wake-lock');

let wakeLock = null;

const requestWakeLock = async (onVisibilityChange = false) => {
  try {
    wakeLock = await navigator.wakeLock.request('screen');

    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock was released');
      wakeLockSwitch.checked = false;
      wakeLock = null;
    });
    console.log('Wake Lock is active');
    
    // if the wake lock is restored on visibility change, check the checkbox
    if(onVisibilityChange) {
      wakeLockSwitch.checked = true;
    }
  }
  catch(err) {
    console.error(err);
  }
};

const releaseWakeLock = () => {
  console.log('releasing wakeLock');

  wakeLock.release();
  wakeLock = null;
};

wakeLockSwitch.addEventListener('change', ({detail}) => {
  const {checked} = detail;

  checked ? requestWakeLock() : releaseWakeLock();
});   

const handleVisibilityChange = async () => {
  // add a delay to show the wake lock is restored on visibility change
  // so the user can see the checkbox is checked
  if (supported && restoreSwitch.checked && document.visibilityState === 'visible') {
    setTimeout(async () => {
      await requestWakeLock(true);
    }, 1000);
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);