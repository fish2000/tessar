/*jslint ass: true, browser: true, devel: true, laxbreak: true, nomen: true, sloppy: true, sub: true, white: true */

(function ($, d3, undefined) {
    function loader (config) {
        return function (container) {
            var oldelems = d3.select('.loaderer').remove();
        
            if (container === undefined) { return; }
            
            var radius = Math.min(config.width, config.height) / 2;
            var tau = 2 * Math.PI;

            var arc = d3.svg.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius * 0.9)
                .startAngle(0);
        
            var svg = d3.select(container).append("svg")
                .attr("class", 'loaderer')
                .attr("id", config.id)
                .attr("width", config.width)
                .attr("height", config.height)
                .append("g")
                .attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")");

            var background = svg.append("path")
                .datum({
                    endAngle: 0.33 * tau
                })
                .style("fill", "#4D4D4D")
                .attr("d", arc)
                .call(spin, 1500);

                function spin(selection, duration) {
                    selection.transition()
                        .ease("linear")
                        .duration(duration)
                        .attrTween("transform", function() {
                            return d3.interpolateString("rotate(0)", "rotate(360)");
                        });

                    window.setTimeout(function() {
                        spin(selection, duration);
                    }, duration);
                }
                
                /*
                function transitionFunction(path) {
                    path.transition()
                        .duration(7500)
                        .attrTween("stroke-dasharray", tweenDash)
                        .each("end", function() {
                            d3.select(this).call(transition);
                        });
                }
                */

        };
    }
    
    $.fn.extend({
        loaderer: function () {
            var $that = $(this);
            return this.each(function () {
    
                var loaderer = loader({
                    width: $that.width(),
                    height: $that.height(),
                    id: "loader"
                });
                
                loaderer($that.elementname());
                
            });
        },
        
        erloader: function () {
            loader()();
        }
    });

})(window['jQuery'], window['d3']);
