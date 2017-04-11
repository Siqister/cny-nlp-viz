import * as d3 from 'd3';

function Comments(dom){

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
		merge.select('.panel-body').text(d=>d.body);

		merge
			.transition()
			.delay((d,i)=>i*200)
			.style('opacity',1);
	}

	return exports;
}

export default Comments;