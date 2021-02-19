var pub={
    svi:null,
    lastCounty:null
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
Promise.all([allData])
.then(function(data){
    ready(data[0])
})
function ready(svi){
    console.log(svi)
    pub.svi = svi
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
        
            if(measures[m]=="PCI"){
                percentile = percentile
            }
            
            percentileTotal+=percentile
            precalcTotal+=parseFloat(precalcPercentile)
            if(m==measures.length-1){
                addingText+=percentile+" = "
                
            }else{
                addingText+=percentile+"<br> + "
                
            }
        
            d3.select("#percentileNumbers_"+measures[m])
            .html(function(){
                if(m != measures.length-1){
                    return "<span class=\"percentileNumber\">"+percentile
                    +"</span><br>+"
                }else{
                    return "<span class=\"percentileNumber\">"+percentile
                    +"</span>" 
                }
            }
                
            )
        
            d3.select("#percentile_"+measures[m])
            .html(""//+Math.round(percentile*100)/100  +"</span> Percentile, "
            +"higher vulnerablility than "+ordered.indexOf(data)
                +" other counties <br><span id=\"percentileLabel\">"
            // +Math.round(percentile*10000)/100+"th</span> percentile"
        )
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
    console.log(data["RPL_THEMES"])
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
