var chartData;

var x_points = [];
var x_labels = [];
var y_points = [];
var event_titles = [];
var eventIDs = [];
var r;
var chrt;

var graphView = 'weeks';

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function genChartData(chart){

     var chartData = chart;
    
    // Get the size of an object
      var dayLen = Object.size(chartData['days']);
      var labelLen = Object.size(chartData['labels']);

      var firstDate;
      var lastDate;

      // GRAB FIRST DATE FROM RANGE FORMATTED 7/3-7/10
      if($.inArray('-', chartData['labels'][0])  != -1){
         var dashPos = $.inArray('-', chartData['labels'][0]);
         firstDate = chartData['labels'][0].slice(0,dashPos);
      } else {
        firstDate = chartData['labels'][0];
      }
      
      // GRAB LAST DATE FROM RANGE FORMATTED 7/3-7/10
      if($.inArray('-', chartData['labels'][(labelLen - 1)])  != -1){
         var dashPos = $.inArray('-', chartData['labels'][(labelLen - 1)]);
         lastDate = chartData['labels'][(labelLen - 1)].slice(dashPos+1);
      } else {
        lastDate = chartData['labels'][(labelLen - 1)];
      }


      var dateRange = firstDate + ' - ' + lastDate;

      $('.date-range').text(dateRange);

      // Get x-axis data
      for(var i=0;i<dayLen;i++){
        x_points.push(i);
      }

      // Get x-axis labels
      for (property in chartData['days']){
       
         var thisLabel;

      // FORMAT x_labels

         if($.inArray('-', property)  != -1){
           var dashPos = $.inArray('-', property);
           thisLabel = property.slice(dashPos+1);
        } else {
          thisLabel = property;
        }

        x_labels.push(thisLabel);
      }
/*
      for (var i=1; i<(dayLen-1); i++){
         // Set all but first and last elemnents of x-axis labels to empty
         console.log(x_labels[i] + 'lable');
         x_labels[i] = ' ';
      }
*/

      // Get y-axis data
      for(var x in chartData['days']){
        var thisPoint = chartData['days'][x];

        // FOR TESTING: SET VALUE TO RANDOM NUMBER!!
        // thisPoint = Math.floor(Math.random() * 100);
        // REMOVE AFTER TESTING!!

        y_points.push(thisPoint);
      }

      // Add missing (empty) dates to chardData event object
      for(var x in chartData['labels']){
        var thisLabel = chartData['labels'][x];
        if (chartData['events'].hasOwnProperty(thisLabel) == false ){
          chartData['events'][thisLabel] = [{'domain': '', 'event_start':'', 'id':'', 'title':''}];
        }

        // build title array
        var theseTitles = [];
        var theseIDs = [];

        for(thisEvent in chartData['events'][thisLabel]){
          theseTitles.push(chartData['events'][thisLabel][thisEvent]['title']);
          theseIDs.push(chartData['events'][thisLabel][thisEvent]['id']);
        }

        event_titles.push(theseTitles);
        eventIDs.push(theseIDs);

      }
      for(var x in chartData['events']){
      //  console.log('prop '+x);
      }

    drawGraph();
}

