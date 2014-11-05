"use strict";

(function () {
  var treeFile = "amazon_tree.json";
  var entryPointSelector = "body";

  var margin    = {top: 10, right: 20, bottom: 30, left: 20};
  var width     = 700 - margin.left - margin.right;
  var barHeight = 20;
  var barWidth  = 600;

  var i         = 0;
  var duration  = 400;
  var root;

  var displayTree = new d3Tree();
  var tree = displayTree.tree;

  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select(entryPointSelector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function treeCollapseAll(tree) {
    tree.nodes(root).forEach(function (d) {
      childrenOff(d);
    });

    update(root);
  }

  var errorPlotAxisStart = 300;
  var errorPlotAxisEnd   = 600;
  var errorPlotAxisLen   = errorPlotAxisEnd - errorPlotAxisStart;
  
  var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
    .style("font", "12px sans-serif");

  d3.json(treeFile, function(error, data) {
    data.x0 = 0;
    data.y0 = 0;
    update(root = data);

    treeCollapseAll(displayTree.tree);
  });

  function update(source) {

    // Compute the flattened node list. TODO use d3.layout.hierarchy.
    var nodes = displayTree.tree.nodes(root);

    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

    d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", barWidth)
      .style("fill", getNodeColor)
      .style("stroke","gray")
      .style("stroke-width",1)
      .on("click", toggleChildren)
      .on("mouseover", function(){return tooltip.style("visibility", "visible");})
      .on("mousemove", function(d){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px").text("red std_books std_subtopics std/skew var_ratio sales books pbooks");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return d.name; });

    var dotErrorPlot = nodeEnter.append("g")
      .attr("class", "dot-error-plot");

    // Transition nodes to their new position.
    nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      .style("opacity", 1);

    node.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      .style("opacity", 1)
      .select("rect")
      .style("fill", getNodeColor);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .style("opacity", 1e-6)
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function toggleChildren(d) {
    if (d.children) {
      childrenOff(d);
    } else {
      childrenOn(d);
    }

    update(d);
  }

  function childrenOff(d) {
    d._children = d.children;
    d.children = null;
  }

  function childrenOn(d) {
    d.children = d._children;
    d._children = null;
  }


  function getNodeColor(d) {
    return "lightgray";
    //return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }
})();
