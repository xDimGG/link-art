const API = 'https://lt.dim.codes/';

document.addEventListener('DOMContentLoaded', async () => {
	const nav = document.getElementById('navigation');
	const burger = document.querySelector('.hamburger');

	for (const d of document.querySelectorAll('.chevron')) {
		d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"/></svg>';
		d.parentElement.addEventListener('click', () => {
			d.classList.toggle('flipped');
			d.parentElement.parentElement.querySelector('.answer').classList.toggle('active');
		});
	}

	if (nav) {
		for (const a of nav.querySelectorAll('a')) {
			a.addEventListener('click', () => {
				nav.classList.add('closed');
				burger.classList.add('closed');
			});
		}

		burger.addEventListener('click', () => {
			nav.classList.toggle('closed');
			burger.classList.toggle('closed');
		});
	}

	const res = await fetch(API);
	const body = await res.json();

	for (const event of body) {
		if (!event.title.match(/pop|event/i)) continue;
		document.getElementById('no-events')?.remove();
		document.getElementById('events').innerHTML += `
		<a href="${event.url}">• ${event.title} <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg></a>
		`;
	}
});

// Include Lightbox 
import PhotoSwipeLightbox from './dist/photoswipe-lightbox.esm.js';
import PhotoSwipe from './dist/photoswipe.esm.js';

const options = {
  gallery: '#gallery--getting-started',
  children: 'a',
  pswpModule: PhotoSwipe,
};

const lightbox = new PhotoSwipeLightbox(options);
lightbox.on('uiRegister', () => {
  lightbox.pswp.ui.registerElement({
    name: 'bulletsIndicator',
    className: 'pswp__bullets-indicator',
    appendTo: 'wrapper',
    onInit: (el, pswp) => {
      const bullets = [];
      let bullet;
      let prevIndex = -1;

      for (let i = 0; i < pswp.getNumItems(); i++) {
        bullet = document.createElement('div');
        bullet.className = 'pswp__bullet';
        bullet.onclick = (e) => {
          pswp.goTo(bullets.indexOf(e.target));
        };
        el.appendChild(bullet);
        bullets.push(bullet);
      }

      pswp.on('change', (a,) => {
        if (prevIndex >= 0) {
          bullets[prevIndex].classList.remove('pswp__bullet--active');
        }
        bullets[pswp.currIndex].classList.add('pswp__bullet--active');
        prevIndex = pswp.currIndex;
      });
    }
  });
});
lightbox.init();
