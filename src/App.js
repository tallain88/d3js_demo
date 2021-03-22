import logo from './logo.svg';
import './App.css';
import { select, json, geoPath, geoNaturalEarth1 } from 'd3';
import { feature } from 'topojson-client';
import { useEffect } from 'react';


function App() {
  
  const mouseOver = (e) => {
    console.log('mouse overrrr');
    console.log(e);
  }

  const mouseOut = (e) => {
    console.log('mouse ouuuuuuuuut');
    console.log(e);

  }


  useEffect(() => {

    const svg = select('svg');
    const projection = geoNaturalEarth1();
    const pathGenerator = geoPath().projection(projection);

    svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));
    json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(data => {
    const countries = feature(data, data.objects.countries);
    svg.selectAll('path').data(countries.features)
    .enter().append('path')
      .attr('d', pathGenerator)
      .attr('class', function(d) { return d.properties.name })
      .attr('class', 'country')
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);
    });
  }, []);  

  return (
    <div className="App">
      <div>
        <svg width="960" height="500"></svg>

      </div>
    </div>
  );
}

export default App;
