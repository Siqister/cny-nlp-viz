import * as d3 from 'd3';

function TextNode(){
	const _m = {t:20,r:20,b:40,l:20};
	const _histogram = d3.histogram()
		.thresholds(d3.range(0,1,.1))
		.domain([0,1])
		.value(d=>d.salience);
	const scaleY = d3.scaleLinear().domain([0,10]);
	let _w, _h;

	function exports(d){
		//@param {Object} d Datum bound to each text node
		//@param {Element} this Element <g.node>
		
		_w = d.w - _m.l - _m.r;
		_h = d.h - _m.t - _m.b;
		scaleY.range([_h,0]);

		//Build DOM
		//FIXME: not conformant with enter exit update
		d3.select(this)
			.append('g')
			.attr('transform',`translate(${_m.l},${_m.t})`)
			.attr('class','histogram-back')
			.selectAll('.bin')
			.data(d3.range(0,1,.1))
			.enter()
			.append('rect').attr('class','bin')
			.attr('x',(d,i)=>i*_w/10)
			.attr('y',0)
			.attr('width',d=>_w/10-2)
			.attr('height',_h)
			.style('fill','rgb(252,252,252)');


		d3.select(this)
			.append('g')
			.attr('transform',`translate(${_m.l},${_m.t})`)
			.attr('class','histogram')
			.call(_drawHistogram,d);

		d3.select(this)
			.append('text')
			.attr('transform',`translate(${d.w/2},${d.h-15})`)
			.attr('text-anchor','middle')
			.text(d.key);
	}

/*	@param {selection} n - selection of <g.histogram>
	@param {Object} d - datum bound to this TextNode instance*/
	function _drawHistogram(n,datum){
		//FIXME: something screwy with enter exit update pattern
		n
			.selectAll('.bin')
			.data(_histogram(datum.value.instances))
			.enter()
			.append('rect').attr('class','bin')
			.attr('x',(d,i)=>i*_w/10)
			.attr('width',d=>_w/10-2)
			.attr('y',_h)
			.attr('height',0)
			.transition()
			.attr('y',d=>scaleY(d.length))
			.attr('height',d=>(_h - scaleY(d.length)));
	}

	return exports;
}

export default TextNode;