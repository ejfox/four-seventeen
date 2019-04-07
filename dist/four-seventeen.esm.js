import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { range, hsl } from 'd3';
import _ from 'lodash';
import Chance from 'chance';
import SimplexNoise from 'simplex-noise';

const argv = yargs.alias('s', 'seed').argv;

// fs = require('fs');
// d3 = require('d3');
// _ = require('lodash');
// canvasModule = require('canvas-prebuilt');
// Chance = require('chance');
// SimplexNoise = require('simplex-noise');
// path = require('path');
// argv = require('yargs').alias('s', 'seed').argv;



var main = GenArt = (function() {
  function GenArt(seed, options) {
    this.tick = bind(this.tick, this);
    this.makeParticles = bind(this.makeParticles, this);
    this.init = bind(this.init, this);
    this.seed = seed;
    this.count = 500;
    this.numTicks = 1;
    this.bgColor = 'black';
    this.opacity = 0.88;
    this.width = 1080;
    this.height = 1080;
    if (options) {
      console.log('\nOptions:', options);
      Object.assign(this, options);
    }
  }

  GenArt.prototype.makeCanvas = function() {
    this.canvas = canvasModule.createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');
    if (this.blendMode) {
      this.ctx.globalCompositeOperation = this.blendMode;
    }
    this.ctx.fillStyle = this.bgColor;
    return this.ctx.fillRect(0, 0, this.width, this.height);
  };

  GenArt.prototype.init = function(options, callback) {
    var countMin;
    if (options == null) {
      options = {};
    }
    this.chance = new Chance(this.seed);
    this.simplex = new SimplexNoise();
    if (this.randomizeCount) {
      countMin = _.clamp(this.count * 0.25, 1, 100);
      this.count = this.chance.integer({
        min: this.count * 0.25,
        max: this.count
      });
    }
    if (this.randomizeTicks) {
      this.numTicks = this.chance.integer({
        min: this.numTicks * 0.1,
        max: this.numTicks
      });
      if (this.minTicks) {
        this.numTicks = _.clamp(this.numTicks, this.minTicks, this.numTicks);
      }
    }
    console.log('\n');
    console.log('🌱 init seed: ', this.seed);
    console.log('📏 width: ', this.width);
    console.log('📏 height: ', this.height);
    this.makeCanvas();
    this.makeParticles();
    this.tickTil(this.numTicks);
    if (options.save) {
      this.saveFile();
    }
    if (callback) {
      return callback();
    }
  };

  GenArt.prototype.makeParticles = function() {
    this.data = range(this.count).map((function(_this) {
      return function() {
        var c, offset, offsetAmount, x, y;
        offsetAmount = 250;
        offset = {};
        offset.x = _this.chance.floating({
          min: -offsetAmount,
          max: offsetAmount
        });
        offset.y = _this.chance.floating({
          min: -offsetAmount,
          max: offsetAmount
        });
        x = (_this.width / 2) + offset.x;
        y = (_this.height / 2) + offset.y;
        c = hsl('white');
        c.opacity = _this.opacity;
        return {
          x: x,
          y: y,
          color: c.toString()
        };
      };
    })(this));
    return this.data;
  };

  GenArt.prototype.tick = function() {
    if (!this.ticks) ;
    this.ticks++;
    this.data.forEach((function(_this) {
      return function(d, i) {
        if (_this.chance.bool({
          likelihood: 50
        })) {
          d.x += _this.chance.floating({
            min: -8,
            max: 8
          });
        }
        if (_this.chance.bool({
          likelihood: 50
        })) {
          return d.y += _this.chance.floating({
            min: -8,
            max: 8
          });
        }
      };
    })(this));
    this.ctx.beginPath();
    this.ctx.rect(d.x, d.y, 2, 2);
    this.ctx.fillStyle = d.color;
    this.ctx.fill();
    return this.ctx.closePath();
  };

  GenArt.prototype.tickTil = function(count) {
    var j, ref;
    console.log('💫 ' + this.data.length + ' particles ');
    console.log('💯 ' + count + ' ticks');
    console.time('⏱️  ticked for');
    for (j = 0, ref = count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
      this.tick();
    }
    return console.timeEnd('⏱️  ticked for');
  };

  GenArt.prototype.saveFile = function(filename, callback) {
    var file, fileOutput, stream;
    if (!filename && !this.filename) {
      filename = path.basename(__filename, '.js') + '-' + this.seed;
    } else if (!filename && this.filename) {
      filename = this.filename;
    }
    fileOutput = './dist/' + filename + '.png';
    file = fs.createWriteStream(fileOutput);
    stream = this.canvas.pngStream().pipe(file);
    return stream.on('finish', function() {
      console.log('💾  OUTPUT ➡️ ' + fileOutput);
      if (callback) {
        return callback();
      }
    });
  };

  return GenArt;

})();

run = function() {
  var genart, seed;
  if (argv.seed) {
    seed = argv.seed;
  } else {
    seed = Date.now();
  }
  genart = new GenArt(seed);
  if (argv.height) {
    genart.height = argv.height;
  }
  if (argv.width) {
    genart.width = argv.width;
  }
  if (argv.count) {
    genart.count = argv.count;
  }
  if (argv.ticks) {
    genart.numTicks = argv.ticks;
  }
  return genart.init({
    save: true
  });
};

if (require.main === module) {
  run();
}

module.exports = GenArt;

export default main;
