$(document).ready(function(){init();});

////////////////////////////////////////////////

function init() {
 $('#heritability').slider(state.heritability) 
 $('#polygenaity').slider(state.polygenaity) 
 $('#assortative-mating').slider(state.assortativeMatig) 
}

var state = {
  polygenaity: {min:1, max:100, value:50},
  heritability: {min:0, max:1, value:0.5},
  assortativeMating: {min:-1, max:1, value:0}
}

////////////////////////////////////////////////

function sliders(bounds, context) {
  _.each(app.m.variables, function(x) {
    $('div.' + x.id).slider({
      value: x.min,
      min: x.min, 
      max: x.max,
      slide: function(event, ui) {
        $('span.' + x.id).text(ui.value + ' ' + x.units);
        app.m[x.id] = ui.value;
        var meanSurfaceTemperature = app.c.calculateMeanSurfaceTemperature(app.m.solarInput, app.m.meanSurfacePressure);
        tempF = ((meanSurfaceTemperature * 9) / 5) -459.67;

        if (!_.isNaN(meanSurfaceTemperature)) {
          $('span#mean-surface-temperature').text(Math.floor(tempF) + ' degrees F');
        }

        $('input[type=text].' + x.id).val(ui.value);

      }
    });
  });


};
