import * as d3 from 'd3';

import {loadJson, mapEntitiesToArray} from './modules/utils';
import EntitiesGraph from './modules/Entities';
import Comments from './modules/Comments';

import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const data = loadJson('./data/output.json');

data
	.then(mapEntitiesToArray)
	.then(EntitiesGraph(document.getElementById('entities-graph')));

data
	.then(Comments(document.getElementById('comments')));

