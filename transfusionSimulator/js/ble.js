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
const bleSaveRequest = 1;		//Save config
const bleSaveResponse = bleSaveRequest | 128;	//'save' response
const bleRestartRequest = 2;		//Restart
const bleRestartResponse = bleRestartRequest | 128;	//'restart' response
const bleBagsRequest = 10;		//Ask for bags
const bleBagsResponse = bleBagsRequest | 128;	//'bags' response
const bleBagUpdateRequest = 11;		//Set bags
const bleBagUpdateResponse = bleBagsRequest | 128;	//'bags' response
const bleScenarioCountRequest = 12;		//Set bags
const bleScenarioCountResponse = bleScenarioCountRequest | 128;	//'bags' response
const bleScenarioIdRequest = 13;		//Set bags
const bleScenarioIdResponse = bleScenarioIdRequest | 128;	//'bags' response
const bleScenarioNameRequest = 14;		//Set bags
const bleScenarioNameResponse = bleScenarioNameRequest | 128;	//'bags' response
const bleScenarioNarrativeRequest = 15;		//Set bags
const bleScenarioNarrativeResponse = bleScenarioNarrativeRequest | 128;	//'bags' response
const bleScenarioAvailabilityRequest = 16;		//Set bags
const bleScenarioAvailabilityResponse = bleScenarioAvailabilityRequest | 128;	//'bags' response
const bleScenarioGroupsRequest = 17;		//Set bags
const bleScenarioGroupsResponse = bleScenarioGroupsRequest | 128;	//'bags' response
const bleScenarioBloodTypeRequest = 18;		//Set bags
const bleScenarioBloodTypeResponse = bleScenarioBloodTypeRequest | 128;	//'bags' response

const bleDummyRequest = 127;		//Dummy value that does nothing and should never be sent
const bleDummyResponse = bleDummyRequest | 128;	//'dummy' response

var bleConnected = false;	//Simple mark of connection status
var bleBusy = false;
var sequenceNumber = 1;	//Every response includes the 'sequence number' (0-255) of the command it's responding to
var lastSequenceNumber = 0;	//Checks the packet coming back
var lastCommand = bleDummyRequest;
var remoteBags = new Uint8Array(8);
var remoteBagDataReceived = false;
var numberOfScenarios = 0;
var configRefreshInProgress = false;
var configRefreshState = 0;
var scenarioRefreshIndex = 0;

/* Full sync */

function startFullSync()	{
	
}

/* Save requests */

function bleRequestSaveConfig()	{
	if(bleBusy == false)	{
		console.log("Requesting save config");
		const blePingPacket = Uint8Array.of(bleSaveRequest,sequenceNumber);
		bleSendCommand(blePingPacket);
	} else {
		console.log("Save config request aborted, BLE busy");
	}
}

document.getElementById('saveButton').addEventListener('click', bleRequestSaveConfig);

/* Restart requests */

function bleRequestRestart()	{
	if(bleBusy == false)	{
		console.log("Requesting restart");
		const blePingPacket = Uint8Array.of(bleRestartRequest,sequenceNumber);
		bleSendCommand(blePingPacket);
	} else {
		console.log("Restart request aborted, BLE busy");
	}
}

document.getElementById('restartButton').addEventListener('click', bleRequestRestart);

/* Scenario admin */

function startConfigRefresh()	{
	if(configRefreshInProgress == false)	{
		document.getElementById("configRefreshButton").disabled = true;
		document.getElementById("configRefreshButton").className = "u-full-width";
		document.getElementById("configSaveButton").disabled = true;
		document.getElementById("configSaveButton").className = "u-full-width";
		configRefreshInProgress = true;
		configRefreshState = 0;
		scenarioRefreshIndex = 0;
		console.log("Starting config update process");
	}
}

