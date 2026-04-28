function uiBleTransactionInProgress()	{
	configRefreshButtonObj.disabled = true;
	configRefreshButtonObj.className = "u-full-width";
	configSaveButtonObj.disabled = true;
	configSaveButtonObj.className = "u-full-width";
}
function uiBleTransactionComplete()	{
	configRefreshButtonObj.disabled = false;
	configRefreshButtonObj.className = "button-primary u-full-width";
	configSaveButtonObj.disabled = false;
	configSaveButtonObj.className = "button-primary u-full-width";
}
/*

	Bags table

*/
function showBagTypesForm()	{
	document.getElementById("bagTypes1").style.display = "block";	//Show bag options
	document.getElementById("bagTypes2").style.display = "block";	//Show bag options
	document.getElementById("bagTypes3").style.display = "block";	//Show bag options
	document.getElementById("bagTypesPlaceholder").style.display = "none";	//Hide bag placeholder
}
function hideBagTypesForm()	{
	document.getElementById("bagTypes1").style.display = "none";	//Show bag options
	document.getElementById("bagTypes2").style.display = "none";	//Show bag options
	document.getElementById("bagTypes3").style.display = "none";	//Show bag options
	document.getElementById("scenarioProgress1").innerHTML = "Waiting for bag data";
	document.getElementById("bagTypesPlaceholder").style.display = "block";	//Hide bag placeholder
}
function disableBagTypesForm()	{
	document.getElementById("bag0").disabled = true;
	document.getElementById("bag1").disabled = true;
	document.getElementById("bag2").disabled = true;
	document.getElementById("bag3").disabled = true;
	document.getElementById("bag4").disabled = true;
	document.getElementById("bag5").disabled = true;
	document.getElementById("bag6").disabled = true;
	document.getElementById("bag7").disabled = true;
	document.getElementById("sendBagsButton").disabled = true;
	document.getElementById("sendBagsButton").className = "u-full-width";
}
function enableBagTypesForm()	{
	document.getElementById("bag0").disabled = false;
	document.getElementById("bag1").disabled = false;
	document.getElementById("bag2").disabled = false;
	document.getElementById("bag3").disabled = false;
	document.getElementById("bag4").disabled = false;
	document.getElementById("bag5").disabled = false;
	document.getElementById("bag6").disabled = false;
	document.getElementById("bag7").disabled = false;
	document.getElementById("sendBagsButton").disabled = false;
	document.getElementById("sendBagsButton").className = "button-primary u-full-width";
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
// Bag send button
//document.getElementById('configSaveButton').addEventListener('click', bleSaveBags);

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

function showScenarioTable()	{
	document.getElementById("scenarioTable").style.display = "block";	//Show scenario table
	document.getElementById('scenarioTableItself').style.height='100px';
	document.getElementById("scenarioTablePlaceholder").style.display = "none";	//Hide scenario table placeholder
}

function hideScenarioTable()	{
	document.getElementById("scenarioTable").style.display = "none";	//Show scenario table
	document.getElementById("scenarioTablePlaceholder").style.display = "block";	//Hide scenario table placeholder
	document.getElementById("scenarioProgress2").innerHTML = "Waiting for scenario data";
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
		//cell0.innerHTML = `Name ${i}`;
		cell0.innerHTML = scenarioName[index];
		if(i > 0)	{
			cell1.innerHTML = "&#8593;";
		}
		if(i < numberOfScenarios -1)	{
			cell2.innerHTML = "&#8595;";
		}
		cell0.addEventListener("click", function(){tableOnClick(`${index}`)});
		row.id = `scenario${index}`;
		row.backgroundColor="red";
	}
}

function tableOnClick(row)	{
	if(row != lastClickedScenario)	{
		console.log(`Scenario ${row} clicked`);
		showScenarioForm();
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
}

function updateRefreshStatus()	{
	const percentage = Math.round(100*((configRefreshIndex*7)+(configRefreshState-2))/(7 * numberOfScenarios));
	document.getElementById("scenarioProgress1").innerHTML=`Updating - ${percentage}%`;
	document.getElementById("scenarioProgress2").innerHTML=`Updating - ${percentage}%`;
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
}

function hideScenarioForm()	{
	document.getElementById("scenarioForm1").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm2").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm3").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm4").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm5").style.display = "none";	//Show scenario form
	document.getElementById("scenarioForm6").style.display = "none";	//Show scenario form
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
	document.getElementById("scenarioSendButton").disabled = false;
	document.getElementById("scenarioSendButton").className = "button-primary u-full-width";
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
	document.getElementById("scenarioSendButton").disabled = true;
	document.getElementById("scenarioSendButton").className = "u-full-width";
}

// Scenario send button
document.getElementById('scenarioSendButton').addEventListener('click', startSendingScenario);

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
	configRefreshButtonObj.disabled = true;
	configRefreshButtonObj.className = "u-full-width";
	configSaveButtonObj.disabled = true;
	configSaveButtonObj.className = "u-full-width";
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
	configRefreshButtonObj.disabled = false;
	configRefreshButtonObj.className = "button-primary u-full-width";
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
document.getElementById('configRefreshButton').addEventListener('click', startConfigRefresh);

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
	clearInterval(configRefreshHandle);
	console.log("Config update process finished");
}


//document.getElementById('saveButton').addEventListener('click', bleRequestSaveConfig);

//document.getElementById('restartButton').addEventListener('click', bleRequestRestart);
