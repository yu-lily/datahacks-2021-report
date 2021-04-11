var width = 600;
var height = 520;
var margin = { top: 0, left: 20, bottom: 40, right: 10 };

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


svg = d3.select(#vis).selectAll('svg').data([wordData]);
var svgE = svg.enter().append('svg');
// @v4 use merge to combine enter and existing selection
svg = svg.merge(svgE);

svg.attr('width', width + margin.left + margin.right);
svg.attr('height', height + margin.top + margin.bottom);

svg.append('g');
g = svg.select('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var setupSections = function () {
	// activateFunctions are called each
	// time the active section changes
	activateFunctions[0] = showTitle;
	activateFunctions[1] = showFillerTitle;
	activateFunctions[2] = showGrid;
	activateFunctions[3] = highlightGrid;
	activateFunctions[4] = showBar;
	activateFunctions[5] = showHistPart;
	activateFunctions[6] = showHistAll;
	activateFunctions[7] = showCough;
	activateFunctions[8] = showHistAll;

	// updateFunctions are called while
	// in a particular section to update
	// the scroll progress in that section.
	// Most sections do not need to be updated
	// for all scrolling and so are set to
	// no-op functions.
	for (var i = 0; i < 9; i++) {
	  updateFunctions[i] = function () {};
	}
	updateFunctions[7] = updateCough;
};

function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
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