function bleRequestScenarioUpdate()	{
	if(configRefreshInProgress == true)	{
		if(bleBusy == false)	{
			if(configRefreshState == 0)	{
				console.log("Requesting bag update");
				const bleBagsRequestPacket = Uint8Array.of(bleBagsRequest,sequenceNumber);
				bleSendCommand(bleBagsRequestPacket);
			} else if(configRefreshState == 1)	{
				console.log("Requesting scenario count update");
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioCountRequest,sequenceNumber);
				bleSendCommand(bleScenarioUpdateRequestPacket);
			} else if(configRefreshState == 2)	{
				console.log(`Requesting scenario ${scenarioRefreshIndex} name update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNameRequest,sequenceNumber,scenarioRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
			} else if(configRefreshState == 3)	{
				console.log(`Requesting scenario ${scenarioRefreshIndex} narrative update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNarrativeRequest,sequenceNumber,scenarioRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
			} else if(configRefreshState == 4)	{
				console.log(`Requesting scenario ${scenarioRefreshIndex} availability update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioAvailabilityRequest,sequenceNumber,scenarioRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
			} else if(configRefreshState == 5)	{
				console.log(`Requesting scenario ${scenarioRefreshIndex} groups update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioGroupsRequest,sequenceNumber,scenarioRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
			} else if(configRefreshState == 6)	{
				console.log(`Requesting scenario ${scenarioRefreshIndex} blood type update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioBloodTypeRequest,sequenceNumber,scenarioRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
			}
		} else {
			console.log("Scenario update waiting, BLE busy");
		}
	}
}

document.getElementById('configRefreshButton').addEventListener('click', startConfigRefresh);
setInterval(bleRequestScenarioUpdate, 250);

/* Bag admin */

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

document.getElementById('configSaveButton').addEventListener('click', bleSaveBags);

/*
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
*/

/*	Ping and keepalive */

function blePing()	{
	if(bleBusy == false)	{
		console.log("Pinging");
		const blePingPacket = Uint8Array.of(blePingRequest,sequenceNumber);
		bleSendCommand(blePingPacket);
	} else {
		console.log("Ping aborted, BLE busy");
	}
}

setInterval(bleKeepAlive, 90000);

function bleKeepAlive()	{
	if(bleConnected == true && bleBusy == false && configRefreshInProgress == false)	{
		blePing();
	}
}

/* Protocol stuff */

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
		console.log(`Command ${lastCommand} timed out`);
	}
}


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

/* Connection */

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
		console.log("Response characteristic discovered:", characteristic.uuid);
		responseCharacteristicFound = characteristic;
		characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
		characteristic.startNotifications();
		console.log("Started waiting for data");
		document.getElementById("disconnectBleButton").disabled = false;
		document.getElementById("disconnectBleButton").className = "button-primary u-full-width";
		document.getElementById("configRefreshButton").disabled = false;
		document.getElementById("configRefreshButton").className = "button-primary u-full-width";
		document.getElementById("configSaveButton").disabled = false;
		document.getElementById("configSaveButton").className = "button-primary u-full-width";
		setTimeout(startConfigRefresh, 5000);	//Request the current config after connect
	/*	return characteristic.readValue();
	})
	.then(value => {
		console.log("Read value: ", value);
		const decodedValue = new TextDecoder().decode(value);
		console.log("Decoded value: ", decodedValue);
		//retrievedValue.innerHTML = decodedValue;*/
	})
	.catch(error => {
		console.log('Error: ', error);
	})
}

// Connect Button (search for BLE Devices only if BLE is available)
connectButton.addEventListener('click', (event) => {
	if (isWebBluetoothEnabled()){
		connectToDevice();
	}
});

/* Characteristic change/notify */

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
				case bleSaveResponse:
					console.log("Save response");
				break;
				case bleRestartResponse:
					console.log("Restart response, disconnecting");
					disconnectDevice();
				break;
				case bleBagsResponse:
					console.log(`Bags response, data for ${responseReceived[2]} bags`);
					for (var i = 0; i < responseReceived[2] && i < 8; i++) {
						remoteBags[i] = responseReceived[i+3];
						var bag = document.getElementById(`bag${i}`);
						if(responseReceived[i+3] < 9)	{
							bag.value = `${responseReceived[i+3]}`;
							bag.disabled = false;
						} else {
							bag.value = "8";
							bag.disabled = true;
						}
						console.log(`Bag ${i} type ${responseReceived[i+3]}`);
						document.getElementById("bagTypes1").style.display = "block";	//Show bag options
						document.getElementById("bagTypes2").style.display = "block";	//Show bag options
						document.getElementById("bagTypesPlaceholder").style.display = "none";	//Hide bag placeholder
					}
					if(configRefreshInProgress == true)	{
						configRefreshState = 1;
					}
				break;
				case bleBagUpdateResponse:
					console.log("Bag update response");
				break;
				case bleScenarioCountResponse:
					numberOfScenarios = responseReceived[2];
					if(configRefreshInProgress == true)	{
						console.log(`Number of scenarios updated to ${numberOfScenarios} refeshing other values`);
						configRefreshState = 2;
					}
				break;
				case bleScenarioNameResponse:
					if(configRefreshInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} name length ${responseReceived[3]} received`);
						configRefreshState = 3;
					}
				break;
				case bleScenarioNarrativeResponse:
					if(configRefreshInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} length ${responseReceived[3]} narrative received`);
						configRefreshState = 4;
					}
				break;
				case bleScenarioAvailabilityResponse:
					if(configRefreshInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} availability ${responseReceived[3]} received`);
						configRefreshState = 5;
					}
				break;
				case bleScenarioGroupsResponse:
					if(configRefreshInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} available groups received`);
						for (var i = 0; i < responseReceived[3] && i < 8; i++) {
							console.log(`Group ${i} available ${responseReceived[4+i]}`);
						}
						configRefreshState = 6;
					}
				break;
				case bleScenarioBloodTypeResponse:
					if(configRefreshInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} blood type ${responseReceived[3]} received`);
						configRefreshState = 2;
						scenarioRefreshIndex+=1;
						if(scenarioRefreshIndex>=1){//numberOfScenarios)	{	//Stop refreshing
							configRefreshInProgress = false;
							scenarioRefreshIndex = 0;
							document.getElementById("configRefreshButton").disabled = false;
							document.getElementById("configRefreshButton").className = "button-primary u-full-width";
							document.getElementById("configSaveButton").disabled = false;
							document.getElementById("configSaveButton").className = "button-primary u-full-width";
							document.getElementById("scenarioTable").style.display = "block";	//Show scenario table
							document.getElementById("scenarioTablePlaceholder").style.display = "none";	//Hide scenario table placeholder
							document.getElementById("scenarioForm1").style.display = "block";	//Show scenario form
							document.getElementById("scenarioForm2").style.display = "block";	//Show scenario form
							document.getElementById("scenarioForm3").style.display = "block";	//Show scenario form
							document.getElementById("scenarioForm4").style.display = "block";	//Show scenario form
							document.getElementById("scenarioForm5").style.display = "block";	//Show scenario form
							updateScenarioTable();
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

function updateScenarioTable()	{
	var table = document.getElementById("scenarioTableItself");
	var rowCount = table.rows.length;	//This includes the header which is row 0
	for (var i = 0; i < rowCount-1; i++) {
		table.deleteRow(1);	//Delete row 1 which skips the header
	}
	for (var i = 0; i < numberOfScenarios; i++) {
		var row = table.insertRow(i+1);
		var cell0 = row.insertCell(0);
		var cell1 = row.insertCell(1);
		var cell2 = row.insertCell(2);
		var cell3 = row.insertCell(3);
		cell0.innerHTML = "Name";
		cell1.innerHTML = "Group";
		cell2.innerHTML = "&#8593;";
		cell3.innerHTML = "&#8595;";
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
			setTimeout(bleTimeoutCommand, 1000); //Timeout command after 1s
		})
		.catch(error => {
			console.error("Error writing to the command characteristic: ", error);
		});
	} else {
		console.error ("Bluetooth is not connected. Cannot write to characteristic.")
		window.alert("Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!")
	}
}

/* Disconnection */

function disconnectDevice() {
	console.log("Disconnect Device.");
	if (bleServer && bleServer.connected) {
		lastCommand = bleDummyRequest;
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

function onDisconnected(event){
	bleConnected = false;
	configRefreshInProgress = false;
	bleStateContainer.innerHTML = "Device disconnected";
	bleStateContainer.style.color = "#d13a30";
	//console.log('Device Disconnected:', event.target.device.name);
	console.log('Disconnected');
	//connectToDevice();
	lastCommand = bleDummyRequest;
}

// Disconnect Button
disconnectButton.addEventListener('click', disconnectDevice);

