
//Define BLE Device Specs
var deviceName ='TransfusionSimulator';
var bleService = '5eaf2551-5714-48e7-bcb4-249c74c56839';
var commandCharacteristic = '3e1f6333-14d3-4018-8271-c28be9d4fdea';
var responseCharacteristic= 'd4bc86c5-afd3-4882-ac67-954e7857b73b';

//Global Variables to Handle Bluetooth
var bleServer;
var bleServiceFound;
var responseCharacteristicFound;


var bleConnected = false;	//Simple mark of connection status
var bleDevice;
var bleBusy = false;
var bleTimeouts = 0;
const bleErrorThreshold = 20;
var sequenceNumber = 1;	//Every response includes the 'sequence number' (0-255) of the command it's responding to
var lastSequenceNumber = 0;	//Checks the packet coming back
var lastCommand = bleDummyRequest;

//Bag data
var remoteBags = new Uint8Array(8);

//Scenario data
var numberOfScenarios = 0;
const scenarioSortOrder = [];
const scenarioName = [];
const scenarioNameLength = [];
const scenarioNarrative = [];
const scenarioNarrativeLength = [];
const scenarioAvailable = [];
const scenarioBloodType = [];
const scenarioAvailableBloodTypes = [];

const sortedScenarioIndex = [];	//An index in sort order arrangement

//Full config refresh
var configRefreshInProgress = false;
var configRefreshState = 0;
var configRefreshIndex = 0;
var configRefreshBlock = 0;
var configRefreshHandle;	//Handle for interval function

//Bag send
var bagSendInProgress = false;

//Scenario send
var lastClickedScenario = 255;
var scenarioSendInProgress = false;
var scenarioSendState = 0;
var scenarioSendIndex = 0;
var scenarioSendBlock = 0;
var scenarioSendHandle;	//Handle for interval function

//Scenario swap order
var scenarioSwapOrderInProgress = false;
var scenarioSwapState = 0;
var scenarioSwapIndex1 = 0;
var scenarioSwapIndex2 = 0;
var scenarioSwapHandle;	//Handle for interval function


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

/* Scenario swapping */

function bleManageSwappingScenarios()	{
	if(scenarioSwapOrderInProgress == true)	{
		if(bleBusy == false)	{
			if(scenarioSwapState == 0)	{
				console.log("Sending scenario swap update");
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioSwapOrderUpdateRequest,sequenceNumber,scenarioSwapIndex1,scenarioSwapIndex2);
				bleSendCommand(bleBagsscenarioSendPacket);
			}
		} else {
			console.log("Scenario swap waiting, BLE busy");
		}
	}
}


/* Scenario sending */

