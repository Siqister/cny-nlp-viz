import * as d3 from 'd3';

import {scaleColor} from './utils';

function Comments(dom){

	const _dis = d3.dispatch(
		'comment:hover',
		'comment:unhover',
		'highlight',
		'unhighlight',
		'highlight:entity',
		'unhighlight:entity');

	function exports(docs){
		let update = d3.select(dom)
			.selectAll('.comment')
			.data(docs.filter(doc=>doc),d=>d.id);
		let enter = update.enter()
			.append('div')
			.attr('class','comment')
			.style('opacity',0);
		enter.append('div').attr('class','panel-heading').append('h2').attr('class','panel-title');
		enter.append('div').attr('class','panel-body');

		let merge = enter.merge(update);
		merge.select('.panel-title').text(d=>d.title);
		merge.select('.panel-body')
			.html(insertEntities)
			.each(parseEntityNodes);
		merge
			.transition()
			.delay((d,i)=>i*100)
			.style('opacity',1);

		//Event emitting
		enter
			.on('mouseenter',function(d){
				_dis.call('comment:hover',null,d.id);
			})
			.on('mouseleave',function(d){
				_dis.call('comment:unhover',null,d.id);
			});

		//Consuming events 
		_dis.on('highlight',id=>{
			let target = merge
				.filter(d=>d.id===id)
				.filter((d,i)=>i===0); //first non-null element
			if(!target) return;

			target.classed('comment-highlight',true);
			_scrollTo(target.node());
		});

		_dis.on('unhighlight',()=>{
			merge.classed('comment-highlight',false);
		});

		_dis.on('highlight:entity',(d)=>{
			let targeted = merge.selectAll('.entity')
				/*.filter(en=>en.name===d.key)
				.style('background',en=>scaleColor(en.type));*/
			console.log(targeted.nodes());
		});

		_dis.on('unhighlight:entity',()=>{
			console.log('Unhighlight:entity');
		});
	}

	exports.on = function(){
		_dis.on.apply(_dis,arguments);
		return this;
	}

	exports.highlight = function(id){
		_dis.call('highlight',null,id);
		return this;
	}

	exports.unhighlight = function(){
		_dis.call('unhighlight');
		return this;
	}

	exports.highlightEntity = function(d){
		_dis.call('highlight:entity',null,d);
		return this;
	}

	exports.unhighlightEntity = function(){
		_dis.call('unhighlight:entity');
		return this;
	}

	function _scrollTo(el){
		//FIXME: not robust
		window.scrollTo(0, el.offsetTop);
	}

	return exports;
}

/*@param {Object} doc - Document data*/
function insertEntities(doc){
	const body = doc.body;
	const entities = doc.entities;

	//entities
	//--entity {Object}
	//----entity.name {String}
	//----entity.type {String}
	//----entity.mentions {Array}
	//------mention
	//--------mention.text
	//----------text.beginOffset
	//----------text.content {String}
	//--------mention.type

	let mentions = entities.slice()
		.map(entity=>{

			return entity.mentions.map(mention=>{
				return {
					'name':entity.name,
					'type':entity.type,
					'beginOffset':mention.text.beginOffset,
					'length':mention.text.content.length
				}
			});
		})
		.reduce((result,mentions)=>result.concat(mentions),[])
		.sort((a,b)=>a.beginOffset-b.beginOffset);

	//FIXME: ugh this is ugly
	//FIXME: Returned parsed HTML string is incorrect
	let charArray = body.split(''),
		innerHtml = [],
		prevIndex = 0;

	mentions.forEach(mention=>{
		innerHtml.push(...(charArray.slice(prevIndex,mention.beginOffset)));
		innerHtml.push(`<span class="entity" data-name=${mention.name} data-type=${mention.type}>`);
		innerHtml.push(...(charArray.slice(mention.beginOffset,mention.beginOffset+mention.length)));
		innerHtml.push('</span>');
		prevIndex = mention.beginOffset + mention.length;
	});
	innerHtml.push(...(charArray.slice(prevIndex)));
	innerHtml = innerHtml.join('');

	return innerHtml;
}

/*@param {Element} this - <div.panel-body> element
@param {Object} d - doc data*/
function parseEntityNodes(d){
	d3.select(this).selectAll('.entity')
		.each(function(){
			/*@param {Element} this - <span.entity> element*/
			let name = this.dataset.name,
				type = this.dataset.type;
			d3.select(this).datum({
				name,
				type
			});
		});
}

export default Comments;