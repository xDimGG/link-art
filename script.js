const API = 'https://lt.dim.codes/';

document.addEventListener('DOMContentLoaded', async () => {
	const res = await fetch(API);
	const body = await res.json();
	const tab = document.querySelector('.event');
	const eventLink = document.getElementById('event');

	const event = body.find(c => c.title.match(/pop|event/i));
	if (event) {
		tab.classList.add('has-event');
		eventLink.innerText = event.title;
		eventLink.href = event.url;
	}

	tab.addEventListener('click', () => {
		tab.classList.toggle('closed');
	});
});
