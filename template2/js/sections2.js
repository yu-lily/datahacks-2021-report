var width = 600;
var height = 520;
var margin = { top: 0, left: 20, bottom: 40, right: 10 };

var xBarScale = d3.scaleLinear()
	.range([0, width]);


// Keep track of which visualization we are on
var lastIndex = -1;
var activeIndex = 0;

// main svg used for visualization
var svg = null;

// d3 selection that will be used
// for displaying visualizations
var g = null;

// When scrolling to a new section the activation function for that the activation function for that
var activateFunctions = [];
// If a section has an update function then it is called while scrolling
var updateFunctions = [];


var scrollVis = function () {
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg');
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // // perform some preprocessing on raw data
      // var wordData = getWords(rawData);
      // // filter to just include filler words
      // var fillerWords = getFillerWords(wordData);

      // // get the counts of filler words for the
      // // bar chart display
      // var fillerCounts = groupByWord(fillerWords);
      // // set the bar scale's domain
      // var countMax = d3.max(fillerCounts, function (d) { return d.value;});
      // xBarScale.domain([0, countMax]);

      // // get aggregated histogram data

      // var histData = getHistogram(fillerWords);
      // // set histogram's domain
      // var histMax = d3.max(histData, function (d) { return d.length; });
      // yHistScale.domain([0, histMax]);

      setupVis();
	  console.log('chart');
      setupSections();
    });
  };
  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


var setupVis = function(){
	
	// g.append('g')
      // .attr('class', 'x axis')
      // .attr('transform', 'translate(0,' + height + ')')
      // .call(xAxisBar);
    // g.select('.x.axis').style('opacity', 0);
	
    // count openvis title
    g.append('text')
      .attr('class', 'title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('2021');

    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('Datahacks report');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);
	
	var corHeatmap = d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_correlogram.csv", function(error, rows) {

	  // Going from wide to long format
	  var data = [];
	  rows.forEach(function(d) {
		var x = d[""];
		delete d[""];
		for (prop in d) {
		  var y = prop,
			value = d[prop];
		  data.push({
			x: x,
			y: y,
			value: +value
		  });
		}
	  });

	  // List of all variables and number of them
	  var domain = d3.set(data.map(function(d) { return d.x })).values()
	  var num = Math.sqrt(data.length)

	  // Create a color scale
	  var color = d3.scaleLinear()
		.domain([-1, 0, 1])
		.range(["#B22222", "#fff", "#000080"]);

	  // Create a size scale for bubbles on top right. Watch out: must be a rootscale!
	  var size = d3.scaleSqrt()
		.domain([0, 1])
		.range([0, 9]);

	  // X scale
	  var x = d3.scalePoint()
		.range([margin.bottom, width - margin.right])
		.domain(domain)

	  // Y scale
	  var y = d3.scalePoint()
		.range([margin.left, height - margin.top])
		.domain(domain)

	  // Create one 'g' element for each cell of the correlogram
	  var cor = g.selectAll(".cor")
		.data(data)
		.enter()
		.append("g")
		  .attr("class", "cor")
		  .attr("transform", function(d) {
			return "translate(" + x(d.x) + "," + y(d.y) + ")";
		  });

	  // Low left part + Diagonal: Add the text with specific color
	  cor
		.filter(function(d){
		  var ypos = domain.indexOf(d.y);
		  var xpos = domain.indexOf(d.x);
		  return xpos <= ypos;
		})
		.append("text")
		  .attr("y", 5)
		  .text(function(d) {
			if (d.x === d.y) {
			  return d.x;
			} else {
			  return d.value.toFixed(2);
			}
		  })
		  .style("font-size", 11)
		  .style("text-align", "center")
		  .style("fill", function(d){
			if (d.x === d.y) {
			  return "#000";
			} else {
			  return color(d.value);
			}
		  });


	  // Up right part: add circles
	  cor
		.filter(function(d){
		  var ypos = domain.indexOf(d.y);
		  var xpos = domain.indexOf(d.x);
		  return xpos > ypos;
		})
		.append("circle")
		  .attr("r", function(d){ return size(Math.abs(d.value)) })
		  .style("fill", function(d){
			if (d.x === d.y) {
			  return "#000";
			} else {
			  return color(d.value);
			}
		  })
		  .style("opacity", 0.8)

	});
};

var setupSections = function () {
	// activateFunctions
    for (var i = 0; i < 9; i++) {
      activateFunctions[i] = function () {};
    }
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showFillerTitle;
    activateFunctions[2] = corHeatmap;
    // activateFunctions[3] = highlightGrid;
    // activateFunctions[4] = showBar;
    // activateFunctions[5] = showHistPart;
    // activateFunctions[6] = showHistAll;
    // activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

	// updateFunctions
	for (var i = 0; i < 9; i++) {
	  updateFunctions[i] = function () {};
	}
	//updateFunctions[7] = updateCough;
};

/**
UPDATE FUNCTIONS
**/

function showTitle() {
g.selectAll('.count-title')
  .transition()
  .duration(0)
  .attr('opacity', 0);

g.selectAll('.openvis-title')
  .transition()
  .duration(600)
  .attr('opacity', 1.0);
}

/**
* showFillerTitle - filler counts
*
* hides: intro title
* hides: square grid
* shows: filler count title
*
*/
function showFillerTitle() {
g.selectAll('.openvis-title')
  .transition()
  .duration(0)
  .attr('opacity', 0);

g.selectAll('.square')
  .transition()
  .duration(0)
  .attr('opacity', 0);

g.selectAll('.count-title')
  .transition()
  .duration(600)
  .attr('opacity', 1.0);
}

function corHeatmap() {
g.selectAll('.count-title')
  .transition()
  .duration(0)
  .attr('opacity', 0);

g.selectAll('.cor')
  .transition()
  .duration(600)
  .delay(function (d) {
	return 5; //I EDITED THIS
  })
  .attr('opacity', 1.0)
  .attr('fill', '#ddd');
}



var setupSections = function () {
	// activateFunctions
    for (var i = 0; i < 9; i++) {
      activateFunctions[i] = function () {};
    }
    // activateFunctions[0] = showTitle;
    // activateFunctions[1] = showFillerTitle;
    activateFunctions[2] = corHeatmap;
    // activateFunctions[3] = highlightGrid;
    // activateFunctions[4] = showBar;
    // activateFunctions[5] = showHistPart;
    // activateFunctions[6] = showHistAll;
    // activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

	// updateFunctions
	for (var i = 0; i < 9; i++) {
	  updateFunctions[i] = function () {};
	}
	//updateFunctions[7] = updateCough;
};

/**
UPDATE FUNCTIONS
**/
function corHeatmap() {
g.selectAll('.count-title')
  .transition()
  .duration(0)
  .attr('opacity', 0);

g.selectAll('.cor')
  .transition()
  .duration(600)
  .delay(function (d) {
	return 5; //I EDITED THIS
  })
  .attr('opacity', 1.0)
  .attr('fill', '#ddd');
}


function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    //.datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
d3.tsv('data/words.tsv', display);