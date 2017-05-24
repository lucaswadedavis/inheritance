$(document).ready(function(){init();});

////////////////////////////////////////////////

function init() {
 $('#population-size').slider(state.populationSize);
 $('#number-of-generations').slider(state.numberOfGenerations);
 $('#heritability').slider(state.heritability);
 $('#polygenaity').slider(state.polygenaity);
 $('#assortative-mating').slider(state.assortativeMating);
 $('button').on('click', calculate);
}

window.state = {
  populationSize: {min:2, max: 200, value: 100},
  numberOfGenerations: {min:10, max: 1000, value: 100},
  polygenaity: {min:1, max:100, value:50},
  heritability: {min:0, max:100, value:50},
  assortativeMating: {min:-100, max:100, value:0}
}

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
  // heritability stuff goes here
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

  for (var i = 0; i < a.length; i++) {
    // a is odd and never shorter than b
    // assume a stable population, so each breeding pair would produce two offspring
    // this too may be a good target for manipulation later
    nextGeneration.push(breed(a[i], b[i]));
    nextGeneration.push(breed(a[i], b[i]));
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
  var populationSize = 100;
  var numberOfGenerations = 100;
  var generations = [];
  var currentGeneration = []; 
  for (var i = 0; i < populationSize; i++) {
    currentGeneration.push(Organism());
    generations.push(currentGeneration);
  }
  console.log(currentGeneration[0]);

  for (var i = 0; i < numberOfGenerations; i++) {
    currentGeneration = selectMateAndBreed(currentGeneration);
    console.log(
      "Generation " + i,
      currentGeneration[0].iq,
      currentGeneration[currentGeneration.length - 1].iq
    );
    generations.push(currentGeneration);
  }

}

};