function bleManageSendingScenario()	{
	if(scenarioSendInProgress == true)	{
		if(bleBusy == false)	{
			if(scenarioSendState == 0)	{
				console.log("Sending sort order update");
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioSortOrderUpdateRequest,sequenceNumber,scenarioSendIndex,scenarioSortOrder[scenarioSendIndex]);
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 1)	{
				console.log("Sending name length update");
				scenarioNameLength[scenarioSendIndex] = document.getElementById("scenarioName").value.length;
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioNameLengthUpdateRequest,sequenceNumber,scenarioSendIndex,scenarioNameLength[scenarioSendIndex]);
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 2)	{
				console.log("Sending name data update");
				if(scenarioSendBlock == 0)	{
					scenarioName[scenarioSendIndex] = document.getElementById("scenarioName").value;
				}
				const bleBagsscenarioSendPacket = new Uint8Array(bleBlockSize+4);
				bleBagsscenarioSendPacket[0] = bleScenarioNameUpdateRequest;
				bleBagsscenarioSendPacket[1] = sequenceNumber;
				bleBagsscenarioSendPacket[2] = scenarioSendIndex;
				bleBagsscenarioSendPacket[3] = scenarioSendBlock;
				const blockStart = bleBlockSize * scenarioSendBlock;
				for (var i = blockStart; i < scenarioNameLength[scenarioSendIndex] && i-blockStart < bleBlockSize; i++) {
						bleBagsscenarioSendPacket[4+i-blockStart] = scenarioName[scenarioSendIndex].charCodeAt(i);
				}
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 3)	{
				console.log("Sending narrative length update");
				scenarioNarrativeLength[scenarioSendIndex] = document.getElementById("scenarioNarrative").value.length; 
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioNarrativeLengthUpdateRequest,sequenceNumber,scenarioSendIndex,scenarioNarrativeLength[scenarioSendIndex]);
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 4)	{
				console.log("Sending narrative data update");
				if(scenarioSendBlock == 0)	{
					scenarioNarrative[scenarioSendIndex] = document.getElementById("scenarioNarrative").value;
				}
				const bleBagsscenarioSendPacket = new Uint8Array(bleBlockSize+4);
				bleBagsscenarioSendPacket[0] = bleScenarioNarrativeUpdateRequest;
				bleBagsscenarioSendPacket[1] = sequenceNumber;
				bleBagsscenarioSendPacket[2] = scenarioSendIndex;
				bleBagsscenarioSendPacket[3] = scenarioSendBlock;
				const blockStart = bleBlockSize * scenarioSendBlock;
				for (var i = blockStart; i < scenarioNarrativeLength[scenarioSendIndex] && i-blockStart < bleBlockSize; i++) {
						bleBagsscenarioSendPacket[4+i-blockStart] = scenarioNarrative[scenarioSendIndex].charCodeAt(i);
				}
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 5)	{
				console.log("Sending availability update");
				scenarioAvailable[scenarioSendIndex] = document.getElementById("available").checked;
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioAvailableUpdateRequest,sequenceNumber,scenarioSendIndex,scenarioAvailable[scenarioSendIndex]);
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 6)	{
				console.log("Sending available blood types update");
				const bagAvailability = new Uint8Array(8);
				for (var i = 0; i < 8; i++) {
					if(document.getElementById(`type${i}`).checked == true)	{
						bagAvailability[i] = 1;
						scenarioAvailableBloodTypes[scenarioSendIndex][i] = true;
					} else {
						bagAvailability[i] = 0;
						scenarioAvailableBloodTypes[scenarioSendIndex][i] = false;
					}
				}
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioAvailableBloodTypesUpdateRequest,sequenceNumber,scenarioSendIndex,bagAvailability[0],bagAvailability[1],bagAvailability[2],bagAvailability[3],bagAvailability[4],bagAvailability[5],bagAvailability[6],bagAvailability[7]);
				bleSendCommand(bleBagsscenarioSendPacket);
			} else if(scenarioSendState == 7)	{
				console.log("Sending patient blood group update");
				scenarioBloodType[scenarioSendIndex] = document.getElementById("recipientBloodType").value;
				const bleBagsscenarioSendPacket = Uint8Array.of(bleScenarioBloodTypeUpdateRequest,sequenceNumber,scenarioSendIndex,scenarioBloodType[scenarioSendIndex]);
				bleSendCommand(bleBagsscenarioSendPacket);
			} else {
				console.log(`Scenario send unknown state`);
			}
		} else {
			console.log("Scenario update waiting, BLE busy");
		}
	}
}

/* Configuration refresn */


