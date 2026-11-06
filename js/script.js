// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const imageDialog = document.getElementById('imageDialog');
const closeDialogButton = document.getElementById('closeDialogButton');
const dialogImage = document.getElementById('dialogImage');
const dialogTitle = document.getElementById('dialogTitle');
const dialogDate = document.getElementById('dialogDate');
const dialogExplanation = document.getElementById('dialogExplanation');

// Use your NASA API key here. DEMO_KEY works for trying out the app.
const apiKey = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Request new images when the user clicks the button.
getImagesButton.addEventListener('click', getSpaceImages);
closeDialogButton.addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', (event) => {
	if (event.target === imageDialog) {
		imageDialog.close();
	}
});

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		gallery.textContent = 'Choose a valid start and end date.';
		return;
	}

	const loadingMessage = document.createElement('p');
	loadingMessage.className = 'gallery-status';
	loadingMessage.setAttribute('role', 'status');
	loadingMessage.textContent = 'Loading your space images...';
	gallery.replaceChildren(loadingMessage);
	getImagesButton.disabled = true;

	try {
		// Send the selected dates to NASA's APOD API.
		const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA could not return images for those dates. Please try again.');
		}

		const images = await response.json();
		showSpaceImages(images);
	} catch (error) {
		gallery.textContent = error.message;
	} finally {
		getImagesButton.disabled = false;
	}
}

function showSpaceImages(images) {
	gallery.replaceChildren();

	// Some APOD entries are videos, so keep only entries with an image URL.
	const imageResults = images.filter((item) => item.media_type === 'image' && (item.hdurl || item.url));

	if (imageResults.length === 0) {
		gallery.textContent = 'No images were found for that date range.';
		return;
	}

	imageResults.forEach((item) => {
		// Create a gallery card for each image returned by NASA.
		const imageCard = document.createElement('article');
		imageCard.className = 'gallery-item';
		imageCard.tabIndex = 0;
		imageCard.setAttribute('role', 'button');
		imageCard.setAttribute('aria-label', `View ${item.title}, ${item.date}`);
		imageCard.addEventListener('click', () => showImageDetails(item));
		imageCard.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				showImageDetails(item);
			}
		});

		const image = document.createElement('img');
		image.src = item.hdurl || item.url;
		image.alt = item.title;
		image.loading = 'lazy';

		const title = document.createElement('h2');
		title.textContent = item.title;

		const date = document.createElement('p');
		date.textContent = item.date;

		const explanation = document.createElement('p');
		explanation.textContent = item.explanation;

		imageCard.append(image, title, date, explanation);
		gallery.append(imageCard);
	});
}

function showImageDetails(item) {
	dialogImage.src = item.hdurl || item.url;
	dialogImage.alt = item.title;
	dialogTitle.textContent = item.title;
	dialogDate.textContent = item.date;
	dialogExplanation.textContent = item.explanation;
	imageDialog.showModal();
}

window.addEventListener('load', () => {
	const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.classList.add('hidden');
  loadingScreen.addEventListener('transitionend', () => {
    loadingScreen.remove();
  });
});
