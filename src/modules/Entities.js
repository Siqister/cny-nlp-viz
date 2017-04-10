import * as d3 from 'd3';

function Entities(dom){
	const _canvas = d3.select(dom).select('canvas').size()===0?d3.select(dom).append('canvas'):d3.select(dom).select('canvas');
	_canvas
		.attr('width',dom.clientWidth)
		.attr('height',dom.clientHeight);
		
	function exports(entities){
		console.log(_reduce(entities));
	}

	function _reduce(entities){
		return d3.nest()
			.key(d=>d.name)
			.rollup((instances)=>{
				return {
					instances,
					count:instances.length,
					salience:instances.reduce((r,i)=>{return r+i.salience},0)
				}
			})
			.entries(entities)
			.sort((a,b)=>{return b.value.count - a.value.count});
	}

	return exports;
}

export default Entities;