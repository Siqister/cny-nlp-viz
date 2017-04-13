import * as d3 from 'd3';

import {config} from './utils';

function Sentiment(dom){

	const _svg = d3.select(dom).select('svg').size()===0?d3.select(dom).append('svg'):d3.select(dom).select('svg');
	const _graphic = _svg.select('.graphic').size()===0?_svg.append('g').attr('class','graphic'):_svg.select('.graphic');
	const _m = {t:50, r:50, l:70, b:20};
	const _w = Math.floor((dom.clientWidth - _m.l - _m.r)/config.textNodeMinSizeX)*config.textNodeMinSizeX-40,
		_h = dom.clientHeight - _m.t - _m.b,
		_r = 6;

	const _scaleX = d3.scaleLinear().domain([-1,1]).range([0,_w]), //score
		_scaleY = d3.scaleLinear().domain([0,12]).range([_h,0]), //magnitude
		_scaleOpacity = d3.scaleLinear().domain([0,5]).range([.1,1]),
		_scaleColor = d3.scaleLinear().domain([-1,0,1]).range(['red','purple','blue']);

	_svg
		.attr('width',dom.clientWidth)
		.attr('height',dom.clientHeight)
		.style('position','absolute')
		.style('top',0).style('left',0);
	_graphic
		.attr('transform',`translate(${_m.l},${_m.t})`);

	//Internal dispatch
	const _dis = d3.dispatch(
		'sentiment:hover',
		'sentiment:unhover',
		'highlight',
		'unhighlight',
		'brushstart',
		'brush',
		'brushend',
		'sentiment:select',
		'sentiment:deselect');

	//Append gradient defs
	let defs = _svg.selectAll('defs')
		.data([1])
		.enter()
		.append('defs');

	let gradientX = defs.append('linearGradient').attr('id','x-axis')
		.attr('x1','0%').attr('x2','100%').attr('y1','0%').attr('y2','0%');
	gradientX.append('stop').attr('offset','0%').attr('style','stop-color:red;stop-opacity:.1')
	gradientX.append('stop').attr('offset','50%').attr('style','stop-color:purple;stop-opacity:.1')
	gradientX.append('stop').attr('offset','100%').attr('style','stop-color:blue;stop-opacity:.1')
	
	let gradientY = defs.append('linearGradient').attr('id','y-axis')
		.attr('x1','0%').attr('x2','0%').attr('y1','0%').attr('y2','100%');
	gradientY.append('stop').attr('offset','0%').attr('style','stop-color:rgb(253,253,253);stop-opacity:0')
	gradientY.append('stop').attr('offset','80%').attr('style','stop-color:rgb(253,253,253);stop-opacity:1')

	//Append static elements
	let background = _graphic.selectAll('.background')
		.data([1])
		.enter()
		.append('g').attr('class','background');
	background.append('rect').attr('class','background-x-axis')
		.attr('width',_w)
		.attr('height',_h)
		.attr('fill','url(#x-axis)');
	background.append('rect').attr('class','background-y-axis')
		.attr('width',_w)
		.attr('height',_h)
		.attr('fill','url(#y-axis)');
	let ticks = background.selectAll('.tick')
		.data(d3.range(-1,1.001,.2))
		.enter()
		.append('line').attr('class','tick')
		.attr('x1',d=>_scaleX(d))
		.attr('x2',d=>_scaleX(d))
		.attr('y1',0)
		.attr('y2',_h)
		.style('stroke-width','1px')
		.style('stroke',d=>_scaleColor(d));
	ticks
		.style('stroke-dasharray','3px 3px')
		.filter(d=>(d===-1 || d===1 || d===0))
		.attr('y1',20);
	background.selectAll('.sentiment-anchor-text')
		.data([['More negative',-1,0], ['More positive',1,0],['More strongly felt',0,0],['More indifferent',0,1]])
		.enter()
		.append('text')
		.attr('class','sentiment-anchor-text anno')
		.attr('text-anchor','middle')
		.attr('x',(d)=>_scaleX(d[1]))
		.attr('y',d=>_h*d[2])
		.style('fill',d=>_scaleColor(d[1]))
		.attr('dy',10)
		.text(d=>d[0]);

	//Append brush
	const brush = d3.brush()
		.extent([[0,0],[_w,_h]])
		.on('start',_onBrushStart)
		.on('brush',_onBrush)
		.on('end',_onBrushEnd);
	let _brush = _graphic.selectAll('.brush')	
		.data([1])
		.enter()
		.append('g')
		.attr('class','brush')
		.call(brush);

	function exports(docs){

		let node = _graphic.selectAll('.comment')
			.data(docs.filter(doc=>doc),d=>d.id);
		let nodeEnter = node.enter()
			.append('g').attr('class','comment')
			.attr('transform',d=>`translate(${_scaleX(d.sentiment.score)},${_scaleY(d.sentiment.magnitude)})`);
		nodeEnter.append('circle')
			.attr('class','target')
			.attr('r',_r*3)
			.style('fill-opacity',0);
		nodeEnter.append('circle')
			.attr('class','outer')
			.attr('r',0)
			.style('fill-opacity',d=>_scaleOpacity(d.sentiment.magnitude)/3)
			.style('stroke-opacity',d=>_scaleOpacity(d.sentiment.magnitude))
			.style('fill',d=>_scaleColor(d.sentiment.score))
			.style('stroke',d=>_scaleColor(d.sentiment.score))
			.style('stroke-width','2px');
		nodeEnter.append('circle')
			.attr('class','inner')
			.attr('r',2)
			.style('fill-opacity',d=>_scaleOpacity(d.sentiment.magnitude))
			.style('fill',d=>_scaleColor(d.sentiment.score));
		nodeEnter.merge(node)
			.transition()
			.delay((d,i)=>i*50)
			.selectAll('.outer')
			.attr('r',_r);

		//Emit events
		nodeEnter
			.on('mouseenter',function(d){
				_dis.call('sentiment:hover',null,d.id);
				d3.select(this).select('.target')
					.style('fill-opacity',.05);
			})
			.on('mouseleave',function(d){
				_dis.call('sentiment:unhover',null,d.id);
				d3.select(this).select('.target')
					.style('fill-opacity',0);
			});

		//Highlight
		_dis.on('highlight',(id)=>{
			let target = nodeEnter.merge(node)
				.filter(d=>(d.id===id));
			target
				.select('.target')
				.style('fill-opacity',.2);
		});
		_dis.on('unhighlight',(id)=>{
			nodeEnter.merge(node)
				.select('.target')
				.style('fill-opacity',0);	
		});

		//Brush event handling
		_dis.on('brushstart',()=>{
			//no op
		});
		_dis.on('brush',extent=>{
			//On brush, highlight doc nodes
			let merge = node.merge(nodeEnter);
			merge.select('.inner').attr('r',2);
			merge.select('.outer').attr('r',_r);

			let selected = merge
				.filter(_filterFromExtent(extent));
			selected.select('.inner').attr('r',3);
			selected.select('.outer').attr('r',_r*1.5);

			//Also update brush selection region appearance
			//FIXME: not working too hot
			//_brush.select('.selection').attr('fill','blue');
		});
		_dis.on('brushend',extent=>{
			//On brush end, either dispatch 'sentiment:select' or 'sentiment:deselect'
			if(!extent){
				//if brush is empty
				let merge = node.merge(nodeEnter);
				merge.select('.inner').attr('r',2);
				merge.select('.outer').attr('r',_r);
				_dis.call('sentiment:deselect');
			}else{
				let merge = node.merge(nodeEnter);

				let selected = merge
					.filter(_filterFromExtent(extent));
				//extract data array from selected
				let selectedDocs = selected.nodes().map(n=>d3.select(n).datum());
				_dis.call('sentiment:select', null, selectedDocs);
			}
		});
		function _filterFromExtent(ext){
			return function(d){
				let x0 = ext[0][0], x1 = ext[1][0],
					y0 = ext[0][1], y1 = ext[1][1],
					x = _scaleX(d.sentiment.score),
					y = _scaleY(d.sentiment.magnitude);
				return x >= x0 && x <= x1 && y >= y0 && y <= y1;
			}
		}
	}

	exports.on = function(){
		_dis.on.apply(_dis,arguments);
		return this;
	}

	exports.highlight = function(id){
		_dis.call('highlight',null,id)
		return this;
	};

	exports.unhighlight = function(){
		_dis.call('unhighlight');
		return this;
	}

	function _onBrushStart(){
		_dis.call('brushstart',null,d3.event.selection);
	}

	function _onBrush(){
		_dis.call('brush',null,d3.event.selection);
	}

	function _onBrushEnd(){
		_dis.call('brushend',null,d3.event.selection);
	}

	return exports;
}

export default Sentiment;