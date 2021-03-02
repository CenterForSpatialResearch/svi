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
var colors = ["#d9732e",
"#6fc357",
"#de5550",
"#c7a435",
"#409fcb"]

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
    pub.temp =temp
    pub.svi = svi
    
    //get random county
    var randomCounty = {}//svi[Math.round(Math.random()*svi.length)]
   // console.log(randomCounty)
   // d3.select("#randomCounty").html(randomCounty["LOCATION"])
    //fill in numbers
    
    
    for(var m in measures){
        var average = getAverages(measures[m],pub.svi)
       // console.log(average)
        var sorted = svi.sort(function(a,b){
            return parseFloat(a["EP_"+measures[m]])-parseFloat(b["EP_"+measures[m]])
        })
      
        var lower = svi.length/2
        var higher = svi.length/2+1
        var measure = "EP_"+measures[m]
        // console.log(higher)
//         console.log(sorted[lower][measure])
//         console.log(sorted[higher][measure])
        
        var median = (parseFloat(sorted[lower][measure])+parseFloat(sorted[higher][measure]))/2
        
        // console.log(median)
        randomCounty["EP_"+measures[m]]=median
        
        d3.select("#count_"+measures[m]).attr("value",median)
    }        
    //add percent and percentile
   // var withRandomCounty = svi.push(randomCounty)
    
    getPercentiles(randomCounty,pub.svi)

    //outline calculations
}
function getAverages(measure,svi){
    var sum = 0
    var count = svi.length
    for(var i in svi){
        var value = parseFloat(svi[i]["EP_"+measure])
        if(value>0){
            sum+=value
        }else{
            count=count-1
        }
    }
    var average = Math.round(sum/count)
    return average
}
function getPercentiles(data,svi){
  //  console.log(svi)
    var notEqual = []
    var percentileTotal = 0
    var precalcTotal = 0
    var addingText = ""
    //svi.push(data)
    
    for(var m in measures){
        var measure = "EP_"+measures[m]
        
            var ordered = svi.sort(function(a,b){
                return a["EP_"+measures[m]]-b["EP_"+measures[m]]
            })
            
            
            for(var s in ordered){                
                if(parseFloat(data[measure])<parseFloat(ordered[s][measure])){
                   var index = s
                    break
                }
            }
            
            var percentile = Math.round(index/svi.length*1000)/1000
            
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
        
            d3.select("#rankNumbers_"+measures[m])
            .html(function(){
                    return "higher than <br> <span class=\"rankNumber\">"+index+"</span><br> other counties "//"<br> out of "+svi.length+""                
            })
            .style("color",colors[2])   
            
            d3.select("#percentileNumbers_"+measures[m])
            .html(function(){
                    return "higher than "+index+"<br> other counties<br><span class=\"percentileNumber\">"+percentile+"</span> percentile"
            })
            .style("color",colors[0])
            
            var h = 50
            var w = 200
            var p = 20
            
            d3.select("#histo_"+measures[m]+" svg").remove()
            var svg = d3.select("#histo_"+measures[m])
                    .append("svg")
                    .attr("width",w+p*3)
                    .attr("height",h+p*3)
            //https://observablehq.com/@d3/histogram
             var max = d3.max(svi,function(d){return d["EP_"+measures[m]]})
             // console.log(Math.ceil(max))
           
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
             
             // svg.append('text').text("Distribution for all counties")
  //            .attr("x",0).attr("y",p/2)//.attr("text-anchor","end")
  //
            svg.append("g")
                  .call(d3.axisLeft(y2).ticks(3))
                .attr("transform","translate(45,"+p+")")
             
             svg.append("text").text("# of counties").attr("x",10).attr("y",h/2).style("writing-mode","vertical-rl")
             .style("font-style","italic").style("font-size","11px")
             
             svg.append("text").text("% of population").attr("x",w/2).attr("y",h+p*2.5)
             .style("font-style","italic").style("font-size","11px")
             
            svg.append("g")
                  .call(d3.axisBottom(x).ticks(10))
                .attr("transform","translate(45,"+(h+p)+")")
             
           
                 
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
              .attr("measure",function(d){
                 return measuresPercentDenominators[measures[m]]+" "+measuresLabels[measures[m]]
              })
                .attr("range",function(d){
                    return d.x0 +"% - "+d.x1+"%"
                })
              //   .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                 .attr("width", function(d) { return w/100-1;})
                 .attr("height", function(d) { return y(d.length) })
                 .style("fill", function(d,i){
                     if(d.x0<data["EP_"+measures[m]]){
                         return colors[2]
                     }else{
                         return "#000"
                     }
                 })
                .on("mouseover",function(d){
                    var popupText = d3.select(this).attr("range")+" "
                                +d3.select(this).attr("measure")
                                +":<br>"
                                +d3.select(this).attr("count")+" counties"
                    
                    d3.select("#barPopup").html(popupText)
                    .style("left",window.event.pageX+10+"px")
                    .style("top",window.event.pageY+"px")
                    .style("display","inline")
                })
                .on("mouseout",function(){
                    d3.select("#barPopup").style("display","none")
                })
                .attr("transform","translate(45,"+p+")")
            
       svg.append("circle").attr("r",5)
                .attr("cx",function(){
                    return x(data["EP_"+measures[m]])+45
                })
                .attr("cy",p*.5)
                 .attr("fill",colors[4])
   //
            svg.append("rect")
                .attr("fill",colors[4])
                .attr("x",function(){
                    return x(data["EP_"+measures[m]])+45
                })
                .attr("y",p*.5)
                .attr("width",1)
                .attr("height",h+p/2)
                
            svg.append("text")
                .attr("fill",colors[4])
                .attr("x",function(){
                    return x(data["EP_"+measures[m]])+55
                })
                .style("font-size","20px")
                .attr("text-anchor","start")
                .attr("y",p-2)
                .text(data["EP_"+measures[m]]+ "%")
        
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
    d3.select("#percentileTally").html("The sum of these 15 percentiles and the <span class=\"percentileNumber\">SVI is "
                    +Math.round(percentileTotal*10000)/10000
                    +"</span><br>out of possible 15. This total is higher than "
                    +i+" other counties in this country. The SVI ranking is the percentile rank of "
                    +"<span class=\"totalpercentileNumber\">"+Math.round(totalPercentile*10000)/100+"%</span>"
                  )

    d3.selectAll(".percentileNumber").style("color",colors[0]).style("font-size","40px")
    d3.selectAll(".totalRankNumber").style("color",colors[3]).style("font-size","40px")
    d3.selectAll(".totalpercentileNumber").style("color",colors[3]).style("font-size","40px")
                
    // pub.svi.splice(svi.indexOf(data), 1);
  //   console.log(pub.svi.length)
    
}
