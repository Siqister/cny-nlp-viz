import * as d3 from 'd3';

import TextNode from './TextNode';
import {config} from './utils';

/*This module expects an array of non-unique entities from Google NLP API
and generates an array of unique entities (based on text identity but disregarding type difference).
It then generates a histogram of occurrence and salience for each entity and map out their relationship.*/

/* !IMPORTANT
 * Entities with type 'OTHER' are filtered out
 */

function Entities(dom){

	const _canvas = d3.select(dom).select('canvas').size()===0?d3.select(dom).append('canvas'):d3.select(dom).select('canvas');
	const _svg = d3.select(dom).select('svg').size()===0?d3.select(dom).append('svg'):d3.select(dom).select('svg');
	const _graphic = _svg.select('.graphic').size()===0?_svg.append('g').attr('class','graphic'):_svg.select('.graphic');
	const _m = {t:40, r:50, l:50, b:20};
	const _w = dom.clientWidth - _m.l - _m.r,
		_h = dom.clientHeight - _m.t - _m.b;
	const MIN_SIZE_X = config.textNodeMinSizeX,
		MIN_SIZE_Y = config.textNodeMinSizeY; //dimension of each node
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

/*	@param {array} entities - Array of non-unique entities
*/	function exports(entities){
		let nodes = _reduce(entities.filter(d=>(d.type!=='OTHER')))
			.slice(0,_nx*_ny);

		//Layout location of each node
		//And instantiate a new TextNode for each
		let ns = _graphic.selectAll('.node')
			.data(nodes,d=>d.name);
		let nsEnter = ns.enter()
			.append('g').attr('class','node');
		let nsExit = ns.exit().remove();
		nsEnter.merge(ns)
			.call(_position)
			.each(TextNode());
	}

	function _position(ns){
		ns
			.transition().duration(1000)
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

/*	@param {Array} entities - non-unique array of entity mentions
*/	function _reduce(entities){
		//Return array of unique entities
		//Sorted by count
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
			.sort((a,b)=>{return b.value.salience - a.value.salience});
	}

/*	@param {Array} entities - non-unique array of entity mentions*/
	function _links(entities){

		//FIXME: buggy

		let links = entities.slice().sort().reduce((result,entity,i,arr)=>{
			arr
				.slice(i+1)
				.forEach(x => {
					if(x.mentionedIn === entity.mentionedIn){
						result.push({
							from:entity.name,
							to:x.name,
							coMention:entity.mentionedIn
						});
					}
				});

			return result;
		},[]); //links --> each instance of co-occurrence of two entities

		return d3.nest()
			.key(d=>d.from)
			.key(d=>d.to)
			.entries(links)
			.map(origin => origin.values.map(dest => {return {from:origin.key,to:dest.key,values:dest.values,count:dest.values.length};}))
			.reduce((result,xs)=>{
				return result.concat(xs);
			},[])
			.sort((a,b)=>(b.count - a.count));
		//co-occurrence of two entities, sorted by count of co-occurrences
	}

	return exports;
}

export default Entities;