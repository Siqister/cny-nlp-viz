import * as d3 from 'd3';

function Comments(dom){

	const _dis = d3.dispatch(
		'comment:hover',
		'comment:unhover',
		'highlight',
		'unhighlight');

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
			.delay((d,i)=>i*200)
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
		.reduce((result,mentions)=>result.concat(mentions),[]);

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
	innerHtml = innerHtml.join('');

	return innerHtml;
}

/*@param {Element} this - <div.panel-body> element
@param {Object} d - doc data*/
function parseEntityNodes(d){
	d3.select(this).selectAll('.entity')
}

export default Comments;