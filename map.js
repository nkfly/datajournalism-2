function mouseover(event){
	
	var myElement = document.querySelector("#svg1");
        var rect = myElement.getBoundingClientRect();
       
	var tooltip_line_length = 80;
	d3.select(this)
		.style("opacity","0.5");
	var centroid;
	var party;
	var elected;
	var candidate;
	var name;
	d3.select(this)
		.each(function(d){
			centroid = path.centroid(d);
			name = d.properties.town;
			party = d.properties.party[now_map];
			elected = d.properties.elected[now_map];
			candidate = d.properties.candidate[now_map];
		});
	//var centroid = this.centroid();
	console.log(centroid[1])
	var x = centroid[0]+rect.left;
	var y = centroid[1]+$("#svg1").position().top ;
	d3.select("#tooltip1")
		.style("display","block")
		.style("top",y+"px")
		.style("left",(x-200-tooltip_line_length)+"px");
	d3.select("#tooltip_captain")
		.html(name);
	d3.select("#tooltip_table")
                        .append("tr")
                        .attr("id","tr_title");
	d3.select("#tr_title")
		.append("td")
		.html("政黨");
	d3.select("#tr_title")
                .append("td")
                .html("當選人數比例");
	/*
	d3.select("#tr_title")
                .append("td")
                .html("參選數");
	*/
	for(var i=0;i<party.length;i++){
		d3.select("#tooltip_table")
			.append("tr")
			.attr("id","tr" + i.toString());
		d3.select("#tr"+i.toString())
			.append("td")
			.html(party[i]);
		d3.select("#tr"+i.toString())
			.append("td")
			.html(elected[i].toString()+"%");
		/*
		d3.select("#tr"+i.toString())
			.append("td")
                        .html(candidate[i]);
		*/
	}	
}
function mouseout(){
		
	d3.select("#tooltip1")
		.style("display","none");
	var myNode = document.getElementById("tooltip_table");
	while (myNode.firstChild) {
    		myNode.removeChild(myNode.firstChild);
	}
	d3.select(this)
                .style("opacity","1.0");
}

