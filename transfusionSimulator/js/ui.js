function uiBleTransactionInProgress	{
	document.getElementById("configRefreshButton").disabled = true;
	document.getElementById("configRefreshButton").className = "u-full-width";
	document.getElementById("configSaveButton").disabled = true;
	document.getElementById("configSaveButton").className = "u-full-width";
}
function uiBleTransactionComplete	{
	document.getElementById("configRefreshButton").disabled = false;
	document.getElementById("configRefreshButton").className = "button-primary u-full-width";
	document.getElementById("configSaveButton").disabled = false;
	document.getElementById("configSaveButton").className = "button-primary u-full-width";
}
function showScenarioTable()	{
	document.getElementById("scenarioTable").style.display = "block";	//Show scenario table
	document.getElementById('scenarioTableItself').style.height='100px';
	document.getElementById("scenarioTablePlaceholder").style.display = "none";	//Hide scenario table placeholder
}

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
function uiChangeOnDisconnect ()	{
	bleStateContainer.innerHTML = "Device Disconnected";
	bleStateContainer.style.color = "#d13a30";
	document.getElementById("disconnectBleButton").className = "button-primary u-full-width";
	document.getElementById("disconnectBleButton").disabled = true;
	document.getElementById("disconnectBleButton").className = "u-full-width";
	document.getElementById("configRefreshButton").disabled = true;
	document.getElementById("configRefreshButton").className = "u-full-width";
	document.getElementById("configSaveButton").disabled = true;
	document.getElementById("configSaveButton").className = "u-full-width";
}

// Connect Button (search for BLE Devices only if BLE is available)
connectButton.addEventListener('click', (event) => {
	if (isWebBluetoothEnabled()){
		connectToDevice();
	}
});

// Disconnect Button
disconnectButton.addEventListener('click', disconnectDevice);

// Scenario send button
document.getElementById('scenarioSendButton').addEventListener('click', startSendingScenario);

// Config refresh button
document.getElementById('configRefreshButton').addEventListener('click', startConfigRefresh);

// Bag send button
document.getElementById('configSaveButton').addEventListener('click', bleSaveBags);

//document.getElementById('saveButton').addEventListener('click', bleRequestSaveConfig);

//document.getElementById('restartButton').addEventListener('click', bleRequestRestart);
