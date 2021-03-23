import './App.css';
import {
	select,
	json,
	geoPath,
	geoAzimuthalEqualArea,
	geoAzimuthalEquidistant,
	geoGnomonic,
	geoOrthographic,
	geoStereographic,
	geoMercator,
	geoEqualEarth,
	scaleSqrt,
	scaleSequential,
	interpolateYlOrRd,
    pointer
} from 'd3';

import {  } from 'd3'
import { feature } from 'topojson-client';
import { useCallback, useEffect, useState } from 'react';

function App() {
	const toolTip = (countryName, totalDeaths) => {
		return select('#svgHome')
			.append('div')
			.style('opacity', 0)
			.attr('class', 'tooltip')
			.style('background-color', 'white')
			.style('border', 'solid')
			.style('border-width', '2px')
			.style('border-radius', '5px')
			.style('padding', '5px')
			.html(`${countryName} total deaths: ${totalDeaths}`);
	};

	const [mapProjection, setMapProjection] = useState('scaleLinear');
	const [covidData, setCovidData] = useState({});

	const getCountryData = (countryName, data) => {
		let country = data?.find((country) => {
			return country.Country.toUpperCase() === countryName.toUpperCase();
		});

		let totalDeaths =
			typeof country === 'undefined' ? 0 : country.TotalDeaths;
		let tempData = covidData;
		tempData[countryName] = totalDeaths;
		setCovidData(tempData);
		return totalDeaths;
	};

	const mouseOver = (e, d) => {
        document.getElementsByClassName('tooltip')[0]?.remove();
		toolTip(d.properties.name, covidData[d.properties.name]).style(
			'opacity',
			1
		);
		select(this).style('stroke', 'black').style('opacity', 0.8);
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
			case 'geoMercator':
				return geoMercator();
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
				const radius = scaleSqrt().domain([0, 1e6]).range([0, 40]);
				const color = scaleSequential()
					.interpolator(interpolateYlOrRd)
					.domain([0, 100000]);

				svg.append('path')
					.attr('class', 'sphere')
					.attr('d', pathGenerator({ type: 'Sphere' }));
				json(
					'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
				).then((data) => {
					const countries = feature(data, data.objects.countries);
					svg.selectAll('path')
						.data(countries.features)
						.enter()
						.append('path')
						.attr('d', pathGenerator)
						.attr('class', 'country');

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
						.attr('fill', function (d) {
							return color(
								getCountryData(
									d.properties.name,
									result.Countries
								)
							);
						})
						.on('mouseover', mouseOver)
				});
			});
	}, [mapProjection]);

	return (
		<div className='App' id='svgHome'>
			<select onChange={handleProjectionChange} value={mapProjection}>
				<option>geoEqualEarth</option>
				<option>geoAzimuthalEqualArea</option>
				<option>geoAzimuthalEquidistant</option>
				<option>geoGnomonic</option>
				<option>geoOrthographic</option>
				<option>geoStereographic</option>
				<option>geoMercator</option>
			</select>
			<div>
				<svg width='960' height='500' id='svg'></svg>
			</div>
		</div>
	);
}

export default App;
