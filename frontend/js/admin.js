function loadIncludes() {
	var includeBlocks = document.querySelectorAll('[data-include]');

	includeBlocks.forEach(function (block) {
		var filePath = block.getAttribute('data-include');

		if (!filePath) {
			return;
		}

		fetch(filePath)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Khong the tai file include: ' + filePath);
				}
				return response.text();
			})
			.then(function (html) {
				block.innerHTML = html;
			})
			.catch(function (error) {
				console.error(error);
			});
	});
}

document.addEventListener('DOMContentLoaded', function () {
	loadIncludes();
});
