const documentElement = document.getElementById('document');

function showScenario(scenarioId)
{
	documentElement.innerHTML = `<iframe src="docs/${id}/" title="Mission documents" width="100%" height="800" frameborder="0" style="border:1px solid black;" ></iframe>`;
}