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
const blePingResponse = blePingRequest | 128;
const bleSaveRequest = 1;		//Save config
const bleSaveResponse = bleSaveRequest | 128;
const bleRestartRequest = 2;		//Restart
const bleRestartResponse = bleRestartRequest | 128;
const bleBagsRequest = 10;		//Ask for bags
const bleBagsResponse = bleBagsRequest | 128;
const bleBagUpdateRequest = 11;		//Set bags
const bleBagUpdateResponse = bleBagUpdateRequest | 128;
const bleScenarioCountRequest = 12;		//Set bags
const bleScenarioCountResponse = bleScenarioCountRequest | 128;
const bleScenarioIdRequest = 13;		//Set bags
const bleScenarioIdResponse = bleScenarioIdRequest | 128;
const bleScenarioNameLengthRequest = 14;		//Set bags
const bleScenarioNameLengthResponse = bleScenarioNameLengthRequest | 128;
const bleScenarioNameRequest = 15;		//Set bags
const bleScenarioNameResponse = bleScenarioNameRequest | 128;
const bleScenarioNarrativeLengthRequest = 16;		//Set bags
const bleScenarioNarrativeLengthResponse = bleScenarioNarrativeLengthRequest | 128;
const bleScenarioNarrativeRequest = 17;		//Set bags
const bleScenarioNarrativeResponse = bleScenarioNarrativeRequest | 128;
const bleScenarioAvailableRequest = 18;		//Set bags
const bleScenarioAvailableResponse = bleScenarioAvailableRequest | 128;
const bleScenarioAvailableBloodTypesRequest = 19;		//Set bags
const bleScenarioAvailableBloodTypesResponse = bleScenarioAvailableBloodTypesRequest | 128;
const bleScenarioBloodTypeRequest = 20;		//Set bags
const bleScenarioBloodTypeResponse = bleScenarioBloodTypeRequest | 128;

const bleDummyRequest = 127;		//Dummy value that does nothing and should never be sent
const bleDummyResponse = bleDummyRequest | 128;	//'dummy' response

var bleConnected = false;	//Simple mark of connection status
var bleBusy = false;
var bleTimeouts = 0;
const bleErrorThreshold = 20;
const bleBlockSize = 50;
var sequenceNumber = 1;	//Every response includes the 'sequence number' (0-255) of the command it's responding to
var lastSequenceNumber = 0;	//Checks the packet coming back
var lastCommand = bleDummyRequest;

//Bag data
var remoteBags = new Uint8Array(8);

//Scenario data
var numberOfScenarios = 0;
const scenarioName = [];
const scenarioNameLength = [];
const scenarioNarrative = [];
const scenarioNarrativeLength = [];
const scenarioAvailable = [];
const scenarioBloodType = [];
const scenarioAvailableBloodTypes = [];

//Full config refresh
var configRefreshInProgress = false;
var configRefreshState = 0;
var configRefreshIndex = 0;
var configRefreshBlock = 0;

//Bag send
var bagSendInProgress = false;

//Scenario send
var lastClickedScenario = 255;
var scenarioSendInProgress = false;
var scenarioSendState = 0;
var scenarioSendIndex = 0;
var scenarioSendBlock = 0;

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

