function scrollAll(){
    var layerTypes = {
    'fill': ['fill-opacity'],
    'line': ['line-opacity'],
    'circle': ['circle-opacity', 'circle-stroke-opacity'],
    'symbol': ['icon-opacity', 'text-opacity'],
    'raster': ['raster-opacity'],
    'fill-extrusion': ['fill-extrusion-opacity']
}

var alignments = {
    'left': 'lefty',
    'center': 'centered',
    'right': 'righty'
}

function getLayerPaintType(layer) {
    var layerType = map.getLayer(layer).type;
    return layerTypes[layerType];
}

function setLayerOpacity(layer) {
    var paintProps = getLayerPaintType(layer.layer);
    paintProps.forEach(function(prop) {
        map.setPaintProperty(layer.layer, prop, layer.opacity);
    });
}

var story = document.getElementById('story');
var features = document.createElement('div');
features.classList.add(alignments[config.alignment]);
features.setAttribute('id', 'features');

var header = document.createElement('div');

if (config.title) {
    var titleText = document.createElement('h1');
    titleText.innerText = config.title;
    header.appendChild(titleText);
}

if (config.subtitle) {
    var subtitleText = document.createElement('h2');
    subtitleText.innerText = config.subtitle;
    header.appendChild(subtitleText);
}

if (config.byline) {
    var bylineText = document.createElement('p');
    bylineText.innerText = config.byline;
    header.appendChild(bylineText);
}

if (header.innerText.length > 0) {
    header.classList.add(config.theme);
    header.setAttribute('id', 'header');
    story.appendChild(header);
}

config.chapters.forEach((record, idx) => {
    var container = document.createElement('div');
    var chapter = document.createElement('div');
    
    if (record.title) {
        var title = document.createElement('h3');
        title.innerText = record.title;
        chapter.appendChild(title);
    }
    
    if (record.image) {
        var image = new Image();  
        image.src = record.image;  
        chapter.appendChild(image);
    }
    
    if (record.description) {
        var story = document.createElement('p');
        story.innerHTML = record.description;
        chapter.appendChild(story);
    }

    container.setAttribute('id', record.id);
    container.classList.add('step');
    if (idx === 0) {
        container.classList.add('active');
    }

    chapter.classList.add(config.theme);
    container.appendChild(chapter);
    features.appendChild(container);
});

story.appendChild(features);

var footer = document.createElement('div');

if (config.footer) {
    var footerText = document.createElement('p');
    footerText.innerHTML = config.footer;
    footer.appendChild(footerText);
}

if (footer.innerText.length > 0) {
    footer.classList.add(config.theme);
    footer.setAttribute('id', 'footer');
    story.appendChild(footer);
}

mapboxgl.accessToken = config.accessToken;

transformRequest = (url) => {
    const hasQuery = url.indexOf("?") !== -1;	  
    const suffix = hasQuery ? "&pluginName=journalismScrollytelling" : "?pluginName=journalismScrollytelling";	  
    return {
      url: url + suffix
    }	  
}
scroller
    .setup({
        step: '.step',
        offset: 0.5,
        progress: true
    })
    .onStepEnter(response => {
        var chapter = config.chapters.find(chap => chap.id === response.element.id);
        response.element.classList.add('active');
        console.log(chapter)
        if(chapter.id=="start"){
            map.setFilter("base",["!=","GEOID",""])
            map.setPaintProperty("base","fill-opacity",.1)
            map.flyTo({
                center:[-95,39],
                zoom:3.5
            })
        }
        if(chapter.id=="user"){
            map.setFilter("base",["!=","GEOID",pub.currentId])
            
            map.fitBounds(pub.userBounds,{padding:20})
            map.setPaintProperty("base","fill-opacity",1)
            
        }
        if(chapter.id=="neighbors"){
           // console.log(chapter.id)
            var neighborGeo =  getMaxMin(flatDeep(pub.neighborsGeo,Infinity))
            var bounds = new mapboxgl.LngLatBounds(neighborGeo)
            map.fitBounds(bounds,{padding:20})
            map.setFilter("base",["!in","GEOID"].concat(pub.neighborId))
            map.setPaintProperty("hover","fill-opacity",.5)
            map.setPaintProperty("base","fill-opacity",1)
        
        }
        if(chapter.id=="state"){
            var currentState = pub.currentId.slice(0,2)
           // console.log(currentState)
            var stateGeo = pub.coordByState[currentState]
           // console.log(stateGeo)
            var bounds = new mapboxgl.LngLatBounds(getMaxMin(flatDeep(stateGeo,Infinity)))
            map.fitBounds(bounds,{padding:20})
           // console.log(currentState)
            map.setFilter("base",["!=","ST",parseInt(currentState)])
            map.setPaintProperty("base","fill-opacity",1)
            
        }
        if(chapter.id=="percentile"){
            map.setFilter("base",["!=","GEOID",""])
            map.setPaintProperty("base","fill-opacity",.1)
            map.flyTo({
                center:[-95,39],
                zoom:3.5
            })
        }
        // map.flyTo(chapter.location);
  //       if (config.showMarkers) {
  //           marker.setLngLat(chapter.location.center);
  //       }
  //       if (chapter.onChapterEnter.length > 0) {
  //           chapter.onChapterEnter.forEach(setLayerOpacity);
  //       }
    })
    .onStepExit(response => {
        var chapter = config.chapters.find(chap => chap.id === response.element.id);
        response.element.classList.remove('active');
        if (chapter.onChapterExit.length > 0) {
            chapter.onChapterExit.forEach(setLayerOpacity);
        }
    });
// instantiate the scrollama

//map.on("load", function() {
    // setup the instance, pass callback functions
    // scroller
//     .setup({
//         step: '.step',
//         offset: 0.5,
//         progress: true
//     })
//     .onStepEnter(response => {
//         var chapter = config.chapters.find(chap => chap.id === response.element.id);
//         response.element.classList.add('active');
//         map.flyTo(chapter.location);
//         if (config.showMarkers) {
//             marker.setLngLat(chapter.location.center);
//         }
//         if (chapter.onChapterEnter.length > 0) {
//             chapter.onChapterEnter.forEach(setLayerOpacity);
//         }
//     })
//     .onStepExit(response => {
//         var chapter = config.chapters.find(chap => chap.id === response.element.id);
//         response.element.classList.remove('active');
//         if (chapter.onChapterExit.length > 0) {
//             chapter.onChapterExit.forEach(setLayerOpacity);
//         }
//     });
//});
// setup resize event
window.addEventListener('resize', scroller.resize);

}