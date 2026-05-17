function openTab(tabEvent, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  tabEvent.currentTarget.className += " active";
}

function checkAdminPassword()
{
	if(document.getElementById('darkmode').value == "scallywag")
	{
		showAdminButton();
	}
	else
	{
		hideAdminButton();
	}
}

function showAdminButton()	{
	document.getElementById('adminButton').style.display = "none";
}
function hideAdminButton()	{
	document.getElementById('adminButton').style.display = "block";
}

function clickButton1() {
	openTab(event, 'DocumentsTab');
	document.getElementById('documentsButton').classList.add('button-primary');
	document.getElementById('mapButton').classList.remove('button-primary');
	document.getElementById('settingsButton').classList.remove('button-primary');	
	document.getElementById('adminButton').classList.remove('button-primary');
}
function clickButton2()	{
	openTab(event, 'MapTab');
	document.getElementById('documentsButton').classList.remove('button-primary');
	document.getElementById('mapButton').classList.add('button-primary');
	document.getElementById('settingsButton').classList.remove('button-primary');
	document.getElementById('adminButton').classList.remove('button-primary');
}
function clickButton3()	{
	openTab(event, 'SettingsTab');
	document.getElementById('documentsButton').classList.remove('button-primary');
	document.getElementById('mapButton').classList.remove('button-primary');
	document.getElementById('settingsButton').classList.add('button-primary');
	document.getElementById('adminButton').classList.remove('button-primary');
}
function clickButton4()	{
	openTab(event, 'AdminTab');
	document.getElementById('documentsButton').classList.remove('button-primary');
	document.getElementById('mapButton').classList.remove('button-primary');
	document.getElementById('settingsButton').classList.remove('button-primary');
	document.getElementById('adminButton').classList.add('button-primary');
}