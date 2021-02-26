var pub={
    svi:null,
    lastCounty:null,
    temp:null
}
function PlusCaps(measureName) {
	var nextValue = parseInt(document.getElementById("count_"+measureName).value) + 1;
    setNextValue(nextValue,"count_"+measureName);
}

function MinusCaps(measureName) {
    if(parseInt(document.getElementById("count_"+measureName).value)>=1){
    	var nextValue = parseInt(document.getElementById("count_"+measureName).value) - 1;
          setNextValue(nextValue,"count_"+measureName);
    }
	
}

function setNextValue(nextValue,divName) {
  //localStorage.setItem("CapsNum", nextValue);
  document.getElementById(divName).value = nextValue;
  recalculateAll()
}

function recalculateAll(){
    var currentCounty = {}
    for(var m in measures){
        var key = "EP_"+measures[m]
        var value=parseInt(document.getElementById("count_"+measures[m]).value)
        currentCounty[key]=value
    }
   // var newCounties = pub.svi.push(currentCounty)
    // console.log(newCounties)
    getPercentiles(currentCounty,pub.svi)
   // console.log(currentCounty)
    //d3.select("#sum").html(sum)
    
}

var allData = d3.csv("../geoData/SVI2018_US_COUNTY.csv")
var tempData = d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv")
Promise.all([allData,tempData])
.then(function(data){
    ready(data[0],data[1])
})
function ready(svi,temp){
    console.log(svi)
    pub.temp =temp
    pub.svi = svi
            console.log(pub.temp)
    
    //get random county
    var randomCounty = svi[Math.round(Math.random()*svi.length)]
    console.log(randomCounty)
    d3.select("#randomCounty").html(randomCounty["LOCATION"])
    //fill in numbers
    for(var m in measures){
        if(measures[m]=="TOTPOP"||measures[m]=="HH"||measures[m]=="HU"){
          d3.select("#count_"+measures[m]).attr("value",randomCounty["E_"+measures[m]])
        }else{
            d3.select("#count_"+measures[m]).attr("value",randomCounty["EP_"+measures[m]])
        }
    }        
    //add percent and percentile
   // var withRandomCounty = svi.push(randomCounty)
    
    getPercentiles(randomCounty,svi)

    //outline calculations
}