function set_onclick(svg){
	/*
	year_list = ["#y79","#y83","#y87","#y91","#y95"];
	for(var i=0;i<year_list.length;i++){
		d3.select(year_list[i])
			.on("click",function(){
				year_list = ["#y79","#y83","#y87","#y91","#y95"];
				for(var j=0;j<year_list.length;j++){
					if(year_list[j] == "#"+this.id){
						now_map = j;
						d3.select("#"+this.id)
							.style("background","#AAA");
					}
					else{
						d3.select(year_list[j])
                                                        .style("background","#000");
					}
				}
				set_color(svg,this.id);
			});
	}
	*/
}
function set_color(svg,number){
	svg.selectAll("path")
		.style("fill",function(d){
			return d.properties.color[labels.indexOf(number)];
		});
}
function fetch_name(name){
	return name[0] + name[1]
}
function bind_data(json,csv){
	//alert(json.features.length);
	for(var i=0;i<json.features.length;i++){
		json.features[i].properties.town = fetch_name(json.features[i].properties.town);
	}
	for(var i=0;i<csv.length;i++){
		csv[i].鄉鎮 = fetch_name(csv[i].鄉鎮);
	}
	var now_year = '';
	var year_index = -1;
	for(var i=0;i<json.features.length;i++){
		json.features[i].properties.party = [];
		json.features[i].properties.elected = [];
		json.features[i].properties.candidate = [];
	}
	//alert(csv.length);
	for(var i=0;i<csv.length;i++){
		if(csv[i].年份 != now_year){
			//alert(json.features.length);

			year_index += 1;
			now_year = csv[i].年份;
			for(var j=0;j<json.features.length;j++){
				if(i>0){
					var last = json.features[j].properties.party.length-1;
					bubble_sort(json.features[j].properties.party[last],json.features[j].properties.elected[last],json.features[j].properties.candidate[last]);
				}
				json.features[j].properties.party.push([]);
                		json.features[j].properties.elected.push([]);
                		json.features[j].properties.candidate.push([]);
			}
                }
		for(var j=0;j<json.features.length;j++){
			if(json.features[j].properties.town == csv[i].鄉鎮){
				json.features[j].properties.party[year_index].push(csv[i].政黨);
                                json.features[j].properties.elected[year_index].push(parseFloat(csv[i].當選數));
                                json.features[j].properties.candidate[year_index].push(parseFloat(csv[i].候選數));
				break;
			}
		}
	}
	for(var j=0;j<json.features.length;j++){
        	if(i>0){
                	var last = json.features[j].properties.party.length-1;
                        bubble_sort(json.features[j].properties.party[last],json.features[j].properties.elected[last],json.features[j].properties.candidate[last]);
               	}
        }
}
function swap(array,index1,index2){
	var tmp = array[index1];
	array[index1] = array[index2];
	array[index2] = tmp;
}
function bubble_sort(party,elected,candidate){
	//alert(party);
	for(var i=0;i<elected.length-1;i++){
		for(var j=elected.length-1;j>i;j--){
			if(elected[j] > elected[j-1]){
				swap(party,j,j-1);
				swap(elected,j,j-1);
				swap(candidate,j,j-1);
			}
		}
	}
	var sum = 0;
	for(var i=0;i<elected.length;i++){
		sum += elected[i];
	}
	for(var i=0;i<elected.length;i++){
		elected[i] /= (sum/100.0);
		elected[i] = Math.round(elected[i]);
	}
}
function calculate_color(json){
	for(var i=0;i<json.features.length;i++){
		json.features[i].properties.color = [];
		for(var j=0;j<json.features[i].properties.elected.length;j++){
			var max = 0;
                	var max_index = 0;
			for(var k=0;k<json.features[i].properties.elected[j].length;k++){
				if(json.features[i].properties.elected[j][k] > max){
					max = json.features[i].properties.elected[j][k];
					max_index = k;
				}	
			}
			if(json.features[i].properties.party[j][max_index] == "中國國民黨"){
				json.features[i].properties.color.push("blue");
			}
			else if(json.features[i].properties.party[j][max_index] == "民主進步黨"){
				json.features[i].properties.color.push("grean");
			}
			else{
				json.features[i].properties.color.push("grey");
			}
		}
	}
}
function getCentroid(obj) {
	bbox = obj.getBBox();
 	return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}
function move(elem,svg){
	var left = 0;
	var id;
	function frame(){
		var con_width = 400;
		left++;
		elem.style.left = left+'px';
		if(left == con_width){
			clearInterval(id);
			now_map = labels.length -1;
			set_color(svg,labels[labels.length-1]);
		}
		for(var i=0;i<labels.length;i++){
			if(i*(con_width/(labels.length-1))<=left && left<(i+1)*(con_width/(labels.length-1))){
				now_map = i;
				set_color(svg,labels[i]);
				break;
			}
		}
	}
	id=setInterval(frame,10);
}
function set_play_onclick(svg,img){	
	var con_width = 400;
	d3.select("#play")
		.on("click",function(){
			move(img,svg);
		});
	d3.select("#turn_left")
		.on("click",function(){
			if(now_map > 0){
				now_map -= 1;
				img.style.left = now_map*(con_width/(labels.length-1)) +"px";
				set_color(svg,labels[now_map]);
			}
		})	
	d3.select("#turn_right")
                .on("click",function(){
                        if(now_map < labels.length-1){
                                now_map += 1;
                                img.style.left = now_map*(con_width/(labels.length-1)) +"px";
                                set_color(svg,labels[now_map]);
                        }
                })
}
function set_player(svg){
	var con_width = 400;
	var width = 12;
	var height = 25;
	var src = "play_bar.png";
	var img = document.createElement("img");
	var year_list = ["79年","83年","87年","91年","95年","99年"];
    	img.src = src;
    	img.width = width;
    	img.height = height;
    	img.style.position = "absolute";
	document.querySelector("#bar_container").appendChild(img);
	move(img,svg);
	set_play_onclick(svg,img);

	for(var i=0;i<year_list.length;i++){		
		d3.select("#label_container")
			.append("span")
			.style("font-size","12px")
			.style("position","absolute")
			.style("left",i*(con_width/(year_list.length-1))+"px")
			.html(year_list[i]);
	}
}