function drawGraph(){



    r = Raphael('lineGraph', "105%", "100%");

    var st = r.set();
/*
    var keyX;
    var keyY;

    keyX = r['canvas']['clientWidth']*.02;

    console.log($('.w2-3.chart').css("width") + "WIDHT")

    if($('.w2-3.chart').css("width") == "100%"){
      keyY = r['canvas']['clientHeight']*.015;
    } else {
      keyY = r['canvas']['clientHeight']*.005;
    }

    

    var circle = r.circle(keyX, keyY, 6);
    // Sets the fill attribute of the circle to red (#f00)
    circle.attr({"fill":"#ffffff", "stroke":"#25f3d2", "stroke-width":"2px"});

    var t = r.text(keyX + 12, keyY, "- Event").attr({'text-anchor': 'start'});
    t.attr({"font-size": 13});

    console.log(r['canvas']['clientHeight'], "graph !!!!");
*/
    // Creates a simple line chart at 10, 10
    // width 300, height 200

    if( $('.grp.p1.stat-card.map.lineChart').height() > 317){
          thisHeight = $('.grp.p1.stat-card.lineChart').height()*.85;
        } else if( $('.grp.p1.stat-card.map.lineChart').height() > 200) {
          thisHeight = $('.grp.p1.stat-card.lineChart').height()*.825;
        } else {
          thisHeight = $('.grp.p1.stat-card.lineChart').height()*.73;
        } 

  //  console.log('height: ' + $('#lineGraph').height());
    var x = 18,java
        y = 10,
        xlen = $('.grp.p1.stat-card.lineChart').width()*.97,
        ylen = thisHeight,
        gutter = 10,
        xdata = x_points,
        eventTitle = event_titles;
        //eventTitle = [[''],['Super Cool Event'],['Party Over Here', 'Party Over There', 'Party Everywhere'],[''],['Party of the Year', 'Party Over There', 'Party Everywhere', 'Party Over There', 'Party Everywhere'],['']];

     chrt = r.linechart(x, y, xlen, ylen, xdata, y_points, {
        gutter: gutter,
        nostroke: false,
        axis: "0 0 0 1",
        symbol: "circle",
        smooth: false,
        shade: true,
        colors: ['#25f3d2', '#0F0', '#FF0'],
    });
  // default gutter: 10
  //x, y, length, from, to, steps, orientation, labels, type, dashsize, paper

    var axis = Raphael.g.axis(
        x + gutter, // 10 + gutter
        y + ylen - gutter, //y pos
        xlen - 2 * gutter, null, null, // used to pass the initial value and last value (number) if no labels are provided
        xdata.length - 1, // number of steps 
        0, x_labels, // the labels
        "|",
        2,
        r // you need to provide the Raphael object
    );

    axis.all[0][0]['attributes']['stroke']['value'] = '#25f3d2';


    var yAxisLen = chrt['axis'][0]['all'][1]['length'];
    var yHalf;

    if(yAxisLen % 2 != 0){
      yHalf = (yAxisLen-1) / 2;
    } else {
      yHalf = yAxisLen/2;
    }

    for(i = 0; i < (yAxisLen - 1); i++){

      if(i != (yHalf-1)){
       chrt['axis'][0]['all'][1][i].attr("opacity", 0);
      }

    }

    // Hide X-Axis Values on Load
    
    var numXlabs = axis['all']['items'][1]['length'];

    if (graphView == 'days') {

       var xHalf;
       if(numXlabs % 2 != 0){
          xHalf = ((numXlabs) / 2);
       } else {
         xHalf = (numXlabs/2);
       }
      
      for(i = 1; i < (numXlabs - 1); i++){

        if(i != (xHalf-1)){
          axis['all']['items'][1][i].attr("opacity", 0);
        }

      }

    } else {

      for (i=0; i<numXlabs; i++){
          axis['all']['items'][1][i].attr("opacity", 1);
      }

    }
/*
    chrt.hoverColumn( mouseOverColumn, mouseOutColumn);

    function mouseOverColumn(){
      console.log(this);
      var index = this['axis'];

      console.log(axis['all']['items'][1][index].attr("opacity": 1, "fill":"#25f3d2"));
     // axis.remove();

    }

    function mouseOutColumn(){
      var index = this['axis'];
      console.log(axis['all']['items'][1][index].attr("opacity", 0));
    }
  */


    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
       clearTimeout (timer);
        timer = setTimeout(callback, ms);
        };
    })();

    var symbolCount = 0;
    var thisFlag;
    
    chrt.each(doThis);

    chrt.each(setSymbolZ);

    chrt.each(setFlagZ);


   function setSymbolZ(){
      this.symbol.toFront();
   }

   function setFlagZ(){
      //this.symbol.flag.toFront();
   }

  function doThis(){

      if ( eventTitle[symbolCount] != '' ){

          var strokeWidth = 2;

          this.symbol.hover( hoverOnSymbol, hoverOff );

          this.symbol.click( clickOnSymbol);

          this.symbol.attr({r: "4", fill:'white', stroke:'#25f3d2', "stroke-width":strokeWidth});

          this.symbol.title = eventTitle[symbolCount];

          this.symbol.eventID = eventIDs[symbolCount][0];
           // SETUP FLAGS 
        /* if( eventTitle[symbolCount].length > 1 ){
             //newStroke = this.symbol.attrs.stroke-width;
             if (eventTitle[symbolCount].length >= 2 && eventTitle[symbolCount].length <= 3){
                  this.symbol.attr("stroke-width", 3.5);
             } else {
                  this.symbol.attr("stroke-width", 5);
             }

          }  */
          
       //   genFlag(this.symbol)

      } else {
          this.symbol.remove();
      }

      symbolCount = symbolCount + 1;
  }

  function genFlag(symbol){
      var popX = ( Number(symbol.attrs.cx) + Number(symbol.attrs.r));

      var thisTitle;

      if( symbol.title.length == 1 ){    
          thisTitle = symbol.title[0];
      } else {
          var moreCount = (symbol.title.length - 1);
          thisTitle = symbol.title[0] + " (+" + moreCount + ")";
      }  

      symbol.flag = r.flag(popX,symbol.attrs.cy, thisTitle,0).attr({ "font-size": "9px" });

      symbol.flag.width = symbol.flag.getBBox().width;

      if ((symbol.flag.width + symbol.attrs.cx) > xlen){
          symbol.flag.remove();
          popX = ( Number(symbol.attrs.cx) - Number(symbol.attrs.r));
          symbol.flag = r.flag(popX,symbol.attrs.cy,thisTitle,180);
          symbol.flag.width = symbol.flag.getBBox().width;

          if( symbol.flag.width  > symbol.attrs.cx ){
            symbol.flag.attr("angle")

          }
      }


      symbol.flag.attr({ "font-size": "16px" });
      symbol.flag.attr("opacity", 1);

      symbol.flag.toFront();
  }

  function hoverOnSymbol(){
    console.log('hover on ');

    var popDir;
    
    if(this.attrs.cy < 60){
      popDir = "down";
      popY = ( Number(this.attrs.cy) + Number(this.attrs.r) );
    } else {
      popDir = "up";
      popY = ( this.attrs.cy - this.attrs.r );
    }

      genFlag(this);
 //   this.flag.attr("opacity", 1);

  }

  function hoverOff(){
       console.log("hover off");
       this.flag.remove();
     // this.flag.attr("opacity", 0);

  }
}

function clickOnSymbol(){
  console.log('click!!!' + this.eventID);
  $("#sort-by-event").click();
  jumpToEventID = this.eventID;
}


function clearChart(redrawing){
  if(typeof r!=='undefined' && typeof r.canvas!=='undefined'){
    var paperDom = r.canvas;

     if(paperDom.parentNode != null){
       paperDom.parentNode.removeChild(paperDom);
    } else {
      console.log('node is null');
    }

      chrt.remove();
      r.remove();

    if(redrawing == true){
      x_points = [];  
      x_labels = [];
      y_points = [];
      event_titles = [];
      eventIDs = [];
    }
  }
   $("#lineGraph").empty();

}

function redrawChart(data){
  $('#lineGraph').addClass('loading');
  graphView = data['graphView'];
  clearChart(true);
  genChartData(data);
  $('#lineGraph').removeClass('loading');
}

var timer;
$(window).resize(function() {
   $('#lineGraph').addClass('loading');
   clearTimeout(timer);
   timer = setTimeout(function() {
      clearChart();
      drawGraph();
      $('#lineGraph').removeClass('loading');
   }, 500);
});