function getPercentiles(data,svi){
  //  console.log(svi)
    var notEqual = []
    var percentileTotal = 0
    var precalcTotal = 0
    var addingText = ""
    svi.push(data)
    for(var m in measures){
        if(measures[m]!="TOTPOP"&&measures[m]!="HH"&&measures[m]!="HU"){
        
            var ordered = svi.sort(function(a,b){
                return a["EP_"+measures[m]]-b["EP_"+measures[m]]
            })
            
            var percentile = Math.round(ordered.indexOf(data)/svi.length*10000)/10000
            var precalcPercentile = data["EPL_"+measures[m]]
        
            // if(measures[m]=="PCI"){
    //             percentile = percentile
    //         }
    //
            percentileTotal+=percentile
            precalcTotal+=parseFloat(precalcPercentile)
    
            if(m==measures.length-1){
                addingText+=percentile+" = "
                
            }else{
                addingText+=percentile+"<br> + "
                
            }
        
            d3.select("#percentileNumbers_"+measures[m])
            .html(function(){
                    return ordered.indexOf(data)+"th out of "+svi.length+" counties"
                    +"<br><span class=\"percentileNumber\">"+percentile+" percentile"+"</span>"
                
            }
                
            )
            
            var h = 100
            var w = 300
            var p = 20
            
            var svg = d3.select("#histo_"+measures[m])
                    .append("svg")
                    .attr("width",w+p*4)
                    .attr("height",h+p*4)
            //https://observablehq.com/@d3/histogram
           var bins = d3.bin()
             .value(function(d){
                 if(parseFloat(d["EP_"+measures[m]])<0){
                     return 0
                 }else{
                     return parseFloat(d["EP_"+measures[m]])
                 }
             })
            .thresholds(100)(svi)             
 
             var y = d3.scaleLinear()
             .range([0,h])
             .domain([0,d3.max(bins,function(d){return d.length})])
             
             
             var y2 = d3.scaleLinear()
             .range([0,h])
             .domain([d3.max(bins,function(d){return d.length}),0])
             
             var x = d3.scaleLinear()
             .range([0,w])
             .domain([0,100])
             console.log(measures[m])
                 console.log(bins)
             svg.append('text').text("Distribution for all counties "+measures[m]).attr("x",10).attr("y",10)//.attr("text-anchor","end")
            svg.append("g")
                  .call(d3.axisLeft(y2).ticks(5))
                .attr("transform","translate(45,20)")
             svg.append("text").text("# of counties").attr("x",10).attr("y",30).style("writing-mode","vertical-rl")
             
             svg.append("text").text("% of population").attr("x",w/2).attr("y",h+p*3)
             
            svg.append("g")
                  .call(d3.axisBottom(x))
                .attr("transform","translate(45,"+(h+20)+")")
             
           
                 
             svg.selectAll("rect")
                 .data(bins)
                 .enter()
                 .append("rect")
                 .attr("x",function(d,i){
                     return x(d.x0)
                 })
                .attr("y",function(d,i){
                    // console.log(d)
                    return h-y(d.length)
                })
                .attr("count",function(d){
                    return d.length
                })
                .attr("range",function(d){
                    return d.x0 +"-"+d.x1
                })
              //   .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                 .attr("width", function(d) { return w/100-1;})
                 .attr("height", function(d) { return y(d.length) })
                 .style("fill", function(d,i){
                     if(d.x0<data["EP_"+measures[m]]){
                         return "#00aeef"
                     }else{
                         return "#aaa"
                     }
                 })
                .on("mouseover",function(d){
                    console.log(d3.select(this).attr("count"))
                })
                .attr("transform","translate(45,20)")
            
            svg.append("circle").attr("r",3)
                .attr("cx",function(){
                    return x(data["EP_"+measures[m]])+45
                })
                .attr("cy",h+20)
                .attr("fill","magenta")
            svg.append("rect").attr("fill","magenta")
                .attr("x",function(){
                    return x(data["EP_"+measures[m]])+45
                })
                .attr("y",20)
                .attr("width",1)
                .attr("height",h)
                
            svg.append("text")
                .attr("fill","magenta")
                .attr("x",function(){
                    return x(data["EP_"+measures[m]])+45
                })
                .attr("text-anchor","middle")
                .attr("y",18)
                .text(data["EP_"+measures[m]]+ "%")
                .attr("fill","magenta")
        
            // d3.select("#percentile_"+measures[m])
//             .html(""//+Math.round(percentile*100)/100  +"</span> Percentile, "
//             +"higher vulnerablility than "+ordered.indexOf(data)
//                 +" other counties <br><span id=\"percentileLabel\">"
//             // +Math.round(percentile*10000)/100+"th</span> percentile"
//         )
                        //
            // console.log([measures[m],percentile,precalcPercentile])
            // console.log([percentileTotal,precalcTotal])
            // if(Math.round(percentile*100)!=Math.round(precalcPercentile*100)){
     //            notEqual.push(measures[m])
     //            console.log([measures[m],Math.round(percentile*100),Math.round(precalcPercentile*100)])
     //        }
            // console.log([measures[m],percentile,precalcPercentile])
    //         console.log(ordered.indexOf(data))
         }
    }
        //
    // console.log(data["SPL_THEMES"])
    // console.log(percentileTotal)
    
    var themesSort = svi.sort(function(a,b){
        return a["RPL_THEMES"]-b["RPL_THEMES"]
    })
    for(var i in themesSort){
               //
       // // if(themesSort[i]["RPL_THEMES"]!="-999.0"){
       //     console.log(parseFloat(themesSort[i]["SPL_THEMES"]))
       //     console.log(percentileTotal)
           if(percentileTotal<parseFloat(themesSort[i]["SPL_THEMES"])){
               //console.log([themesSort[i]["SPL_THEMES"],percentileTotal,i])
               //console.log(themesSort[i]["RPL_THEMES"])
               var totalPercentile = i/svi.length
               
               break
            }
      //  }
      
    }
  //  console.log(data["RPL_THEMES"])
    var neighbors = [svi[svi.indexOf(data)-1],svi[svi.indexOf(data)+1]]
    
    
    d3.select("#adding").html(addingText)
    d3.select("#percentileTally").html("<span style=\"font-size:36px\">County SVI = </span><span id=\"yourCountyTitle\">"+Math.round(percentileTotal*10000)/10000
                    +"</span><br>out of possible 15,<br>it has a higher vulerability score than <span id=\"yourCountyTitle\">"
                    +Math.round(totalPercentile*10000)/100+"%</span><br> of the counties in this country.<br>"
                    +"Other counties most similar in overall SVI are: "+neighbors[0].LOCATION+"("+neighbors[0]["RPL_THEMES"]+")"
                    +" and "+neighbors[1].LOCATION+"("+neighbors[1]["RPL_THEMES"]+")")
    // d3.select("#sum").html("<span id=\"yourCountyTitle\">"+Math.round(percentileTotal*10000)/10000
 //                    +"</span>out of possible 15,<br>it has a higher vulerability score than <span id=\"yourCountyTitle\">"
 //                    +Math.round(totalPercentile*10000)/100+"%</span> of the counties in this country.<br>"
 //                    +"Other counties most similar in overall SVI are: "+neighbors[0].LOCATION+"("+neighbors[0]["RPL_THEMES"]+")"
 //                    +" and "+neighbors[1].LOCATION+"("+neighbors[1]["RPL_THEMES"]+")"
 //                )
    
                
    console.log(svi.indexOf(data))
    
}
