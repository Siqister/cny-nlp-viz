import * as d3 from 'd3';

import {scaleColor} from './utils';

function TextNode(){
	const _m = {t:20,r:20,b:40,l:20};
	const _histogram = d3.histogram()
		.thresholds(d3.range(0,1,.1))
		.domain([0,1])
		.value(d=>d.salience);
	const scaleY = d3.scaleLinear().domain([0,10]);
	let _w, _h;

	function exports(d,i){
		//@param {Object} d Datum bound to each text node
		//@param {Element} this Element <g.node>
		
		_w = d.w - _m.l - _m.r;
		_h = d.h - _m.t - _m.b;
		scaleY.range([_h,0]);

		//Build DOM
		//FIXME: not conformant with enter exit update
		let target = d3.select(this)
			.selectAll('.target')
			.data([1])
			.enter()
			.append('rect')
			.attr('width',d.w)
			.attr('height',d.h)
			.attr('class','target'); //only drawn once

		let histogramBackground = d3.select(this)
			.selectAll('.histogram-back')
			.data([1])
			.enter()
			.append('g')
			.attr('transform',`translate(${_m.l},${_m.t})`)
			.attr('class','histogram-back');
		histogramBackground //only drawn once
			.selectAll('.bin')
			.data(d3.range(0,1,.1))
			.enter()
			.append('rect').attr('class','bin')
			.attr('x',(d,i)=>i*_w/10)
			.attr('y',0)
			.attr('width',d=>_w/10-2)
			.attr('height',_h)
			.style('fill','white');

		let histogram = d3.select(this)
			.selectAll('.histogram')
			.data([1]);
		let histogramEnter = histogram
			.enter()
			.append('g')
			.attr('transform',`translate(${_m.l},${_m.t})`)
			.attr('class','histogram');
		histogram.merge(histogramEnter)
			.call(_drawHistogram,d,i);

		let text = d3.select(this)
			.selectAll('.word')
			.data([1]);
		let textEnter = text
			.enter()
			.append('text').attr('class','word')
			.attr('transform',`translate(${d.w/2},${d.h-15})`)
			.attr('text-anchor','middle')
			.style('font-size','12px')
			.style('opacity',0);
		let textMerge = text.merge(textEnter)
			.text(d.key);
		textMerge
			.transition()
			.delay(i*100)
			.style('opacity',1);

		let textUnderline = d3.select(this)
			.selectAll('.underline')
			.data([1]);
		let textUnderlineEnter = textUnderline
			.enter()
			.append('line').attr('class','underline')
			.attr('transform',`translate(${d.w/2},${d.h-7})`);
		textUnderline.merge(textUnderlineEnter)
			.attr('x1',-textMerge.node().getComputedTextLength()/2)
			.attr('x2',textMerge.node().getComputedTextLength()/2)
			.style('stroke',scaleColor(d.value.instances[0].type)); //FIXME: using baked-in type to color

		let counter = d3.select(this)
			.selectAll('.counter')
			.data([1]);
		let counterEnter = counter.enter()
			.append('g')
			.attr('class','counter')
			.attr('transform',`translate(${_m.l+_w},${_m.t})`);
		counterEnter.append('circle')
			.attr('r',8)
			.style('fill',scaleColor(d.value.instances[0].type));
		counterEnter.append('text')
			.attr('text-anchor','middle')
			.attr('dy',4)
			.style('fill','white')
			.style('font-size','12px');
		counter.merge(counterEnter)
			.select('text')
			.text(d.value.count);
	}

/*	@param {selection} n - selection of <g.histogram>
	@param {Object} d - datum bound to this TextNode instance*/
	function _drawHistogram(n,datum,index){
		let bins = n
			.selectAll('.bin')
			.data(_histogram(datum.value.instances),(d,i)=>i);
		let binsEnter = bins.enter()
			.append('rect').attr('class','bin')
			.attr('x',(d,i)=>i*_w/10)
			.attr('width',d=>_w/10-2)
			.attr('y',_h)
			.attr('height',0)
			.style('fill','rgb(80,80,80)')
		binsEnter.merge(bins)
			.transition()
			.delay(index*100)
			.attr('y',d=>scaleY(d.length))
			.attr('height',d=>(_h - scaleY(d.length)));
	}

	return exports;
}

export default TextNode;