import './App.css';
import {
	select,
	json,
	geoPath,
	geoNaturalEarth1,
	scaleLinear,
	geoAzimuthalEqualArea,
	geoAzimuthalEquidistant,
	geoGnomonic,
	geoOrthographic,
	geoStereographic,
	geoEqualEarth,
	scaleSqrt,
} from 'd3';
import { feature } from 'topojson-client';
import { useEffect, useState } from 'react';

function App() {
	const [mapProjection, setMapProjection] = useState('scaleLinear');

	const getCountryData = (countryName, covidData) => {
		let country = covidData?.find((country) => {
			return country.Country.toUpperCase() === countryName.toUpperCase();
		});
		if (typeof country === 'undefined') {
			return 1;
		}
		return country.TotalDeaths;
	};

	const handleProjectionChange = (e) => {
        document.getElementById('svg').innerHTML = '';
		setMapProjection(e.target.value);
		console.log(mapProjection);
	};

	var requestOptions = {
		method: 'GET',
		redirect: 'follow',
	};

	const getMapProjection = () => {
		switch (mapProjection) {
			case 'geoAzimuthalEqualArea':
				return geoAzimuthalEqualArea();
			case 'geoAzimuthalEquidistant':
				return geoAzimuthalEquidistant();
			case 'geoGnomonic':
				return geoGnomonic();
			case 'geoOrthographic':
				return geoOrthographic();
			case 'geoStereographic':
				return geoStereographic();
			case 'geoEqualEarth':
			default:
				return geoEqualEarth();
		}
	};

	useEffect(() => {
		fetch('https://api.covid19api.com/summary', requestOptions)
			.then((response) => response.json())
			.then((result) => {
				const svg = select('svg');
				const projection = getMapProjection();
				const pathGenerator = geoPath().projection(projection);
				var radius = scaleSqrt().domain([0, 1e6]).range([0, 20]);

				svg.append('path')
					.attr('class', 'sphere')
					.attr('d', pathGenerator({ type: 'Sphere' }));
				json(
					'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', 
				).then((data) => {
					const countries = feature(data, data.objects.countries);
					svg.selectAll('path')
						.data(countries.features)
						.enter()
						.append('path')
						.attr('d', pathGenerator)
						.attr('class', 'country');
					// .on('mouseover', mouseOver);

					svg.append('g')
						.attr('class', 'circle')
						.selectAll('circle')
						.data(countries.features)
						.enter()
						.append('circle')
						.attr('transform', function (d) {
							return (
								'translate(' + pathGenerator.centroid(d) + ')'
							);
						})
						.attr('r', function (d) {
							return radius(
								getCountryData(
									d.properties.name,
									result.Countries
								)
							);
						})
						.attr('fill');
				});
			});
	}, [mapProjection]);

	return (
		<div className='App'>
			<select onChange={handleProjectionChange}>
				<option selected>geoEqualEarth</option>
				<option>geoAzimuthalEqualArea</option>
				<option>geoAzimuthalEquidistant</option>
				<option>geoGnomonic</option>
				<option>geoOrthographic</option>
				<option>geoStereographic</option>
			</select>
			<div>
				<svg width='960' height='500' id="svg"></svg>
			</div>
		</div>
	);
}

export default App;
