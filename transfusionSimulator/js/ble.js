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
const blePingRequest = 0;		//Check the client is responding with a 'ping'
const blePingResponse = blePingRequest | 128;	//'ping' response
const bleBagsRequest = 10;		//Ask for bags
const bleBagsResponse = bleBagsRequest | 128;	//'bags' response

var bleConnected = false;	//Simple mark of connection status
var bleBusy = false;
var sequenceNumber = 1;	//Every response includes the 'sequence number' (0-255) of the command it's responding to
var lastSequenceNumber = 0;	//Checks the packet coming back
var lastCommand = 255;

setInterval(bleKeepAlive, 60000);

function bleKeepAlive()	{
	if(bleConnected == true && bleBusy == false)	{
		blePing();
	}
}

function bleRequestBags()	{
	if(bleBusy == false)	{
		console.log("Requesting bag update");
		const bleBagsRequestPacket = Uint8Array.of(bleBagsRequest,sequenceNumber);
		bleSendCommand(bleBagsRequestPacket);
	} else {
		console.log("Bag update aborted, BLE busy");
	}
}

document.getElementById('bagsUpdateButton').addEventListener('click', () => bleRequestBags());

function blePing()	{
	if(bleBusy == false)	{
		console.log("Pinging");
		const blePingPacket = Uint8Array.of(blePingRequest,sequenceNumber);
		bleSendCommand(blePingPacket);
	} else {
		console.log("Ping aborted, BLE busy");
	}
}

function bleManageSequenceNumber()	{
	lastSequenceNumber = sequenceNumber;	//Record last one
	sequenceNumber+=1;	//Increment but limit to 8 bits
	if(sequenceNumber > 255)	{
		sequenceNumber = 0;
	}
}

function bleTimeoutCommand()	{
	bleBusy = false;
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
		//setTimeout(bleRequestBags, 1000);	//Request the current bags
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
	bleConnected = false;
	bleStateContainer.innerHTML = "Device disconnected";
	bleStateContainer.style.color = "#d13a30";
	//console.log('Device Disconnected:', event.target.device.name);
	console.log('Disconnected');
	//connectToDevice();
}

function handleCharacteristicChange(event){	//This happens on a notify
	//const newValueReceived = new TextDecoder().decode(event.target.value);
	const responseReceived = new Uint8Array(event.target.value);
	//console.log("Response received", responseReceived);
	if(responseReceived[1] == lastSequenceNumber)	{
		if((responseReceived[0] & 127) == lastCommand)	{	//Check if it was expected based off the last command
			switch(responseReceived[0]) {
			case blePingResponse:
				console.log("Ping response");
			break;
			default:
				console.log("Unknown response");
			}
			bleBusy = false;	//Mark command as received OK
		} else {
			const logMessage = `Unexpected response ${responseReceived[0]}`;
			console.log(logMessage);
		}
	} else {
		const logMessage = `Sequence number mismatch on response, expected ${lastSequenceNumber}, received ${responseReceived[1]}`;
		console.log(logMessage);
	}
	//retrievedValue.innerHTML = newValueReceived;
	//timestampContainer.innerHTML = getDateTime();
}


function bleSendCommand(value){
	if (bleServer && bleServer.connected) {
		bleServiceFound.getCharacteristic(commandCharacteristic)
		.then(characteristic => {
			//console.log("Found the command characteristic: ", characteristic.uuid);
			//const data = new Uint8Array([value]);
			//return characteristic.writeValue(data);
			return characteristic.writeValue(value);
		})
		.then(() => {
			//latestValueSent.innerHTML = value;
			console.log("Value written to command characteristic:", value);
			lastCommand = value[0];
			bleManageSequenceNumber();
			bleBusy = true;
			setTimeout(bleTimeoutCommand, 5000); //Timeout command after 5s
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
