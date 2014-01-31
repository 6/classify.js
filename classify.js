(function(global) {
  var each = function(arr, iterator, context) {
    for(var i = 0; i < arr.length; i++) {
      iterator.call(context, arr[i], i);
    }
  };

  var reduce = function(arr, iterator, memo, context) {
    var initial = arguments.length > 2;
    for(var i = 0; i < arr.length; i++) {
      if (!initial) {
        memo = arr[i];
        initial = true;
      }
      else {
        memo = iterator.call(context, memo, arr[i], i, arr);
      }
    }
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
    return Object.keys(this.labelCounts);
  };

  // P(Features | Label)
  Classifier.prototype.__probabilityOfFeaturesGivenLabel = function(features, label) {
    return reduce(features, function(sum, feature) {
      return sum * this.__probabilityOfFeatureGivenLabel(feature, label);
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
    return this.__labels().length; //TODO- check
  };

  Classifier.prototype.__assumedProbability = function() {
    return 0.5 / (this.__totalFeatures() / 2);
  };

  global.Classifier = Classifier;
})(this);
