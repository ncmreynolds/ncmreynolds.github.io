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
const bleBagUpdateRequest = 11;		//Set bags
const bleBagUpdateResponse = bleBagsRequest | 128;	//'bags' response
const bleScenarioCountRequest = 12;		//Set bags
const bleScenarioCountResponse = bleScenarioCountRequest | 128;	//'bags' response
const bleScenarioNameRequest = 13;		//Set bags
const bleScenarioNameResponse = bleScenarioNameRequest | 128;	//'bags' response
const bleScenarioNarrativeRequest = 14;		//Set bags
const bleScenarioNarrativeResponse = bleScenarioNameRequest | 128;	//'bags' response
const bleScenarioAvailabilityRequest = 15;		//Set bags
const bleScenarioAvailabilityResponse = bleScenarioAvailabilityRequest | 128;	//'bags' response
const bleScenarioGroupsRequest = 16;		//Set bags
const bleScenarioGroupsResponse = bleScenarioGroupsRequest | 128;	//'bags' response

var bleConnected = false;	//Simple mark of connection status
var bleBusy = false;
var sequenceNumber = 1;	//Every response includes the 'sequence number' (0-255) of the command it's responding to
var lastSequenceNumber = 0;	//Checks the packet coming back
var lastCommand = 255;
var remoteBags = new Uint8Array(8);
var numberOfScenarios = 0;
var scenarioUpdate = false;
var scenarioUpdateState = 0;
var scenarioUpdateIndex = 0;

setInterval(bleKeepAlive, 90000);

function bleKeepAlive()	{
	if(bleConnected == true && bleBusy == false)	{
		blePing();
	}
}

function startScenarioUpdate()	{
	if(scenarioUpdate == false)	{
		scenarioUpdate = true;
		scenarioUpdateState = 0;
		scenarioUpdateIndex = 0;
		console.log("Starting scenario update process");
	}
}

function bleRequestScenarioUpdate()	{
	if(scenarioUpdate == true)	{
		if(bleBusy == false)	{
			if(scenarioUpdateState == 0)	{
				console.log("Requesting scenario count update");
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioCountRequest,sequenceNumber);
			} else if(scenarioUpdateState == 1)	{
				console.log(`Requesting scenario ${scenarioUpdateIndex} name update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNameRequest,sequenceNumber,scenarioUpdateIndex);
			} else if(scenarioUpdateState == 2)	{
				console.log(`Requesting scenario ${scenarioUpdateIndex} narrative update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNarrativeRequest,sequenceNumber,scenarioUpdateIndex);
			} else if(scenarioUpdateState == 3)	{
				console.log(`Requesting scenario ${scenarioUpdateIndex} availability update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioAvailabilityRequest,sequenceNumber,scenarioUpdateIndex);
			} else if(scenarioUpdateState == 4)	{
				console.log(`Requesting scenario ${scenarioUpdateIndex} groups update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioGroupsRequest,sequenceNumber,scenarioUpdateIndex);
			}
			bleSendCommand(bleScenarioUpdateRequestPacket);
		} else {
			console.log("Scenario update waiting, BLE busy");
		}
	}
}


document.getElementById('scenarioRefreshButton').addEventListener('click', startScenarioUpdate);
setInterval(bleRequestScenarioUpdate, 10000);

function bleSaveBags()	{
	if(bleBusy == false)	{
		console.log("Saving bags");
		const bleSavePacket = Uint8Array.of(bleBagUpdateRequest,sequenceNumber,8,
			document.getElementById("bag0").value,
			document.getElementById("bag1").value,
			document.getElementById("bag2").value,
			document.getElementById("bag3").value,
			document.getElementById("bag4").value,
			document.getElementById("bag5").value,
			document.getElementById("bag6").value,
			document.getElementById("bag7").value
			);
		bleSendCommand(bleSavePacket);
	} else {
		console.log("Bag save aborted, BLE busy");
	}
}

document.getElementById('bagsSaveButton').addEventListener('click', bleSaveBags);

function bleRequestBags()	{
	if(bleBusy == false)	{
		console.log("Requesting bag update");
		const bleBagsRequestPacket = Uint8Array.of(bleBagsRequest,sequenceNumber);
		bleSendCommand(bleBagsRequestPacket);
	} else {
		console.log("Bag update aborted, BLE busy");
	}
}

document.getElementById('bagsRefreshButton').addEventListener('click', bleRequestBags);

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
	if(bleBusy == true)	{
		bleBusy = false;
		console.log("Command timed out");
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
	if(event.target.value.byteLength >= 2)	{
		var responseReceived = new Uint8Array(event.target.value.byteLength);
		for (var i = 0; i < event.target.value.byteLength; i++) {
			responseReceived[i] = event.target.value.getUint8(i);
		}
		//const responseReceived = new Uint8Array(TextDecoder().decode(event.target.value));
		//console.log("Response received", responseReceived);
		if(responseReceived[1] == lastSequenceNumber)	{
			if((responseReceived[0] & 127) == lastCommand)	{	//Check if it was expected based off the last command
				switch(responseReceived[0]) {
				case blePingResponse:
					console.log("Ping response");
				break;
				case bleBagsResponse:
					console.log(`Bags response, data for ${responseReceived[2]} bags`);
					for (var i = 0; i < responseReceived[2] && i < 8; i++) {
						remoteBags[i] = responseReceived[i+3];
						if(responseReceived[i+3] < 9)	{
							document.getElementById(`bag${i}`).value = `${responseReceived[i+3]}`;
							document.getElementById(`bag${i}`).disabled = false;
						} else {
							document.getElementById(`bag${i}`).value = "8";
							document.getElementById(`bag${i}`).disabled = true;
						}
						console.log(`Bag ${i} type ${responseReceived[i+3]}`);
					}
				break;
				case bleBagUpdateResponse:
					console.log("Bag update response");
				break;
				case bleScenarioCountResponse:
					numberOfScenarios = responseReceived[2];
					if(scenarioUpdate == true)	{
						console.log(`Number of scenarios updated to ${numberOfScenarios} refeshing other values`);
						scenarioUpdateState = 1;
					}
				break;
				case bleScenarioNameRequest:
					if(scenarioUpdate == true)	{
						console.log(`Scenario ${responseReceived[2]} name received`);
						scenarioUpdateState = 2;
					}
				break;
				case bleScenarioNarrativeRequest:
					if(scenarioUpdate == true)	{
						console.log(`Scenario ${responseReceived[2]} narrative received`);
						scenarioUpdateState = 3;
					}
				break;
				case bleScenarioAvailabilityRequest:
					if(scenarioUpdate == true)	{
						console.log(`Scenario ${responseReceived[2]} availability received`);
						scenarioUpdateState = 4;
					}
				break;
				case bleScenarioGroupsRequest:
					if(scenarioUpdate == true)	{
						console.log(`Scenario ${responseReceived[2]} groups received`);
						scenarioUpdateState = 1;
						scenarioUpdateIndex+=1;
						if(scenarioUpdateIndex>=numberOfScenarios)	{	//Stop refreshing
							scenarioUpdate = false;
							scenarioUpdateIndex = 0;
						}
					}
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
	} else {
		console.log("Short packet received, ${event.target.value.byteLength}");
	}
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
			//console.log("Value written to command characteristic:", value);
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
		if(bleConnected == true)	{
			// Throw an error if Bluetooth is unexpectedly not connected
			console.error("Bluetooth is not connected.");
			window.alert("Bluetooth is not connected.")
		}
	}
}
