//Elements from page

const connectButton = document.getElementById('connectBleButton');
const disconnectButton = document.getElementById('disconnectBleButton');
//const onButton = document.getElementById('onButton');
//const offButton = document.getElementById('offButton');
//const retrievedValue = document.getElementById('valueContainer');
//const latestValueSent = document.getElementById('valueSent');
const bleStateContainer = document.getElementById('bleState');
//const timestampContainer = document.getElementById('timestamp');

//Define BLE Device Specs
var deviceName ='TransfusionSimulator';
var bleService = '5eaf2551-5714-48e7-bcb4-249c74c56839';
var commandCharacteristic = '3e1f6333-14d3-4018-8271-c28be9d4fdea';
var responseCharacteristic= 'd4bc86c5-afd3-4882-ac67-954e7857b73b';

//Global Variables to Handle Bluetooth
var bleServer;
var bleServiceFound;
var responseCharacteristicFound;

//Values for sending/receiving commands. All have the response with bit 8 as I've a C/embedded mindset
const pingRequest = 0;		//Check the client is responding with a 'ping'
const pingResponse = 128;	//'ping' response

var bleConnected = false;	//Simple mark of connection status
var sequenceNumber = 1;	//Every response includes the 'sequence number' (0-255) of the command it's responding to
var lastSequenceNumber = 0;	//Checks the packet coming back

setInterval(bleKeepAlive, 10000);

function bleKeepAlive()	{
	if(bleConnected == true)	{
		blePing();
	}
}

function blePing()	{
	console.log("Pinging");
	const blePingPacket = Uint8Array.of(pingRequest,sequenceNumber);
	bleSendCommand(blePingPacket);
	bleManageSequenceNumber();
}

function bleManageSequenceNumber()	{
	lastSequenceNumber = sequenceNumber;
	sequenceNumber++;
	if(sequenceNumber > 255)	{
		sequenceNumber = 0;
	}
}

// Connect Button (search for BLE Devices only if BLE is available)
connectButton.addEventListener('click', (event) => {
	if (isWebBluetoothEnabled()){
		connectToDevice();
	}
});

// Disconnect Button
disconnectButton.addEventListener('click', disconnectDevice);

// Check if BLE is available in your Browser
function isWebBluetoothEnabled() {
	if (!navigator.bluetooth) {
		console.log("Web Bluetooth API is not available in this browser!");
		bleStateContainer.innerHTML = "Web Bluetooth API is not available in this browser!";
		return false
	}
	console.log('Web Bluetooth API supported in this browser.');
	return true
}

// Connect to BLE Device and Enable Notifications
function connectToDevice(){
	console.log('Initializing Bluetooth...');
	navigator.bluetooth.requestDevice({
		filters: [{name: deviceName}],
		optionalServices: [bleService]
	})
	.then(device => {
		console.log('Device Selected:', device.name);
		bleStateContainer.innerHTML = 'Connected to device ' + device.name;
		bleStateContainer.style.color = "#24af37";
		bleConnected = true;
		device.addEventListener('gattserverdisconnected', onDisconnected);
		return device.gatt.connect();
	})
	.then(gattServer =>{
		bleServer = gattServer;
		console.log("Connected to GATT Server");
		return bleServer.getPrimaryService(bleService);
	})
	.then(service => {
		bleServiceFound = service;
		console.log("Service discovered:", service.uuid);
		return service.getCharacteristic(responseCharacteristic);
	})
	.then(characteristic => {
		console.log("Characteristic discovered:", characteristic.uuid);
		responseCharacteristicFound = characteristic;
		characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
		characteristic.startNotifications();
		console.log("Notifications Started.");
		return characteristic.readValue();
	})
	.then(value => {
		console.log("Read value: ", value);
		const decodedValue = new TextDecoder().decode(value);
		console.log("Decoded value: ", decodedValue);
		//retrievedValue.innerHTML = decodedValue;
	})
	.catch(error => {
		console.log('Error: ', error);
	})
}

function onDisconnected(event){
	console.log('Device Disconnected:', event.target.device.name);
	bleStateContainer.innerHTML = "Device disconnected";
	bleStateContainer.style.color = "#d13a30";
	bleConnected = false;
	connectToDevice();
}

function handleCharacteristicChange(event){
	const newValueReceived = new TextDecoder().decode(event.target.value);
	console.log("Characteristic value changed: ", newValueReceived);
	retrievedValue.innerHTML = newValueReceived;
	timestampContainer.innerHTML = getDateTime();
}


function bleSendCommand(value){
	if (bleServer && bleServer.connected) {
		bleServiceFound.getCharacteristic(commandCharacteristic)
		.then(characteristic => {
			console.log("Found the command characteristic: ", characteristic.uuid);
			const data = new Uint8Array([value]);
			return characteristic.writeValue(data);
		})
		.then(() => {
			//latestValueSent.innerHTML = value;
			console.log("Value written to command characteristic:", value);
		})
		.catch(error => {
			console.error("Error writing to the command characteristic: ", error);
		});
	} else {
		console.error ("Bluetooth is not connected. Cannot write to characteristic.")
		window.alert("Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!")
	}
}

function disconnectDevice() {
	console.log("Disconnect Device.");
	if (bleServer && bleServer.connected) {
		if (responseCharacteristicFound) {
			responseCharacteristicFound.stopNotifications()
				.then(() => {
					console.log("Notifications Stopped");
					return bleServer.disconnect();
				})
				.then(() => {
					console.log("Device Disconnected");
					bleStateContainer.innerHTML = "Device Disconnected";
					bleStateContainer.style.color = "#d13a30";

				})
				.catch(error => {
					console.log("An error occurred:", error);
				});
		} else {
			console.log("No characteristic found to disconnect.");
		}
	} else {
		// Throw an error if Bluetooth is not connected
		console.error("Bluetooth is not connected.");
		window.alert("Bluetooth is not connected.")
	}
}