function bleManageConfigRefresh()	{
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
				console.log(`Requesting scenario ${configRefreshIndex} sort order update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioSortOrderRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 3)	{
				console.log(`Requesting scenario ${configRefreshIndex} name length update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNameLengthRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 4)	{
				console.log(`Requesting scenario ${configRefreshIndex} name update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNameRequest,sequenceNumber,configRefreshIndex,configRefreshBlock);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 5)	{
				console.log(`Requesting scenario ${configRefreshIndex} narrative length update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNarrativeLengthRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 6)	{
				console.log(`Requesting scenario ${configRefreshIndex} narrative update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioNarrativeRequest,sequenceNumber,configRefreshIndex,configRefreshBlock);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 7)	{
				console.log(`Requesting scenario ${configRefreshIndex} availability update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioAvailableRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 8)	{
				console.log(`Requesting scenario ${configRefreshIndex} groups update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioAvailableBloodTypesRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else if(configRefreshState == 9)	{
				console.log(`Requesting scenario ${configRefreshIndex} blood type update`);
				const bleScenarioUpdateRequestPacket = Uint8Array.of(bleScenarioBloodTypeRequest,sequenceNumber,configRefreshIndex);
				bleSendCommand(bleScenarioUpdateRequestPacket);
				updateRefreshStatus();
			} else {
				console.log(`Requesting scenario ${configRefreshIndex} unknown state`);
			}
		} else {
			console.log("Scenario update waiting, BLE busy");
		}
	}
}



/* Bag admin */

function bleSendBags()	{
	if(bleBusy == false)	{
		console.log("Sending bags");
		const bleSendBagsPacket = Uint8Array.of(bleBagUpdateRequest,sequenceNumber,8,
			bag0Obj.value,
			bag1Obj.value,
			bag2Obj.value,
			bag3Obj.value,
			bag4Obj.value,
			bag5Obj.value,
			bag6Obj.value,
			bag7Obj.value
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
		} else if(scenarioSwapOrderInProgress == true)	{
			scenarioSwapFailed();
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
	/*
	navigator.bluetooth.requestDevice({
		filters: [{name: deviceName}],
		optionalServices: [bleService]
	})
	*/
	navigator.bluetooth.requestDevice({
		filters: [{services: [bleService]}]
	})
	.then(device => {
		bleDevice = device.name;
		console.log('Device Selected:', bleDevice);
		bleStateContainer.innerHTML = 'Connected to ' + bleDevice;
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
		transactionErrors += 1;
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
					//if(numberOfScenarios > 5){numberOfScenarios=5};
					if(configRefreshInProgress == true)	{
						console.log(`Number of scenarios updated to ${numberOfScenarios} refeshing other values`);
						configRefreshState = 2;
					}
				break;
				case bleScenarioSortOrderResponse:
					if(configRefreshInProgress == true)	{
						scenarioSortOrder[responseReceived[2]] = responseReceived[3];
						console.log(`Scenario ${responseReceived[2]} sort order ${responseReceived[3]} received`);
						configRefreshState = 3;
					}
				break;
				case bleScenarioNameLengthResponse:
					if(configRefreshInProgress == true)	{
						scenarioNameLength[responseReceived[2]] = responseReceived[3];
						console.log(`Scenario ${responseReceived[2]} name length ${responseReceived[3]} received`);
						configRefreshState = 4;
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
								configRefreshState = 5;	//Move on to next state
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
						configRefreshState = 6;
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
								configRefreshState = 7;	//Move on to next state
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
						configRefreshState = 8;
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
						configRefreshState = 9;
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
				case bleScenarioSortOrderUpdateResponse:
					if(scenarioSendInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} update sort order OK`);
						scenarioSendState = 1;
					}
				break;
				case bleScenarioNameLengthUpdateResponse:
					if(scenarioSendInProgress == true)	{
						console.log(`Scenario ${responseReceived[2]} update name length OK`);
						scenarioSendState = 2;
					}
				break;
				case bleScenarioNameUpdateResponse:
					if(scenarioSendInProgress == true)	{
						scenarioSendBlock += 1;	//Move on to next block
						if(bleBlockSize * scenarioSendBlock >= scenarioNameLength[responseReceived[2]])	{
							scenarioSendBlock = 0;
							scenarioSendState = 3;
							console.log(`Scenario ${responseReceived[2]} update name data finished OK`);
						} else {
							console.log(`Scenario ${responseReceived[2]} update name block ${responseReceived[3]} data OK`);
						}
					}
				break;
				case bleScenarioNarrativeLengthUpdateResponse:
					if(scenarioSendInProgress == true)	{
						console.log(`Scenario update narrative length OK`);
						scenarioSendState = 4;
					}
				break;
				case bleScenarioNarrativeUpdateResponse:
					if(scenarioSendInProgress == true)	{
						scenarioSendBlock += 1;	//Move on to next block
						if(bleBlockSize * scenarioSendBlock >= scenarioNarrativeLength[responseReceived[2]])	{
							scenarioSendBlock = 0;
							scenarioSendState = 5;
							console.log(`Scenario ${responseReceived[2]} update narrative data finished OK`);
						} else {
							console.log(`Scenario ${responseReceived[2]} update narrative block ${responseReceived[3]} data OK`);
						}
					}
				break;
				case bleScenarioAvailableUpdateResponse:
					if(scenarioSendInProgress == true)	{
						console.log(`Scenario update availability OK`);
						scenarioSendState = 6;
					}
				break;
				case bleScenarioAvailableBloodTypesUpdateResponse:
					if(scenarioSendInProgress == true)	{
						console.log(`Scenario update availabile blood types OK`);
						scenarioSendState = 7;
					}
				break;
				case bleScenarioBloodTypeUpdateResponse:
					if(scenarioSendInProgress == true)	{
						console.log(`Scenario update patient blood type OK`);
						scenarioSendComplete();
					}
				break;
				case bleScenarioSwapOrderUpdateResponse:
					if(scenarioSwapOrderInProgress == true)	{
						console.log(`Scenario order swap OK`);
						scenarioSwapOrderComplete();
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
			transactionErrors += 1;
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



