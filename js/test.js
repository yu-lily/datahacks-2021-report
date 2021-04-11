var width = 600;
var height = 520;
var margin = { top: 0, left: 20, bottom: 40, right: 10 };

var squareSize = 6;
var squarePad = 2;
var numPerRow = width / (squareSize + squarePad);



d3.csv("data/original/observations_train.csv",

  // When reading the csv, I must format variables:
  function(d){
	return { date : d3.timeParse("%Y-%m-%d")(d.date.substring(0,10)), value : d.value }
  },
			  
  function getSquarePos(rawData) {
	return rawData.map(function (d, i) {
      // is this word a filler word?
      d.isnull = (d.value === 'NULL') ? true : false;

      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
  },
  function(original_data){
	var squares = g.selectAll('.square').data(original_data, function (d) { return d.value; });
    var squaresE = squares.enter()
      .append('rect')
      .classed('square', true);
    squares = squares.merge(squaresE)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', '#fff')
      .classed('fill-square', function (d) { return d.filler; })
      .attr('x', function (d) { return d.x;})
      .attr('y', function (d) { return d.y;})
      .attr('opacity', 0);
	  
	  
  }


);