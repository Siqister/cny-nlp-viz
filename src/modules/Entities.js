import * as d3 from 'd3';

import TextNode from './TextNode';

/*This module expects an array of non-unique entities from Google NLP API
and generates an array of unique entities (based on text identity but disregarding type difference).
It then generates a histogram of occurrence and salience for each entity and map out their relationship.*/

function Entities(dom){

	const _canvas = d3.select(dom).select('canvas').size()===0?d3.select(dom).append('canvas'):d3.select(dom).select('canvas');
	const _svg = d3.select(dom).select('svg').size()===0?d3.select(dom).append('svg'):d3.select(dom).select('svg');
	const _graphic = _svg.select('.graphic').size()===0?_svg.append('g').attr('class','graphic'):_svg.select('.graphic');
	const _m = {t:20, r:50, l:50, b:20};
	const _w = dom.clientWidth - _m.l - _m.r,
		_h = dom.clientHeight - _m.t - _m.b;
	const MIN_SIZE_X = 150,
		MIN_SIZE_Y = 120; //dimension of each node
	const _nx = Math.floor(_w/MIN_SIZE_X), //number of nodes along x axis
		_ny = Math.floor(_h/MIN_SIZE_Y); //number of nodes along y axis

	_canvas
		.attr('width',dom.clientWidth)
		.attr('height',dom.clientHeight);
	_svg
		.attr('width',dom.clientWidth)
		.attr('height',dom.clientHeight)
		.style('position','absolute')
		.style('top',0).style('left',0);
	_graphic
		.attr('transform',`translate(${_m.l},${_m.t})`);

		
	function exports(entities){
		//@param {array} entities Array of non-unique entities
		let nodes = _reduce(entities).slice(0,_nx*_ny);

		//Layout location of each node
		//And instantiate a new TextNode for each
		let ns = _graphic.selectAll('.node')
			.data(nodes,d=>d.name);
		let nsEnter = ns.enter()
			.append('g').attr('class','node');
		nsEnter.merge(ns)
			.call(_position)
			.each(TextNode());
	}

	function _position(ns){
		ns
			.attr('transform',(d,i)=>{
				let currentX = i%_nx,
					currentY = Math.floor(i/_nx);
				d.x = currentX*MIN_SIZE_X;
				d.y = currentY*MIN_SIZE_Y;
				d.w = MIN_SIZE_X;
				d.h = MIN_SIZE_Y;
				return `translate(${d.x},${d.y})`;
			});
	}

	function _reduce(entities){
		//Return array of unique entities
		return d3.nest()
			.key(d=>d.name)
			.rollup((instances)=>{
				return {
					instances, //individual occurrence
					count:instances.length, //count of occurrences
					salience:instances.reduce((r,i)=>{return r+i.salience},0), //sum of salience
					max_salience:Math.max.apply(Math,instances.map(d=>d.salience))
				}
			})
			.entries(entities)
			.sort((a,b)=>{return b.value.max_salience - a.value.max_salience});
	}

	return exports;
}

export default Entities;