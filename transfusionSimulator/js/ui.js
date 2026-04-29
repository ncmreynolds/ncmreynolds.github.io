function uiBleTransactionInProgress()	{
	//configRefreshButtonObj.disabled = true;
	//configRefreshButtonObj.className = "u-full-width";
	configSaveButtonObj.disabled = true;
	configSaveButtonObj.className = "u-full-width";
}
function uiBleTransactionComplete()	{
	//configRefreshButtonObj.disabled = false;
	//configRefreshButtonObj.className = "button-primary u-full-width";
	configSaveButtonObj.disabled = false;
	configSaveButtonObj.className = "button-primary u-full-width";
}
/*

	Bags table

*/
function showBagTypesPlaceholder()	{
	bagTypesPlaceholder.style.display = "block";	//Show bag placeholder
}
function hideBagTypesPlaceholder()	{
	bagTypesPlaceholder.style.display = "none";	//Hide bag placeholder
}
function showBagTypesForm()	{
	bagTypes1Obj.style.display = "block";	//Show bag options
	bagTypes2Obj.style.display = "block";	//Show bag options
	bagTypes3Obj.style.display = "block";	//Show bag options
	bagTypesPlaceholder.style.display = "none";	//Hide bag placeholder
}
function hideBagTypesForm()	{
	bagTypes1Obj.style.display = "none";	//Show bag options
	bagTypes2Obj.style.display = "none";	//Show bag options
	bagTypes3Obj.style.display = "none";	//Show bag options
	scenarioProgress1.innerHTML = "Waiting for bag data";
}
function disableBagTypesForm()	{
	bag0Obj.disabled = true;
	bag1Obj.disabled = true;
	bag2Obj.disabled = true;
	bag3Obj.disabled = true;
	bag4Obj.disabled = true;
	bag5Obj.disabled = true;
	bag6Obj.disabled = true;
	bag7Obj.disabled = true;
	sendBagsButtonObj.disabled = true;
	sendBagsButtonObj.className = "u-full-width";
}
function enableBagTypesForm()	{
	bag0Obj.disabled = false;
	bag1Obj.disabled = false;
	bag2Obj.disabled = false;
	bag3Obj.disabled = false;
	bag4Obj.disabled = false;
	bag5Obj.disabled = false;
	bag6Obj.disabled = false;
	bag7Obj.disabled = false;
	sendBagsButtonObj.disabled = false;
	sendBagsButtonObj.className = "button-primary u-full-width";
}

function updateBagTypesForm()	{
	for (var i = 0; i < 8; i++) {
		var bag = document.getElementById(`bag${i}`);
		if(remoteBags[i] < 9)	{
			bag.value = `${remoteBags[i]}`;
			bag.disabled = false;
		} else {
			bag.value = "8";
			bag.disabled = true;
		}
		console.log(`Bag ${i} type ${remoteBags[i]}`);
	}
}

// Bag send button
document.getElementById('sendBagsButton').addEventListener('click', startSendingBags);

function startSendingBags()	{
	if(bagSendInProgress == false)	{
		bagSendInProgress = true;
		uiBleTransactionInProgress();
		disableBagTypesForm();
		bleSendBags();
	}
}

function bagsSendComplete()	{
	bagSendInProgress = false;
	uiBleTransactionComplete();
	enableBagTypesForm();
	console.log(`Sent bags`);
}

function bagsSendFailed()	{
	bagSendInProgress = false;
	uiBleTransactionComplete();
	enableBagTypesForm();
	console.log(`Send bags failed`);
	window.alert("Bag send failed!");
}

