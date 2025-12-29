document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('tooltip');
    const revealAllBtn = document.getElementById('reveal-all');
    const hideAllBtn = document.getElementById('hide-all');

    function initializeMap() {
        const svg = document.getElementById('svg-turkey');
        if (!svg) {
            console.error('SVG not found!');
            return;
        }

        const cities = svg.querySelectorAll('g.turkey > g');

        cities.forEach(city => {
            city.addEventListener('click', () => {
                city.classList.toggle('revealed');
                updateCityLabel(city);
            });

            city.addEventListener('mousemove', (e) => {
                const cityName = city.getAttribute('data-city-name');
                const cityCode = city.getAttribute('data-city-code');

                if (cityName) {
                    tooltip.innerHTML = `<strong>${cityCode}</strong> - ${cityName}`;
                    tooltip.style.display = 'block';

                    // Using pageX/pageY since tooltip is now relative to the body
                    tooltip.style.left = (e.pageX + 15) + 'px';
                    tooltip.style.top = (e.pageY + 15) + 'px';
                }
            });

            city.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });

        // Initial state update for any pre-revealed cities
        cities.forEach(city => updateCityLabel(city));

        revealAllBtn.addEventListener('click', () => {
            cities.forEach(city => {
                city.classList.add('revealed');
                updateCityLabel(city);
            });
        });

        hideAllBtn.addEventListener('click', () => {
            cities.forEach(city => {
                city.classList.remove('revealed');
                updateCityLabel(city);
            });
        });
    }

    function updateCityLabel(city) {
        const existingLabel = city.querySelector('.city-label-group');

        if (city.classList.contains('revealed')) {
            if (!existingLabel) {
                const path = city.querySelector('path');
                if (path) {
                    const bbox = path.getBBox();
                    const x = bbox.x + bbox.width / 2;
                    const y = bbox.y + bbox.height / 2;

                    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    g.setAttribute('class', 'city-label-group');

                    const plate = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    plate.setAttribute('x', x);
                    plate.setAttribute('y', y - 2);
                    plate.setAttribute('class', 'city-label-plate');
                    plate.setAttribute('text-anchor', 'middle');
                    plate.textContent = city.getAttribute('data-city-code');

                    const name = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    name.setAttribute('x', x);
                    name.setAttribute('y', y + 10);
                    name.setAttribute('class', 'city-label-name');
                    name.setAttribute('text-anchor', 'middle');
                    name.textContent = city.getAttribute('data-city-name');

                    g.appendChild(plate);
                    g.appendChild(name);
                    city.appendChild(g);
                }
            }
        } else {
            if (existingLabel) {
                existingLabel.remove();
            }
        }
    }

    initializeMap();
});
