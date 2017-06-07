$(document).ready(function(){init();});

// TODO: get the correlation coefficient during the breeding cycle.

////////////////////////////////////////////////

var chance = new Chance();

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
};

function init() {
 $('#population-size').slider(state.populationSize);
 $('#number-of-generations').slider(state.numberOfGenerations);
 $('#heritability').slider(state.heritability);
 $('#polygenaity').slider(state.polygenaity);
 $('#assortative-mating').slider(state.assortativeMating);
 $('#fecundity').slider(state.fecundity);

 $('button').on('click', calculate);
}

function LastNameColors(generations) {
  var names = {}
  for (var i = 0; i < generations.length; i++) {
    for (var j = 0; j < generations[i].length; j++) {
      names[generations[i][j].lastName] = true;
    }
  }

  var step = 1 / (Object.keys(names).length);
  var hue = 0;
  for (var key in names) {
    hue += step;
    names[key] = hsl2rgb(hue, 0.77, 0.5);
  };
  return names;
}

function hsl2rgb(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return 'rgb(' + ([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]).join(',') + ')';
}


function renderChart(generations) {
  console.log(generations);
  $('#chart').empty();
  var graph = {nodes: [], edges: []};

  for (var x = 0; x < generations.length; x++) {
    for (var y = 0; y < generations[x].length; y++) {
      var node = generations[x][y];
      console.log(node.hue);
      graph.nodes.push({
        id: node.id,
        label: node.firstName + ' ' + node.lastName + ': ' + node.phenotype,
        x: 1 + x * 5,
        y: y,
        size: node.phenotype,
        //color: '#333'
        color: hsl2rgb(node.hue, 0.7, 0.5)
        //color: lastNameColors[node.lastName]
      });

      if (node.children && node.children.length) {
        for (var i = 0; i < node.children.length; i++) {
          graph.edges.push({
            id: node.id + ':' + node.children[i].id,
            source: node.id,
            target: node.children[i].id,
            size: 1,
            color: '#000'
          });
        }
      }
    }
  }

  return new sigma({graph: graph, container: 'chart'});
  //return renderC3Chart(generations);
};

function renderC3Chart(generations) {
  var uppers = ['uppers'];
  var lowers = ['lowers'];
  var averages = ['average'];
  var columns = [];
  for (var i = 0; i < generations[0].length; i++) {
    columns.push([chance.city()]);
  }

  for (var i = 0; i < generations.length; i++) {
    var generation = generations[i];
    var upper = -Infinity;
    var lower = Infinity;
    var sum = 0;
    var lineageIndex = 0;
    for (var j = 0; j < generation.length; j++) {
      if (generation[j].phenotype > upper) upper = generation[j].phenotype;
      if (generation[j].phenotype < lower) lower = generation[j].phenotype;
      sum += generation[j].phenotype;
      columns[lineageIndex].push(generation[j].phenotype);
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
  populationSize: {min:2, max: 200, value: 20},
  numberOfGenerations: {min:10, max: 50, value: 20},
  polygenaity: {min:1, max:100, value:8},
  heritability: {min:0, max:100, value:80},
  assortativeMating: {min:0, max:100, value:90},
  fecundity: {min:0, max:200, value:100}
}

state.populationSize.slide = function(event, ui) {
  state.populationSize.value = ui.value;
  $("#population-size-title").text("Population Size: " + ui.value);
};


state.fecundity.slide = function(event, ui) {
  state.fecundity.value = ui.value;
  var value = 0.01 * (ui.value - 100);
  $("#fecundity-title").text("Fecundity: " + value);
};


state.numberOfGenerations.slide = function(event, ui) {
  state.numberOfGenerations.value = ui.value;
  $("#number-of-generations-title").text("Number of Generations: " + ui.value);
};


state.heritability.slide = function(event, ui) {
  state.heritability.value = ui.value;
  $("#heritability-title").text("Heritability: " + ui.value + "%");
};


state.assortativeMating.slide = function(event, ui) {
  state.assortativeMating.value = ui.value;
  var coefficient = ("" + ((ui.value * 0.02) - 1)).slice(0, 6);
  $("#assortative-mating-title").text("Assortative Mating: " + coefficient);
};


state.polygenaity.slide = function(event, ui) {
  state.polygenaity.value = ui.value;
  var value = ("" + (100 / ui.value)).slice(0, 6);
  var message = "Polygenaity: " + ui.value + " genes involved "
  message += "with an average importance of " + value + "% each";
  $("#polygenaity-title").text(message);
};

function breed(a, b) {
  var x = Organism();
  x.genes = [];
  x.mother = a;
  x.father = b;
  x.hue = (x.father.hue + x.mother.hue) / 2;
  // PATRIARCHY!
  x.lastName = b.lastName;
  a.children.push(x);
  b.children.push(x);
  a.partner = b;
  b.partner = a;
  for (var i = 0; i < a.genes.length; i++) {
    var gene = Math.random() > 0.5 ? a.genes[i] : b.genes[i];
    x.phenotype += gene;
    x.genes.push(gene);
  }
  x.phenotype /= state.polygenaity.value;
  // the heritability stuff, because the slider only deals with ints
  var h = 0.01 * state.heritability.value;
  x.phenotype = (h * x.phenotype) + ((1 - h) * Math.random());
  return x;
};

function selectMateAndBreed(organisms, colorize) {
  organisms.sort((a, b) => a.phenotype - b.phenotype);
  var a = [];
  var b = [];
  var nextGeneration = [];
  for (var i = 0; i < organisms.length; i++) {
    i % 2 === 0 ? b.push(organisms[i]) : a.push(organisms[i]); 
  };

  while (a.length && b.length) {
    var aM = 1 - (0.01 * state.assortativeMating.value);
    var index = Math.min(b.length - 1, Math.floor(b.length * aM));
    nextGeneration.push(breed(a[0], b[index]));
    nextGeneration.push(breed(a[0], b[index]));
    a.shift();
    b.splice(index, 1);
  }

  return nextGeneration;
};

function Organism() {
  var x = {
    phenotype: 0,
    id: uuid(),
    mother: null,
    father: null,
    partner: null,
    children: [],
    hue: Math.random(),
    genes: [],
    firstName: chance.first(),
    lastName: chance.last(),
  };
  for (var i = 0; i < state.polygenaity.value; i++) {
    var gene = Math.random();
    x.genes.push(gene);
    x.phenotype += gene;
  }

  x.phenotype /= state.polygenaity.value;

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
  currentGeneration.sort((a, b) => a.phenotype - b.phenotype);
  var hue = 0;
  for (var i = 0; i < currentGeneration.length; i++) {
    hue += 1 / populationSize;
    currentGeneration[i].hue = hue;
    console.log('hue', currentGeneration[i].hue);
  }


  generations.push(currentGeneration);
  for (var i = 0; i < numberOfGenerations; i++) {
    currentGeneration = selectMateAndBreed(currentGeneration);
    /*
    console.log(
      "Generation " + i,
      currentGeneration[0].phenotype,
      currentGeneration[currentGeneration.length - 1].phenotype
    );
    */
    currentGeneration.sort((a, b) => a.phenotype - b.phenotype);
    generations.push(currentGeneration);
  }

  renderChart(generations);

};