/*

	Scenario table

*/
function showScenarioTablePlaceholder()	{
	scenarioTablePlaceholderObj.style.display = "block";	//Show scenario table placeholder
	scenarioProgress2.innerHTML = "Waiting for scenario data";
}
function hideScenarioTablePlaceholder()	{
	scenarioTablePlaceholderObj.style.display = "none";	//Hide scenario table placeholder
}
function showScenarioTable()	{
	scenarioTableRow.style.display = "block";	//Show scenario table
	scenarioTableObj.style.height='100px';
}
function hideScenarioTable()	{
	scenarioTableRow.style.display = "none";	//Show scenario table
}
function updateScenarioTable()	{
	var table = document.getElementById("scenarioTableItself");
	var rowCount = table.rows.length;	//This includes the header which is row 0
	for (var i = 0; i < rowCount-1; i++) {
		table.deleteRow(1);	//Delete row 1 which skips the header
	}
	for (var i = 0; i < numberOfScenarios; i++) {
		var row = table.insertRow(i+1);
		const index = i;
		var cell0 = row.insertCell(0);
		var cell1 = row.insertCell(1);
		var cell2 = row.insertCell(2);
		cell0.innerHTML = scenarioName[index];
		cell0.addEventListener("click", function(){tableOnClick(`${index}`)});
		if(i > 0)	{
			cell1.innerHTML = "&#8593;";
			cell1.addEventListener("click", function(){tableOnMoveUpClicked(`${index}`)});
		}
		if(i < numberOfScenarios -1)	{
			cell2.innerHTML = "&#8595;";
			cell2.addEventListener("click", function(){tableOnMoveDownClicked(`${index}`)});
		}
		row.id = `scenario${index}`;
	}
}
function tableOnClick(row)	{
	console.log(`Scenario ${row} selected`);
	showScenarioForm();
	hideScenarioTable();
	if(lastClickedScenario != 255)	{
		document.getElementById(`scenario${lastClickedScenario}`).backgroundColor="white";
	}
	document.getElementById(`scenario${row}`).backgroundColor="red";
	lastClickedScenario = row;
	//Load in the data
	document.getElementById("scenarioName").value = scenarioName[row];
	document.getElementById("scenarioNarrative").value = scenarioNarrative[row];
	document.getElementById("available").checked = scenarioAvailable[row];
	for (var i = 0; i < 8; i++) {
		document.getElementById(`type${i}`).checked = scenarioAvailableBloodTypes[row][i];
	}
	document.getElementById("recipientBloodType").value = scenarioBloodType[row];
}
function tableOnMoveDownClicked(row)	{
	console.log(`Scenario ${row} shuffle down`);
}
function tableOnMoveUpClicked(row)	{
	console.log(`Scenario ${row} shuffle up`);
}
function updateRefreshStatus()	{
	const percentage = Math.round(100*((configRefreshIndex*7)+(configRefreshState-2))/(7 * numberOfScenarios));
	scenarioProgress1.innerHTML=`Updating - ${percentage}%`;
	scenarioProgress2.innerHTML=`Updating - ${percentage}%`;
}

/*

	Scenario from

*/

function showScenarioForm()	{
	document.getElementById("scenarioForm1").style.display = "block";	//Show scenario form
	document.getElementById("scenarioForm2").style.display = "block";	//Show scenario form
	document.getElementById("scenarioForm3").style.display = "block";	//Show scenario form
	document.getElementById("scenarioForm4").style.display = "block";	//Show scenario form
	document.getElementById("scenarioForm5").style.display = "block";	//Show scenario form
	document.getElementById("scenarioForm6").style.display = "block";	//Show scenario form
	document.getElementById("scenarioForm7").style.display = "block";	//Show scenario form
}

function hideScenarioForm()	{
	document.getElementById("scenarioForm1").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm2").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm3").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm4").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm5").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm6").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm7").style.display = "none";	//Show scenario form
}
function enableScenarioForm()	{
	document.getElementById("scenarioName").disabled = false;
	document.getElementById("available").disabled = false;
	document.getElementById("scenarioNarrative").disabled = false;
	document.getElementById("type0").disabled = false;
	document.getElementById("type1").disabled = false;
	document.getElementById("type2").disabled = false;
	document.getElementById("type3").disabled = false;
	document.getElementById("type4").disabled = false;
	document.getElementById("type5").disabled = false;
	document.getElementById("type6").disabled = false;
	document.getElementById("type7").disabled = false;
	document.getElementById("recipientBloodType").disabled = false;
	scenarioSendButtonObj.disabled = false;
	scenarioSendButtonObj.className = "button-primary u-full-width";
	document.getElementById("scenarioCancelButton").disabled = false;
	document.getElementById("scenarioCancelButton").className = "button-primary u-full-width";
}
function disableScenarioForm()	{
	document.getElementById("scenarioName").disabled = true;
	document.getElementById("available").disabled = true;
	document.getElementById("scenarioNarrative").disabled = true;
	document.getElementById("type0").disabled = true;
	document.getElementById("type1").disabled = true;
	document.getElementById("type2").disabled = true;
	document.getElementById("type3").disabled = true;
	document.getElementById("type4").disabled = true;
	document.getElementById("type5").disabled = true;
	document.getElementById("type6").disabled = true;
	document.getElementById("type7").disabled = true;
	document.getElementById("recipientBloodType").disabled = true;
	scenarioSendButtonObj.disabled = true;
	scenarioSendButtonObj.className = "u-full-width";
	document.getElementById("scenarioCancelButton").disabled = true;
	document.getElementById("scenarioCancelButton").className = "u-full-width";
}