/* Scenario admin */


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
				console.log(`Requesting scenario ${configRefreshIndex} name length update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNameLengthRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 3)	{
				console.log(`Requesting scenario ${configRefreshIndex} name update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNameRequest,sequenceNumber,configRefreshIndex,configRefreshBlock);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 4)	{
				console.log(`Requesting scenario ${configRefreshIndex} narrative length update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNarrativeLengthRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 5)	{
				console.log(`Requesting scenario ${configRefreshIndex} narrative update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNarrativeRequest,sequenceNumber,configRefreshIndex,configRefreshBlock);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 6)	{
				console.log(`Requesting scenario ${configRefreshIndex} availability update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioAvailableRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 7)	{
				console.log(`Requesting scenario ${configRefreshIndex} groups update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioAvailableBloodTypesRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 8)	{
				console.log(`Requesting scenario ${configRefreshIndex} blood type update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioBloodTypeRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			}
		} else {
			console.log("Scenario update waiting, BLE busy");
		}
	}
}

setInterval(bleRequestScenarioUpdate, 250);

/* Bag admin */

function bleSendBags()	{
	if(bleBusy == false)	{
		console.log("Sending bags");
		const bleSendBagsPacket = Uint8Array.of(bleBagUpdateRequest,sequenceNumber,8,
			document.getElementById("bag0").value,
			document.getElementById("bag1").value,
			document.getElementById("bag2").value,
			document.getElementById("bag3").value,
			document.getElementById("bag4").value,
			document.getElementById("bag5").value,
			document.getElementById("bag6").value,
			document.getElementById("bag7").value
			);
		bleSendCommand(bleSendBagsPacket);
	} else {
		console.log("Bag send aborted, BLE busy");
	}
}

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
		bleTimeouts+=1;
		if(bleTimeouts > bleErrorThreshold)	{
			console.log("Excess BLE errors, disconnecting");
			disconnectDevice();
		}
		if(bagSendInProgress == true)	{
			bagsSendFailed();
		}
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
		uiChangeOnConnect();
		setTimeout(startConfigRefresh, 1000);	//Request the current config after connect
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
					}
					if(configRefreshInProgress == true)	{
						configRefreshState = 1;
					}
				break;
				case bleBagUpdateResponse:
					console.log("Bag update response");
					if(bagSendInProgress == true)	{
						bagsSendComplete();
					}
				break;
				case bleScenarioCountResponse:
					numberOfScenarios = responseReceived[2];
					if(numberOfScenarios > 5){numberOfScenarios=5};
					if(configRefreshInProgress == true)	{
						console.log(`Number of scenarios updated to ${numberOfScenarios} refeshing other values`);
						configRefreshState = 2;
					}
				break;
				case bleScenarioNameLengthResponse:
					if(configRefreshInProgress == true)	{
						scenarioNameLength[responseReceived[2]] = responseReceived[3];
						console.log(`Scenario ${responseReceived[2]} name length ${responseReceived[3]} received`);
						configRefreshState = 3;
					}
				break;
				case bleScenarioNameResponse:
					if(configRefreshInProgress == true)	{
						if(responseReceived[3] == configRefreshBlock)	
						{
							if(configRefreshBlock == 0)	{	//It's block 0
								scenarioName[responseReceived[2]] = "";
							}
							for (var i = bleBlockSize * configRefreshBlock; (i < scenarioNameLength[responseReceived[2]]) && (i - (bleBlockSize * configRefreshBlock) < bleBlockSize); i++) {
								scenarioName[responseReceived[2]] += String.fromCharCode(responseReceived[i+4-(bleBlockSize * configRefreshBlock)])
							}
							configRefreshBlock = configRefreshBlock + 1;	//Move on to the next block
							if(bleBlockSize * configRefreshBlock >= scenarioNameLength[responseReceived[2]])	{	//We've had the last block
								console.log(`Scenario ${responseReceived[2]} name received "${scenarioName[responseReceived[2]]}"`);
								configRefreshState = 4;	//Move on to next state
								configRefreshBlock = 0;	//Reset to first block
							} else {
								console.log(`Scenario ${responseReceived[2]} name block ${responseReceived[3]} received`);
							}
						} else {
							console.log(`Scenario ${responseReceived[2]} name WRONG BLOCK ${responseReceived[3]} received`);
						}
					}
				break;
				case bleScenarioNarrativeLengthResponse:
					if(configRefreshInProgress == true)	{
						scenarioNarrativeLength[responseReceived[2]] = responseReceived[3];
						console.log(`Scenario ${responseReceived[2]} narrative length ${responseReceived[3]} received"`);
						configRefreshState = 5;
					}
				break;
				case bleScenarioNarrativeResponse:
					if(configRefreshInProgress == true)	{
						if(responseReceived[3] == configRefreshBlock)	
						{
							if(configRefreshBlock == 0)	{	//It's block 0
								scenarioNarrative[responseReceived[2]] = "";
							}
							for (var i = bleBlockSize * configRefreshBlock; (i < scenarioNarrativeLength[responseReceived[2]]) && (i - (bleBlockSize * configRefreshBlock) < bleBlockSize); i++) {
								scenarioNarrative[responseReceived[2]] += String.fromCharCode(responseReceived[i+4-(bleBlockSize * configRefreshBlock)])
							}
							configRefreshBlock = configRefreshBlock + 1;	//Move on to the next block
							if(bleBlockSize * configRefreshBlock >= scenarioNarrativeLength[responseReceived[2]])	{	//We've had the last block
								console.log(`Scenario ${responseReceived[2]} narrative received "${scenarioNarrative[responseReceived[2]]}"`);
								configRefreshState = 6;	//Move on to next state
								configRefreshBlock = 0;	//Reset to first block
							} else {
								console.log(`Scenario ${responseReceived[2]} narrative block ${responseReceived[3]} received`);
							}
						} else {
							console.log(`Scenario ${responseReceived[2]} narrative WRONG BLOCK ${responseReceived[3]} received`);
						}
					}
				break;
				case bleScenarioAvailableResponse:
					if(configRefreshInProgress == true)	{
						if(responseReceived[3] == 1)	{
							scenarioAvailable[responseReceived[2]] = true;
						} else {
							scenarioAvailable[responseReceived[2]] = false;
						}
						console.log(`Scenario ${responseReceived[2]} availability ${responseReceived[3]} received`);
						configRefreshState = 7;
					}
				break;
				case bleScenarioAvailableBloodTypesResponse:
					if(configRefreshInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} available groups received`);
						scenarioAvailableBloodTypes[responseReceived[2]] = [false, false, false, false, false, false, false, false];
						for (var i = 0; i < responseReceived[3] && i < 8; i++) {
							if(responseReceived[4+i] == 1)	{
								scenarioAvailableBloodTypes[responseReceived[2]][i] = true;
							} else {
								scenarioAvailableBloodTypes[responseReceived[2]][i] = false;
							}
							console.log(`Group ${i} available ${responseReceived[4+i]}`);
						}
						configRefreshState = 8;
					}
				break;
				case bleScenarioBloodTypeResponse:
					if(configRefreshInProgress == true)	{
						scenarioBloodType[responseReceived[2]] = responseReceived[3];
						console.log(`Scenario ${responseReceived[2]} blood type ${responseReceived[3]} received`);
						configRefreshState = 2;
						configRefreshIndex+=1;
						if(configRefreshIndex>=numberOfScenarios)	{	//Stop refreshing
							configRefreshComplete();
						}
					}
				break;
				default:
					console.log("Unknown response");
				}
				bleBusy = false;	//Mark command as received OK
				bleTimeouts = 0;
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
					bleConnected = false;
					configRefreshInProgress = false;
					lastCommand = bleDummyRequest;
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
			window.alert("Bluetooth is not connected.");
		}
	}
}

function onDisconnected(event){
	bleConnected = false;
	configRefreshInProgress = false;
	uiChangeOnDisconnect ();
	console.log('Disconnected');
	lastCommand = bleDummyRequest;
}



