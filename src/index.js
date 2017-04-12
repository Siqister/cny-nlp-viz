import * as d3 from 'd3';

import {loadJson, mapEntitiesToArray, partialCall} from './modules/utils';
import EntitiesGraph from './modules/Entities';
import Comments from './modules/Comments';
import SentimentGraph from './modules/Sentiment';

import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

//Instantiate modules
const data = loadJson('./data/output.json'); //Promise object that resolves to a list of docs
const comments = Comments(document.getElementById('comments'));
const sentimentGraph = SentimentGraph(document.getElementById('sentiment-graph'));
const entitiesGraph = EntitiesGraph(document.getElementById('entities-graph'));
const dispatch = d3.dispatch(
	'comment:hover',
	'comment:unhover',
	'sentiment:hover',
	'sentiment:unhover'
);

//Build modules on data load
data
	.then(mapEntitiesToArray)
	.then(entitiesGraph);
data
	.then(comments);
data
	.then(sentimentGraph);

//Event architecture
//...Emitting
comments
	.on('comment:hover', partialCall(dispatch,'comment:hover',null))
	.on('comment:unhover', partialCall(dispatch,'comment:unhover',null));
sentimentGraph
	.on('sentiment:hover', partialCall(dispatch,'sentiment:hover',null))
	.on('sentiment:unhover', partialCall(dispatch,'sentiment:unhover',null))
	.on('sentiment:select',(docs)=>{ console.log(docs)})
	.on('sentiment:deselect',()=>{console.log('Sentiment:deselect')});

//...Receiving
dispatch.on('comment:hover', sentimentGraph.highlight);
dispatch.on('comment:unhover', sentimentGraph.unhighlight);
dispatch.on('sentiment:hover', comments.highlight);
dispatch.on('sentiment:unhover',comments.unhighlight);