// Scenario send button
scenarioSendButtonObj.addEventListener('click', startSendingScenario);
scenarioCancelButtonObj.addEventListener('click', function()	{
		hideScenarioForm();
		showScenarioTable();
	}
);

function startSendingScenario()	{
	if(scenarioSendInProgress == false)	{
		scenarioSendInProgress = true;
		scenarioSendState = 0;
		scenarioSendIndex = lastClickedScenario;
		uiBleTransactionInProgress();
		disableScenarioForm();
		disableBagTypesForm();
		console.log(`Sending scenario ${scenarioSendIndex}`);
		scenarioSendHandle = setInterval(bleManageSendingScenario, bleStateMachineInterval);
	} else {
		console.log("Already sending scenario");
	}
}

function scenarioSendComplete()	{
	if(scenarioSendInProgress == true)	{
		scenarioSendInProgress = false;
		scenarioSendState = 0;
		scenarioSendIndex = lastClickedScenario;
		uiBleTransactionComplete();
		enableScenarioForm();
		enableBagTypesForm();
		updateScenarioTable();
		hideScenarioForm();
		showScenarioTable();
		clearInterval(scenarioSendHandle);
		console.log(`Sent scenario ${scenarioSendIndex}`);
	} else {
		console.log("Scenario send not started");
	}
}

/*

	Disconnect

*/

function uiChangeOnDisconnect ()	{
	bleStateContainer.innerHTML = "Device Disconnected";
	bleStateContainer.style.color = "#d13a30";
	document.getElementById("disconnectBleButton").className = "button-primary u-full-width";
	document.getElementById("disconnectBleButton").disabled = true;
	document.getElementById("disconnectBleButton").className = "u-full-width";
	//configRefreshButtonObj.disabled = true;
	//configRefreshButtonObj.className = "u-full-width";
	configSaveButtonObj.disabled = true;
	configSaveButtonObj.className = "u-full-width";
	hideScenarioForm();
	hideScenarioTable();
	hideBagTypesForm();
}

// Disconnect Button
disconnectButton.addEventListener('click', disconnectDevice);

/*

	Connect

*/

function uiChangeOnConnect()	{
	document.getElementById("disconnectBleButton").className = "u-full-width";
	document.getElementById("disconnectBleButton").disabled = false;
	document.getElementById("disconnectBleButton").className = "button-primary u-full-width";
	//configRefreshButtonObj.disabled = false;
	//configRefreshButtonObj.className = "button-primary u-full-width";
	configSaveButtonObj.disabled = false;
	configSaveButtonObj.className = "button-primary u-full-width";
}


// Connect Button (search for BLE Devices only if BLE is available)
connectButton.addEventListener('click', (event) => {
	if (isWebBluetoothEnabled()){
		connectToDevice();
	}
});

// Config refresh button
//configRefreshButtonObj.addEventListener('click', startConfigRefresh);

function startConfigRefresh()	{
	if(configRefreshInProgress == false)	{
		configRefreshInProgress = true;
		configRefreshState = 0;
		configRefreshIndex = 0;
		uiBleTransactionInProgress();
		hideBagTypesForm();
		disableBagTypesForm();
		hideScenarioTable();
		hideScenarioForm();
		disableScenarioForm();
		showBagTypesPlaceholder();
		showScenarioTablePlaceholder();
		console.log("Starting config update process");
		configRefreshHandle = setInterval(bleManageConfigRefresh, bleStateMachineInterval);
	}
}

function configRefreshComplete()	{
	configRefreshInProgress = false;
	configRefreshState = 0;
	configRefreshIndex = 0;
	showBagTypesForm();
	enableBagTypesForm();
	updateBagTypesForm();
	updateScenarioTable();
	showScenarioTable();
	enableScenarioForm();
	uiBleTransactionComplete();
	hideBagTypesPlaceholder();
	hideScenarioTablePlaceholder();
	clearInterval(configRefreshHandle);
	console.log("Config update process finished");
}

// Configuration save button
configSaveButtonObj.addEventListener('click', 
	function(){
		if(confirm("Simulator will save configuration and reboot!"))	{
			bleRequestSaveConfig();
		}
	}
);

//document.getElementById('saveButton').addEventListener('click', bleRequestSaveConfig);

//document.getElementById('restartButton').addEventListener('click', bleRequestRestart);
