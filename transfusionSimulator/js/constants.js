//Protocol numerical Values

const bleBlockSize = 50;
const bleStateMachineInterval = 150;

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

const bleScenarioCountRequest = 12;		//Ask for scenario count
const bleScenarioCountResponse = bleScenarioCountRequest | 128;

const bleScenarioSortOrderRequest = 13;		//Ask for Sort order
const bleScenarioSortOrderResponse = bleScenarioSortOrderRequest | 128;

const bleScenarioNameLengthRequest = 14;		//Ask for name length
const bleScenarioNameLengthResponse = bleScenarioNameLengthRequest | 128;

const bleScenarioNameRequest = 15;		//Ask for name data
const bleScenarioNameResponse = bleScenarioNameRequest | 128;

const bleScenarioNarrativeLengthRequest = 16;		//Ask for narrative length
const bleScenarioNarrativeLengthResponse = bleScenarioNarrativeLengthRequest | 128;

const bleScenarioNarrativeRequest = 17;		//Ask for narrative data
const bleScenarioNarrativeResponse = bleScenarioNarrativeRequest | 128;

const bleScenarioAvailableRequest = 18;		//Ask for scenario available data
const bleScenarioAvailableResponse = bleScenarioAvailableRequest | 128;

const bleScenarioAvailableBloodTypesRequest = 19;		//Ask for available blood types
const bleScenarioAvailableBloodTypesResponse = bleScenarioAvailableBloodTypesRequest | 128;

const bleScenarioBloodTypeRequest = 20;		//Ask for patient blood type
const bleScenarioBloodTypeResponse = bleScenarioBloodTypeRequest | 128;

const bleScenarioSortOrderUpdateRequest = 21;		//Set name length
const bleScenarioSortOrderUpdateResponse = bleScenarioSortOrderUpdateRequest | 128;

const bleScenarioNameLengthUpdateRequest = 22;		//Set name length
const bleScenarioNameLengthUpdateResponse = bleScenarioNameLengthUpdateRequest | 128;

const bleScenarioNameUpdateRequest = 23;		//Set name data
const bleScenarioNameUpdateResponse = bleScenarioNameUpdateRequest | 128;

const bleScenarioNarrativeLengthUpdateRequest = 24;		//Set narrative length
const bleScenarioNarrativeLengthUpdateResponse = bleScenarioNarrativeLengthUpdateRequest | 128;

const bleScenarioNarrativeUpdateRequest = 25;		//Set narrative data
const bleScenarioNarrativeUpdateResponse = bleScenarioNarrativeUpdateRequest | 128;

const bleScenarioAvailableUpdateRequest = 26;		//Set scenario available data
const bleScenarioAvailableUpdateResponse = bleScenarioAvailableUpdateRequest | 128;

const bleScenarioAvailableBloodTypesUpdateRequest = 27;		//Set available blood types
const bleScenarioAvailableBloodTypesUpdateResponse = bleScenarioAvailableBloodTypesUpdateRequest | 128;

const bleScenarioBloodTypeUpdateRequest = 28;		//Set patient blood type
const bleScenarioBloodTypeUpdateResponse = bleScenarioBloodTypeUpdateRequest | 128;

const bleDummyRequest = 127;		//Dummy value that does nothing and should never be sent
const bleDummyResponse = bleDummyRequest | 128;	//'dummy' response


//UI constants

//const configRefreshButtonObj = document.getElementById("configRefreshButton");
const configSaveButtonObj = document.getElementById("configSaveButton");
const bagTypes1Obj = document.getElementById("bagTypes1");
const bagTypes2Obj = document.getElementById("bagTypes2");
const bagTypes3Obj = document.getElementById("bagTypes3");
const bagTypesPlaceholder = document.getElementById("bagTypesPlaceholder");
const scenarioProgress1 = document.getElementById("scenarioProgress1");
const bag0Obj = document.getElementById("bag0");
const bag1Obj = document.getElementById("bag1");
const bag2Obj = document.getElementById("bag2");
const bag3Obj = document.getElementById("bag3");
const bag4Obj = document.getElementById("bag4");
const bag5Obj = document.getElementById("bag5");
const bag6Obj = document.getElementById("bag6");
const bag7Obj = document.getElementById("bag7");
const sendBagsButtonObj = document.getElementById("sendBagsButton");
const scenarioTableRow = document.getElementById("scenarioTable");
const scenarioTableObj = document.getElementById("scenarioTableItself");
const scenarioTablePlaceholderObj = document.getElementById("scenarioTablePlaceholder");
const scenarioCancelButtonObj = document.getElementById("scenarioCancelButton");
const scenarioSendButtonObj = document.getElementById("scenarioSendButton");
const connectButton = document.getElementById("connectBleButton");
const disconnectButton = document.getElementById("disconnectBleButton");
const bleStateContainer = document.getElementById("bleState");
