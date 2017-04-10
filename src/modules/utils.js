import {json} from 'd3';

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

export {loadJson, mapEntitiesToArray};