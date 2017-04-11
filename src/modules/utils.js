import {json,scaleOrdinal} from 'd3';

const config = {
	colors:[
		'rgb(0,166,100)', //green
		'rgb(241,90,34)', //red
		'rgb(0,0,255)', //blue
		'rgb(255,194,14)', //yellow
		'rgb(100,100,100)'
	],
	entityTypes:[
		'PERSON',
		'LOCATION',
		'ORGANIZATION',
		'EVENT',
		'WORK_OF_ART',
		'CONSUMER_GOOD',
		'OTHER',
		'UNKNOWN'
	],
	textNodeMinSizeX:150,
	textNodeMinSizeY:120
}

const scaleColor = scaleOrdinal().range(config.colors).domain(config.entityTypes);

function loadJson(url){
	return new Promise((resolve,reject)=>{
		json(url,(err,data)=>{
			if(err){ reject(err); }
			else{ resolve(data); }
		});
	});
}

function mapEntitiesToArray(docs){
	return docs.filter(doc=>doc)
		.map((doc)=>{
			return doc.entities.map((entity)=>{
				entity.mentionedIn = doc.id;
				entity.name = entity.name.toUpperCase();
				return entity;
			});
		})
		.reduce((results,entities)=>{
			return results.concat(entities);
		},[]);
}

export {scaleColor, loadJson, mapEntitiesToArray, config};