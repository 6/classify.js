(function(global) {
  var isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  var objectKeys = Object.keys || function(obj) {
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    return keys;
  };

  var each = function(obj, iterator, context) {
    if (isArray(obj)) {
      for(var i = 0; i < obj.length; i++) {
        iterator.call(context, obj[i], i);
      }
    }
    else {
      var keys = objectKeys(obj);
      for(var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
      }
    }
  };

  var reduce = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    each(obj, function(value, i) {
      if (!initial) {
        memo = value;
        initial = true;
      }
      else {
        memo = iterator.call(context, memo, value, i);
      }
    });
    return memo;
  };

  var Classifier = function() {
    this.reset();
  };

  Classifier.prototype.reset = function() {
    this.featureCounts = {};
    this.labelCounts = {};
  };

  Classifier.prototype.train = function(features, label) {
    each(features, function(feature) {
      this.featureCounts[label] = this.featureCounts[label] || {};
      var featureCount = this.featureCounts[label][feature] || 0;
      this.featureCounts[label][feature] = featureCount + 1;
    }, this);
    this.labelCounts[label] = (this.labelCounts[label] || 0) + 1;
  };

  Classifier.prototype.classify = function(features) {
    var scores = {};
    each(this.__labels(), function(label) {
      // P(Label | Features) = P(Features | Label) * P(Label)
      scores[label] = this.__probabilityOfFeaturesGivenLabel(features, label) * this.__probabilityOfLabel(label);
    }, this);
    return scores;
  };

  Classifier.prototype.__labels = function() {
    return objectKeys(this.labelCounts);
  };

  // P(Features | Label)
  Classifier.prototype.__probabilityOfFeaturesGivenLabel = function(features, label) {
    return reduce(features, function(product, feature) {
      return product * this.__probabilityOfFeatureGivenLabel(feature, label);
    }, 1, this);
  };

  // P(Feature | Label)
  Classifier.prototype.__probabilityOfFeatureGivenLabel = function(feature, label) {
    if((this.featureCounts[label][feature] || 0) === 0) {
      return this.__assumedProbability();
    }
    return this.featureCounts[label][feature] / this.labelCounts[label];
  };

  // P(Label)
  Classifier.prototype.__probabilityOfLabel = function(label) {
    return this.labelCounts[label] / this.__totalFeatures();
  };

  Classifier.prototype.__totalFeatures = function() {
    return reduce(this.labelCounts, function(sum, labelCount) {
      return sum + labelCount;
    });
  };

  Classifier.prototype.__assumedProbability = function() {
    return 0.5 / (this.__totalFeatures() / 2);
  };

  global.Classifier = Classifier;
})(this);
