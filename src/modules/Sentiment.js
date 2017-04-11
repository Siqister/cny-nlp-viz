import * as d3 from 'd3';

import {config} from './utils';

function Sentiment(dom){

	const _svg = d3.select(dom).select('svg').size()===0?d3.select(dom).append('svg'):d3.select(dom).select('svg');
	const _graphic = _svg.select('.graphic').size()===0?_svg.append('g').attr('class','graphic'):_svg.select('.graphic');
	const _m = {t:20, r:50, l:70, b:50};
	const _w = Math.floor((dom.clientWidth - _m.l - _m.r)/config.textNodeMinSizeX)*config.textNodeMinSizeX-40,
		_h = dom.clientHeight - _m.t - _m.b,
		_r = 5;

	const _scaleX = d3.scaleLinear().domain([-1,1]).range([0,_w]), //score
		_scaleY = d3.scaleLinear().domain([0,5]).range([_h,0]); //magnitude

	_svg
		.attr('width',dom.clientWidth)
		.attr('height',dom.clientHeight)
		.style('position','absolute')
		.style('top',0).style('left',0);
	_graphic
		.attr('transform',`translate(${_m.l},${_m.t})`);

	function exports(docs){

		let background = _graphic.selectAll('.background')
			.data([1])
			.enter()
			.append('g').attr('class','background');
		background.append('line')
			.attr('x1',_w/2)
			.attr('x2',_w/2)
			.attr('y1',0)
			.attr('y2',_h)
			.style('stroke','#ccc')
			.style('stroke-width','1px');
		background.append('line')
			.attr('x1',0)
			.attr('x2',_w)
			.attr('y1',_h)
			.attr('y2',_h)
			.style('stroke','#ccc')
			.style('stroke-width','1px');

		let node = _graphic.selectAll('.comment')
			.data(docs.filter(doc=>doc),d=>d.id);
		let nodeEnter = node.enter()
			.append('g').attr('class','comment')
			.attr('transform',d=>`translate(${_scaleX(d.sentiment.score)},${_scaleY(d.sentiment.magnitude)})`);
		nodeEnter.append('circle')
			.attr('r',0)
			.style('fill-opacity',.2)
			.style('stroke','rgb(100,100,100)')
			.style('stroke-width','2px');

		nodeEnter.merge(node)
			.selectAll('circle')
			.transition().duration(1000)
			.attr('r',_r)
	}

	return exports;
}

export default Sentiment;