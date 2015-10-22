;(function($, undefined) {

  var createChart = function(element, chartData, seriesDescription) {
    var colors = {};
    var series = [];
    for (var name in chartData) {
      if (!chartData.hasOwnProperty(name)) {
        continue;
      }
      var serie = [];
      if (seriesDescription.hasOwnProperty(name)) {
        colors[seriesDescription[name].title] = seriesDescription[name].color;
        serie.push(seriesDescription[name].title);
      } else {
        serie.push(name);
      }
      [].push.apply(serie, chartData[name]);
      series.push(serie);
    }

    var chart = c3.generate({
      bindto: element,
      data: {
        colors: colors,
        x: 'x',
        columns: series
      },
      legend: {
        position: 'inset'
      },
      axis: {
        y: {
          show: false
        }
      }
    });

    $(window).on('resize', function() {
      chart.load({
        columns: series
      });
      chart.flush();
    });
  };

  $.fn.chart = function(data, series) {

    return this.each(function() {
      createChart(this, data, series || {});
    });

  };

})(jQuery);