import {json} from 'd3';

const config = {
	colors:[
		'rgb(0,166,100)',
		'rgb(241,90,34)',
		'rgb(0,0,255)',
		'rgb(255,194,14)'
	]
}

const scaleColor = d3.scaleOrdinal().range(config.colors);

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
				return entity;
			});
		})
		.reduce((results,entities)=>{
			return results.concat(entities);
		},[])
		.map((doc)=>{
			doc.name = doc.name.toUpperCase();
			return doc;
		});
}

export {scaleColor, loadJson, mapEntitiesToArray};