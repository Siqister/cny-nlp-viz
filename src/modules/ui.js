import {config, scaleColor} from './utils';
import {select} from 'd3';

function Legend(dom){

	function exports(docs){
		dom.getElementsByClassName('count')[0].innerHTML = docs.length;

		let labels = select(dom)
			.selectAll('.legend-item')
			.data(config.entityTypes.slice(0,4),(d,i)=>d)
		labels
			.enter()
			.append('span')
			.attr('class','label label-default legend-item')
			.html(d=>d.toLowerCase())
			.style('background',d=>scaleColor(d))
			.style('margin','0 5px');
	}

	return exports;
}

export {Legend};