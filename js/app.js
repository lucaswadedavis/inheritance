$(document).ready(function(){init();});

// TODO: get the correlation coefficient during the breeding cycle.

////////////////////////////////////////////////

var chance = new Chance();

function init() {
 $('#population-size').slider(state.populationSize);
 $('#number-of-generations').slider(state.numberOfGenerations);
 $('#heritability').slider(state.heritability);
 $('#polygenaity').slider(state.polygenaity);
 $('#assortative-mating').slider(state.assortativeMating);
 $('button').on('click', calculate);
}

function renderChart(generations) {
  var uppers = ['uppers'];
  var lowers = ['lowers'];
  var averages = ['average'];
  var columns = [];
  for (var i = 0; i < generations[0].length; i++) {
    columns.push([chance.name()]);
  }

  for (var i = 0; i < generations.length; i++) {
    var generation = generations[i];
    var upper = -Infinity;
    var lower = Infinity;
    var sum = 0;
    var lineageIndex = 0;
    for (var j = 0; j < generation.length; j++) {
      if (generation[j].iq > upper) upper = generation[j].iq;
      if (generation[j].iq < lower) lower = generation[j].iq;
      sum += generation[j].iq;
      columns[lineageIndex].push(generation[j].iq);
      if (j % 2 === 1) lineageIndex++;
    }
    uppers.push(upper);
    lowers.push(lower);
    averages.push(sum / generation.length);
  }

  var opts = {
    bindTo: "#chart",
    //subchart: {show: true},
    data: {
      columns: columns,
      axis: {x: {type: 'scatter-plot'}}
    }
  };
  
  return c3.generate(opts);

};

window.state = {
  populationSize: {min:2, max: 200, value: 10},
  numberOfGenerations: {min:10, max: 1000, value: 10},
  polygenaity: {min:1, max:100, value:5},
  heritability: {min:0, max:100, value:100},
  assortativeMating: {min:0, max:100, value:100}
}

state.populationSize.slide = function(event, ui) {
  state.populationSize.value = ui.value;
  $("#population-size-title").text("Population Size: " + ui.value);
};


state.numberOfGenerations.slide = function(event, ui) {
  state.numberOfGenerations.value = ui.value;
  $("#number-of-generations-title").text("Number of Generations: " + ui.value);
};


state.heritability.slide = function(event, ui) {
  state.heritability.value = ui.value;
  $("#heritability-title").text("Heritability: " + ui.value);
};


state.assortativeMating.slide = function(event, ui) {
  state.assortativeMating.value = ui.value;
  $("#assortative-mating-title").text("Assortative Mating: " + ui.value);
};


state.polygenaity.slide = function(event, ui) {
  state.polygenaity.value = ui.value;
  $("#polygenaity-title").text("Polygenaity: " + ui.value);
};

function breed(a, b) {
  // start with perfect heritability
  var x = {iq: 0, genes: []};
  for (var i = 0; i < a.genes.length; i++) {
    var gene = Math.random() > 0.5 ? a.genes[i] : b.genes[i];
    x.iq += gene;
    x.genes.push(gene);
  }
  x.iq /= state.polygenaity.value;
  // the heritability stuff, because the slider only deals with ints
  var h = 0.01 * state.heritability.value;
  x.iq = (h * x.iq) + ((1 - h) * Math.random());
  return x;
};

function selectMateAndBreed(organisms) {
  // start with perfectly assortative mating
  organisms.sort((a, b) => a.iq - b.iq);
  var a = [];
  var b = [];
  var nextGeneration = [];
  for (var i = 0; i < organisms.length; i++) {
    i % 2 === 0 ? b.push(organisms[i]) : a.push(organisms[i]); 
  };

  while (a.length && b.length) {
    var aM = 1 - (0.01 * state.assortativeMating.value);
    var index = Math.min(b.length - 1, Math.floor(b.length * aM));
    //console.log(aM, a.length, b.length, index);
    nextGeneration.push(breed(a[0], b[index]));
    nextGeneration.push(breed(a[0], b[index]));
    a.shift();
    b.splice(index, 1);
  }

  return nextGeneration;
};

function Organism() {
  var x = {iq: 0, genes: []};
  for (var i = 0; i < state.polygenaity.value; i++) {
    var gene = Math.random();
    x.genes.push(gene);
    x.iq += gene;
  }

  x.iq /= state.polygenaity.value;

  return x;
}

function calculate() {
  var populationSize = state.populationSize.value;
  var numberOfGenerations = state.numberOfGenerations.value;
  var generations = [];
  var currentGeneration = []; 
  for (var i = 0; i < populationSize; i++) {
    currentGeneration.push(Organism());
  }

  for (var i = 0; i < numberOfGenerations; i++) {
    currentGeneration = selectMateAndBreed(currentGeneration);
    console.log(
      "Generation " + i,
      currentGeneration[0].iq,
      currentGeneration[currentGeneration.length - 1].iq
    );
    generations.push(currentGeneration);
  }

  renderChart(generations);

};

