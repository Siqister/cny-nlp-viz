import * as d3 from 'd3';

import {loadJson, mapDocsToEntitiesArray, partialCall} from './modules/utils';
import EntitiesGraph from './modules/Entities';
import Comments from './modules/Comments';
import SentimentGraph from './modules/Sentiment';
import {Legend} from './modules/ui';

import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

//Instantiate modules
const data = loadJson('./data/output.json'); //Promise object that resolves to a list of docs
const comments = Comments(document.getElementById('comments'));
const sentimentGraph = SentimentGraph(document.getElementById('sentiment-graph'));
const entitiesGraph = EntitiesGraph(document.getElementById('entities-graph'));
const legend = Legend(document.getElementsByClassName('legend')[0]);
const dispatch = d3.dispatch(
	'comment:hover',
	'comment:unhover',
	'sentiment:hover',
	'sentiment:unhover',
	'sentiment:select',
	'sentiment:deselect',
	'entities:select',
	'entities:deselect'
);

//Build modules on data load
data
	.then(mapDocsToEntitiesArray)
	.then(entitiesGraph);
data
	.then(comments);
data
	.then(sentimentGraph);
data
	.then(legend);

//Event architecture
//...Emitting
comments
	.on('comment:hover', partialCall(dispatch,'comment:hover',null))
	.on('comment:unhover', partialCall(dispatch,'comment:unhover',null));
sentimentGraph
	.on('sentiment:hover', partialCall(dispatch,'sentiment:hover',null))
	.on('sentiment:unhover', partialCall(dispatch,'sentiment:unhover',null))
	.on('sentiment:select',partialCall(dispatch,'sentiment:select',null))
	.on('sentiment:deselect',partialCall(dispatch,'sentiment:deselect',null));
entitiesGraph
	.on('entities:selectEntity',partialCall(dispatch,'entities:select',null))
	.on('entities:deselect',partialCall(dispatch,'entities:deselect',null));

//...Receiving
dispatch.on('comment:hover', sentimentGraph.highlight);
dispatch.on('comment:unhover', sentimentGraph.unhighlight);
dispatch.on('sentiment:hover', comments.highlight);
dispatch.on('sentiment:unhover',comments.unhighlight);
dispatch.on('sentiment:select',(docs)=>{
	entitiesGraph(mapDocsToEntitiesArray(docs));
	legend(docs);
});
dispatch.on('sentiment:deselect',()=>{
	data
		.then(mapDocsToEntitiesArray)
		.then(entitiesGraph);
	data
		.then(legend);
});
dispatch.on('entities:select', comments.highlightEntity)
dispatch.on('entities:deselect', comments.unhighlightEntity);

