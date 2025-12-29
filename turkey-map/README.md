# Interactive Turkey Map Documentation

This project is an interactive Turkey map application that can be used on websites to display information upon clicking and dynamically show city plates/names on the map.

## Features

- **Interactive City Selection:** Clicking on any city triggers a "reveal" state, changing the city's color and displaying plate/name info on the map.
- **Dynamic Labels:** When a city is selected, plate codes and city names are placed at the exact center of the city using the SVG `getBBox()` method.
- **Smart Tooltip:** A follow-the-cursor tooltip appears when hovering over cities, showing relevant information (Plate - Name).
- **Bulk Actions:** "Show All" and "Hide All" buttons allow one-click management of the map's state.
- **Vector Resolution:** Entirely SVG-based, ensuring crisp visuals on all screen sizes.

## How It Works

### 1. SVG Structure
The map is embedded as an inline SVG within `index.html`. Each city is inside a `<g>` (group) element and contains the following metadata attributes:
- `id`: City name (lowercase, e.g., `adana`)
- `data-city-code`: City plate code (01, 02...)
- `data-city-name`: Full city name

### 2. CSS Styling
- `.revealed`: The class added when a city is clicked. It changes the city color to `@primary-blue`.
- `.city-label-group`: The group containing dynamically created plate and name text elements.
- The tooltip is configured with `pointer-events: none` to avoid interfering with mouse interactions.

### 3. JavaScript Engine
The JavaScript (`script.js`) attaches event listeners to all city groups on load:
- **`initializeMap()`**: Selects SVG elements and binds `click` and `mousemove` events.
- **`updateCityLabel(city)`**: When a city enters the "revealed" state, it creates `<text>` and `<tspan>` elements within the SVG. It uses `cityPath.getBBox()` to position the label at the city's center (x, y).
- **Mouse Coordinate Tracking**: The tooltip uses `pageX` and `pageY` values to follow the cursor with millisecond precision.

## Installation and Implementation

Follow these steps to integrate the project into your site:

1. **Include the SVG:** Paste the content of `turkey.svg` into the `#map` container in your HTML file.
2. **Add the CSS File:**
   ```html
   <link rel="stylesheet" href="style.css">
   ```
3. **Add the JavaScript File:**
   ```html
   <script src="script.js"></script>
   ```
4. **Create the Tooltip Element:** Add this line right after the `<body>` tag:
   ```html
   <div id="tooltip"></div>
   ```

## Customization

- **Colors:** Customize the theme by changing variables like `--primary-blue` and `--bg-light` in `style.css`.
- **Speed:** Adjust hover effect speeds using CSS `transition` properties.

---
*Created by Antigravity AI*
