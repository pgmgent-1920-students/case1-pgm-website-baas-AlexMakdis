mapboxgl.accessToken = 'pk.eyJ1IjoiYWxlY21lZ2FuY2s5OSIsImEiOiJjazU1ZnZjcWYwOW0xM21zeHB2dWM5czduIn0.PzXZ_Up_FtTtU0jcjxKFMw';
const map = new mapboxgl.Map({
            container: 'map',
            center: [3.7014992, 51.0555654],
            style: 'mapbox://styles/mapbox/streets-v11',
            zoom: 9,
        });
        var size = 200;

        // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
        // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
        var pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),

            // get rendering context for the map canvas when layer is added to the map
            onAdd: function () {
                var canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },

            // called once before every frame where the icon will be used
            render: function () {
                var duration = 1000;
                var t = (performance.now() % duration) / duration;

                var radius = (size / 2) * 0.3;
                var outerRadius = (size / 2) * 0.7 * t + radius;
                var context = this.context;

                // draw outer circle
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    outerRadius,
                    0,
                    Math.PI * 2
                );
                context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
                context.fill();

                // draw inner circle
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    radius,
                    0,
                    Math.PI * 2
                );
                context.fillStyle = 'rgba(255, 100, 100, 1)';
                context.strokeStyle = 'white';
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();

                // update this image's data with data from the canvas
                this.data = context.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                ).data;

                // continuously repaint the map, resulting in the smooth animation of the dot
                map.triggerRepaint();

                // return true to let the map know that the image was updated
                return true;
            }
        };

        map.scrollZoom.disable();
        map.on('load', function () {
            map.addImage('pulsing-dot', pulsingDot, {
                pixelRatio: 2
            });
            // Add a layer showing the places.
            map.addLayer({
                'id': 'places',
                'type': 'symbol',
                'source': {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [{
                            'type': 'Feature',
                            'properties': {
                                'description': `<div class="map_locations"><h1>Establis Roeselare nv</h1> <br> Beversesteenweg 612
                                8800 - Roeselare <br> +32 (0)51 43 12 00</div>`,
                                'icon': 'theatre',
                            },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [3.1695423, 50.9752433]
                            }
                        }, {
                            'type': 'Feature',
                            'properties': {
                                'description': `<div class="map_locations"><h1>Establis Antwerpen bvba</h1> <br> BJan van Gentstraat 7 bus 201
                                2000 - Antwerpen <br> +32 (0)3 640 38 10</div>`,
                                'icon': 'theatre'
                            },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [4.3877805, 51.2056455]
                            }
                        }, ]
                    }
                },
                'layout': {
                    'icon-image': 'pulsing-dot',
                    'icon-allow-overlap': true,
                }
            });

            // When a click event occurs on a feature in the places layer, open a popup at the
            // location of the feature, with description HTML from its properties.
            map.on('click', 'places', function (e) {
                var coordinates = e.features[0].geometry.coordinates.slice();
                var description = e.features[0].properties.description;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'places', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'places', function () {
                map.getCanvas().style.cursor = '';
            });

            // Add zoom and rotation controls to the map.
            map.addControl(new mapboxgl.NavigationControl());
            map.addControl(new mapboxgl.FullscreenControl());
        });